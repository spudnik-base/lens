/**
 * Content build script, xlsx to json.
 *
 * Reads every *.xlsx file in content/source/ and writes the matching
 * JSON to content/generated/. Enforces validations and fails loudly
 * on any violation.
 *
 * The Cards sheet uses a 6-column format:
 *   Q ID | Q# | Linking Question | Example | Why | Role
 *
 * Each Q ID (e.g. "1a", "1b") becomes one Card with 3 options
 * (2 fits + 1 impostor). Each Q# has exactly 2 sub-cards (a + b).
 *
 * Run via `npm run build:content`. Wired into predev/prebuild.
 */
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import type { Subject, SubjectId, Card, Option, Theme } from '../src/types/subject.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(__dirname, 'source');
const OUT_DIR = join(__dirname, 'generated');

const SUBJECT_NAMES: Record<SubjectId, string> = {
  biology: 'IB Biology',
  chemistry: 'IB Chemistry',
  physics: 'IB Physics',
};

function die(file: string, msg: string): never {
  console.error(`\n[content/build] ${file}: ${msg}\n`);
  process.exit(1);
}

/**
 * Normalize a cell value. Strips smart quotes, non-breaking spaces,
 * and em-dashes (house-style rule: compound nouns get hyphens, clause
 * joiners become period + capitalize).
 */
function normalize(v: unknown): string {
  if (v == null) return '';
  let s = String(v).trim();
  s = s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u00A0/g, ' ');
  s = s.replace(/\u2013/g, '\u2014');
  s = s.replace(/(\w)\u2014(\w)/g, '$1-$2');
  s = s.replace(/ \u2014 (\w)/g, (_m, c: string) => `. ${c.toUpperCase()}`);
  s = s.replace(/\u2014/g, ' ').replace(/ {2,}/g, ' ').trim();
  return s;
}

/**
 * Convert chemical formula numbers to Unicode subscripts so "H2O"
 * renders as "H₂O", "CO2" as "CO₂", etc. Matches an element symbol
 * (uppercase letter, optional lowercase) immediately followed by
 * digits. Applied to example text, whys, and linking questions.
 */
const SUB: Record<string, string> = {
  '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083',
  '4': '\u2084', '5': '\u2085', '6': '\u2086', '7': '\u2087',
  '8': '\u2088', '9': '\u2089',
};

function subscriptFormulas(s: string): string {
  return s.replace(/([A-Z][a-z]?)(\d+)/g, (_m, letters: string, digits: string) => {
    return letters + digits.split('').map((d) => SUB[d] || d).join('');
  });
}

function readCell(row: ExcelJS.Row, col: number): string {
  const cell = row.getCell(col);
  const v = cell.value as unknown;
  if (v && typeof v === 'object' && 'richText' in (v as object)) {
    const rt = (v as { richText: Array<{ text: string }> }).richText;
    return normalize(rt.map((r) => r.text).join(''));
  }
  if (v && typeof v === 'object' && 'result' in (v as object)) {
    return normalize((v as { result: unknown }).result);
  }
  return normalize(v);
}

function readInt(row: ExcelJS.Row, col: number): number | null {
  const cell = row.getCell(col);
  const v = cell.value;
  if (typeof v === 'number') return Math.trunc(v);
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return parseInt(v, 10);
  return null;
}

async function buildSubject(subjectFile: string): Promise<void> {
  const id = basename(subjectFile, extname(subjectFile)) as SubjectId;
  if (!(id in SUBJECT_NAMES)) {
    die(subjectFile, `unknown subject id "${id}", must be biology | chemistry | physics`);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(subjectFile);

  const cardsSheet = wb.getWorksheet('Cards');
  const questionsSheet = wb.getWorksheet('Questions');
  if (!cardsSheet) die(subjectFile, 'missing "Cards" sheet');
  if (!questionsSheet) die(subjectFile, 'missing "Questions" sheet');

  // --- Questions sheet ---------------------------------------------------
  const questionsMap = new Map<number, string>();
  const seenQ = new Set<number>();
  questionsSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
    if (rowNum === 1) return;
    const q = readInt(row, 1);
    const text = readCell(row, 2);
    if (q == null) die(subjectFile, `Questions row ${rowNum}: missing or non-integer Q#`);
    if (!text) die(subjectFile, `Questions row ${rowNum}: empty linking question text`);
    if (seenQ.has(q)) die(subjectFile, `Questions sheet: duplicate Q# ${q}`);
    seenQ.add(q);
    questionsMap.set(q, subscriptFormulas(text));
  });
  if (questionsMap.size === 0) die(subjectFile, 'Questions sheet is empty');

  const qNums = [...questionsMap.keys()].sort((a, b) => a - b);
  for (let i = 0; i < qNums.length; i++) {
    if (qNums[i] !== i + 1) {
      die(subjectFile, `Questions sheet: Q# sequence is not contiguous, expected ${i + 1}, got ${qNums[i]}`);
    }
  }
  const questions: string[] = qNums.map((n) => questionsMap.get(n)!);

  // --- Cards sheet -------------------------------------------------------
  // 6 columns: Q ID | Q# | Linking Question | Example | Why | Role
  // Group rows by Q ID (e.g. "1a", "1b"). Each Q ID becomes one Card.
  const cardsBySubId = new Map<string, { qIndex: number; options: Option[] }>();
  const subIdsPerQ = new Map<number, string[]>();

  cardsSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
    if (rowNum === 1) return;
    const subId = readCell(row, 1);
    const q = readInt(row, 2);
    const example = subscriptFormulas(readCell(row, 4));
    const why = subscriptFormulas(readCell(row, 5));
    const roleRaw = readCell(row, 6);

    if (!subId) die(subjectFile, `Cards row ${rowNum}: missing Q ID`);
    if (q == null) die(subjectFile, `Cards row ${rowNum}: missing or non-integer Q#`);
    if (!questionsMap.has(q)) {
      die(subjectFile, `Cards row ${rowNum}: Q# ${q} not found in Questions sheet`);
    }
    if (!example) die(subjectFile, `Cards row ${rowNum}: empty Example`);
    if (!why) die(subjectFile, `Cards row ${rowNum}: empty Why`);
    const role = roleRaw.toLowerCase();
    if (role !== 'fit' && role !== 'impostor') {
      die(subjectFile, `Cards row ${rowNum}: Role "${roleRaw}" must be fit or IMPOSTOR`);
    }

    const opt: Option = role === 'impostor' ? { text: example, why, impostor: true } : { text: example, why };
    const entry = cardsBySubId.get(subId) ?? { qIndex: q, options: [] };
    entry.options.push(opt);
    cardsBySubId.set(subId, entry);

    const subs = subIdsPerQ.get(q) ?? [];
    if (!subs.includes(subId)) subs.push(subId);
    subIdsPerQ.set(q, subs);
  });

  // Validate: each Q ID has exactly 3 options, exactly 1 impostor.
  for (const [subId, entry] of cardsBySubId) {
    if (entry.options.length !== 3) {
      die(subjectFile, `Q ID "${subId}": expected 3 options, got ${entry.options.length}`);
    }
    const imps = entry.options.filter((o) => o.impostor);
    if (imps.length !== 1) {
      die(subjectFile, `Q ID "${subId}": expected exactly 1 IMPOSTOR, got ${imps.length}`);
    }
  }

  // Validate: each Q# has exactly 2 sub-cards.
  for (const q of qNums) {
    const subs = subIdsPerQ.get(q);
    if (!subs || subs.length !== 2) {
      die(subjectFile, `Q${q}: expected 2 sub-cards (a + b), got ${subs ? subs.length : 0}`);
    }
  }

  // --- HL classification ---------------------------------------------------
  // If the Cards sheet has a 7th column "Level", read it. Otherwise fall
  // back to keyword-based detection of HL-only content (references to
  // topics like entropy, special relativity, cladistics, etc.).
  const hasLevelCol = readCell(cardsSheet.getRow(1), 7).toLowerCase() === 'level';
  const hlSubIds = new Set<string>();

  if (hasLevelCol) {
    cardsSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
      if (rowNum === 1) return;
      const sid = readCell(row, 1);
      const lv = readCell(row, 7).toLowerCase();
      if (lv === 'hl' && sid) hlSubIds.add(sid);
    });
  } else {
    // Keyword fallback: scan question + example + why text for HL topics.
    const HL_PATTERNS: RegExp[] = [
      // Biology HL
      /origin of cells/i, /endosymbi/i, /\bvirus\b/i, /\bviral\b/i, /bacteriophage/i,
      /cladist/i, /cladogram/i, /phylogen/i, /binomial nomenclature/i,
      /sarcomere/i, /sliding filament/i, /\bactin\b/i, /\bmyosin\b/i,
      /neurotransmitter/i, /synap(?:se|tic)/i, /gene expression/i,
      /epigenet/i, /transcription factor/i, /operon/i,
      // Chemistry HL
      /\bentropy\b/i, /spontane/i, /\bgibbs\b/i, /free energy/i,
      // Physics HL
      /rigid body/i, /moment of inertia/i, /angular momentum/i,
      /special relativity/i, /lorentz/i, /time dilation/i, /length contraction/i,
      /relativistic/i, /twin paradox/i,
      /thermodynamic/i, /carnot/i, /heat engine/i,
      /\binduction\b/i, /\bfaraday\b/i, /\blenz\b/i, /induced emf/i, /magnetic flux/i,
      /quantum/i, /wave.particle/i, /de broglie/i, /photoelectric/i,
      /uncertainty principle/i, /wave function/i, /bohr model/i,
    ];
    for (const [subId, entry] of cardsBySubId) {
      const qText = questionsMap.get(entry.qIndex) ?? '';
      const blob = qText + ' ' + entry.options.map((o) => o.text + ' ' + o.why).join(' ');
      if (HL_PATTERNS.some((re) => re.test(blob))) {
        hlSubIds.add(subId);
      }
    }
  }

  // Build sorted cards array: ordered by Q# then sub-card letter.
  const allSubIds = [...cardsBySubId.keys()].sort((a, b) => {
    const qa = cardsBySubId.get(a)!.qIndex;
    const qb = cardsBySubId.get(b)!.qIndex;
    if (qa !== qb) return qa - qb;
    return a.localeCompare(b);
  });
  const cards: Card[] = allSubIds.map((subId) => {
    const entry = cardsBySubId.get(subId)!;
    const card: Card = { qIndex: entry.qIndex, subId, options: entry.options };
    if (hlSubIds.has(subId)) card.hl = true;
    return card;
  });

  // --- Themes sheet (optional) -------------------------------------------
  let themes: Theme[] | undefined;
  const themesSheet = wb.getWorksheet('Themes');
  if (themesSheet) {
    const list: Theme[] = [];
    const assigned = new Map<number, string>();
    themesSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
      if (rowNum === 1) return;
      const letter = readCell(row, 1);
      const name = readCell(row, 2);
      const qList = readCell(row, 3);
      if (!letter || !name || !qList) return;
      const indices = qList
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => parseInt(s, 10));
      for (const idx of indices) {
        if (!Number.isFinite(idx) || !questionsMap.has(idx)) {
          die(subjectFile, `Themes row ${rowNum}: Q# ${idx} not in Questions sheet`);
        }
        if (assigned.has(idx)) {
          die(subjectFile, `Themes: Q# ${idx} assigned to both ${assigned.get(idx)} and ${letter}`);
        }
        assigned.set(idx, letter);
      }
      list.push({ letter, name, questionIndices: indices });
    });
    for (const q of qNums) {
      if (!assigned.has(q)) die(subjectFile, `Themes: Q# ${q} is not assigned to any theme`);
    }
    themes = list;
  }

  const subject: Subject = {
    id,
    name: SUBJECT_NAMES[id],
    ...(themes && { themes }),
    questions,
    cards,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `${id}.json`);
  writeFileSync(outPath, JSON.stringify(subject, null, 2) + '\n', 'utf8');
  console.log(
    `[content/build] ${id}: ${questions.length} questions, ${cards.length} cards (${cards.length / questions.length} per lens), ${
      themes ? themes.length + ' themes' : 'no themes'
    }`
  );
}

async function main() {
  mkdirSync(SOURCE_DIR, { recursive: true });
  const sources = readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith('.xlsx') && !f.startsWith('~$'))
    .map((f) => join(SOURCE_DIR, f));

  if (sources.length === 0) {
    console.warn('[content/build] no xlsx files found in content/source/, nothing to build');
    return;
  }
  for (const src of sources) {
    await buildSubject(src);
  }
}

main().catch((err) => {
  console.error('[content/build] fatal:', err);
  process.exit(1);
});
