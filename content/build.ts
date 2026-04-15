/**
 * Content build script — xlsx → json.
 *
 * Reads every *.xlsx file in content/source/ and writes the matching
 * JSON to content/generated/. Enforces the validations in Section 9 of
 * lens-spec.md and fails loudly on any violation.
 *
 * Run via `npm run build:content`. Wired into `predev` and `prebuild` so
 * contributors don't forget to rebuild after editing the xlsx.
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
  // Plain stderr + nonzero exit so `npm run dev` / `npm run build` halts.
  console.error(`\n[content/build] ${file}: ${msg}\n`);
  process.exit(1);
}

/** Normalize a cell: trim, collapse autocorrect smart-quotes → straight. */
function normalize(v: unknown): string {
  if (v == null) return '';
  const s = String(v).trim();
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '—') // keep em-dashes; normalize en-dash to em
    .replace(/\u00A0/g, ' '); // nbsp → space
}

function readCell(row: ExcelJS.Row, col: number): string {
  const cell = row.getCell(col);
  // ExcelJS returns different shapes for formulas, rich text, etc. Coerce.
  const v = cell.value as unknown;
  if (v && typeof v === 'object' && 'richText' in (v as object)) {
    // Rich text: concat the runs.
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
    die(subjectFile, `unknown subject id "${id}" — must be biology | chemistry | physics`);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(subjectFile);

  const cardsSheet = wb.getWorksheet('Cards');
  const questionsSheet = wb.getWorksheet('Questions');
  if (!cardsSheet) die(subjectFile, 'missing "Cards" sheet');
  if (!questionsSheet) die(subjectFile, 'missing "Questions" sheet');

  // --- Questions sheet ----------------------------------------------------
  const questionsMap = new Map<number, string>();
  const seenQ = new Set<number>();
  questionsSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
    if (rowNum === 1) return; // header
    const q = readInt(row, 1);
    const text = readCell(row, 2);
    if (q == null) die(subjectFile, `Questions row ${rowNum}: missing or non-integer Q#`);
    if (!text) die(subjectFile, `Questions row ${rowNum}: empty linking question text`);
    if (seenQ.has(q)) die(subjectFile, `Questions sheet: duplicate Q# ${q}`);
    seenQ.add(q);
    questionsMap.set(q, text);
  });
  if (questionsMap.size === 0) die(subjectFile, 'Questions sheet is empty');

  // Build the ordered questions array (1..N must be contiguous).
  const qNums = [...questionsMap.keys()].sort((a, b) => a - b);
  for (let i = 0; i < qNums.length; i++) {
    if (qNums[i] !== i + 1) {
      die(
        subjectFile,
        `Questions sheet: Q# sequence is not contiguous — expected ${i + 1}, got ${qNums[i]}`
      );
    }
  }
  const questions: string[] = qNums.map((n) => questionsMap.get(n)!);

  // --- Cards sheet --------------------------------------------------------
  // one row per option, 5 rows per question
  const cardsByQ = new Map<number, Option[]>();
  cardsSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
    if (rowNum === 1) return; // header
    const q = readInt(row, 1);
    const example = readCell(row, 3);
    const why = readCell(row, 4);
    const roleRaw = readCell(row, 5);
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
    const arr = cardsByQ.get(q) ?? [];
    arr.push(opt);
    cardsByQ.set(q, arr);
  });

  // Validate shape: each question has exactly 5 options, exactly 1 impostor.
  for (const q of qNums) {
    const opts = cardsByQ.get(q);
    if (!opts) die(subjectFile, `Q${q}: no cards found`);
    if (opts.length !== 5) {
      die(subjectFile, `Q${q}: expected 5 options, got ${opts.length}`);
    }
    const impostors = opts.filter((o) => o.impostor);
    if (impostors.length !== 1) {
      die(subjectFile, `Q${q}: expected exactly 1 IMPOSTOR, got ${impostors.length}`);
    }
  }

  const cards: Card[] = qNums.map((q) => ({ qIndex: q, options: cardsByQ.get(q)! }));

  // --- Themes sheet (optional) --------------------------------------------
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
      if (!letter || !name || !qList) return; // skip blank rows
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
          die(
            subjectFile,
            `Themes: Q# ${idx} assigned to both ${assigned.get(idx)} and ${letter}`
          );
        }
        assigned.set(idx, letter);
      }
      list.push({ letter, name, questionIndices: indices });
    });
    // Every Q# referenced exactly once across theme rows.
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
    `[content/build] ${id}: ${questions.length} questions, ${cards.length} cards, ${
      themes ? themes.length + ' themes' : 'no themes'
    } → ${outPath}`
  );
}

async function main() {
  mkdirSync(SOURCE_DIR, { recursive: true });
  const sources = readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith('.xlsx') && !f.startsWith('~$')) // skip Excel lock files
    .map((f) => join(SOURCE_DIR, f));

  if (sources.length === 0) {
    console.warn('[content/build] no xlsx files found in content/source/ — nothing to build');
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
