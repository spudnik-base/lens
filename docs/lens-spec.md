# Lens — Build Spec

A mobile review tool for IB students. Each subject's "linking questions" are treated as conceptual lenses; students examine biological (or, in future versions, chemical and physical) examples and decide whether each one genuinely fits the lens or is an "impostor" that only superficially appears to.

This document specifies the MVP build for IB Biology and the architecture for adding IB Chemistry and IB Physics in subsequent versions.

---

## 1. MVP scope

The MVP ships with **IB Biology only** and three modes: Study, Lens Sort, and Browse. The data layer, navigation, and visual system must be designed so that adding a new subject is a content-only operation — drop in a new dataset, no UI rewrites.

Out of scope for MVP: accounts, sync, persistent progress beyond a single session, leaderboards, social features, teacher dashboards, student-contributed content, push notifications, dark mode.

---

## 2. Core concept

IB's subject guides include sets of "linking questions" at the end of each topic. They're not exam prompts with single answers; they're holistic lenses meant to produce what the IB calls "networked knowledge" — a web of conceptual connections rather than a list of isolated facts. Lens turns each linking question into a sortable lens.

The defining mechanic is the **impostor**. For each linking question, four examples genuinely illuminate the lens, and one example *looks like* it should fit but on close inspection doesn't. Identifying the impostor and being able to explain why is what teaches the lens.

The impostor is never "a weaker fit among several valid ones." It must fail the lens on close inspection. See the impostor rubric below.

---

## 3. Data model

```ts
type Subject = {
  id: string;                  // 'biology' | 'chemistry' | 'physics'
  name: string;                // 'IB Biology'
  themes?: Theme[];            // optional theme groupings (Biology has these)
  questions: string[];         // the linking questions, indexed 1..N
  cards: Card[];               // one card per question
};

type Theme = {
  letter: string;              // 'A' | 'B' | 'C' | 'D'
  name: string;                // 'Unity & diversity'
  questionIndices: number[];   // 1-based indices into Subject.questions
};

type Card = {
  qIndex: number;              // 1-based index into Subject.questions
  options: Option[];           // exactly 5 options, exactly 1 with impostor: true
};

type Option = {
  text: string;                // The example, short noun phrase
  why: string;                 // One sentence explaining why it fits / why it's the impostor
  impostor?: true;             // Present on exactly one option per card
};
```

**Invariants:**
- Each subject has exactly one card per linking question.
- Each card has exactly 5 options.
- Each card has exactly 1 option with `impostor: true`.
- `text` should fit on two lines at ~20px on a 340px screen (aim under 60 characters).
- `why` is one sentence, ideally under 90 characters.

The biology dataset of 32 questions, 4 themes, and 32 cards (160 options) is provided in `lens-cards.xlsx` and `linking-lenses.jsx`. For a fresh build, port this into `/content/biology.ts` (or `.json`) following the schema above.

---

## 4. Game modes

### 4.1 Study mode

Slow, deliberate review. Pedagogically the heart of the app.

**Flow:**
1. Shuffle the deck of cards for the current subject.
2. Show the linking question at the top of the card.
3. Show **three** options only: the impostor plus two randomly chosen fits, in shuffled order. Never show all five — the variety across runs is part of the pedagogy.
4. User taps the option they think is the impostor.
5. Reveal: the impostor card gets a diagonal red "IMPOSTOR" stamp; the fits show small green hand-drawn checkmarks. Each option's `why` appears beneath its text.
6. User advances ("turn the page →").
7. When the deck is exhausted, reshuffle and continue.

**Selection function:**
```ts
function pickStudyOptions(card: Card): number[] {
  const impostorIdx = card.options.findIndex(o => o.impostor);
  const fitIdxs = card.options.map((_, i) => i).filter(i => i !== impostorIdx);
  const chosenFits = shuffle(fitIdxs).slice(0, 2);
  return shuffle([impostorIdx, ...chosenFits]);
}
```

### 4.2 Lens Sort mode

Solo timed game. Fast pattern recognition under pressure.

**Flow:**
1. 60-second timer starts.
2. Shuffle the deck.
3. For each card, the linking question is the persistent "lens" header.
4. Present all 5 options for that card one at a time in shuffled order.
5. User taps **Fits** or **Does not fit** for each.
6. Brief flash on the page (green for correct, red for incorrect, ~150ms), then immediately the next option.
7. After all 5 options of a card are judged, advance to the next card with a new lens.
8. If the deck is exhausted before the timer ends, reshuffle and continue.
9. When the timer hits 0, show a results page: score (correct / total judged) and a review list of **only the incorrect answers**, each with the linking question, the example, what the user said vs. the truth, and the why.

Lens Sort uses all 5 options because (a) the impostor among 5 is harder to spot than among 3, and (b) time pressure is the core mechanic — more options per card means faster lens-switching.

### 4.3 Browse mode

A read-only Field Guide. All linking questions for the current subject, grouped by theme (where the subject defines themes), each tappable to expand and reveal its 5 options with whys and impostor markers. Doubles as a study aid and a content audit tool.

---

## 5. Impostor rubric

Writing impostors well is the editorial standard. A good impostor fails on one of four grounds, and the `why` should make the failure mode obvious:

1. **Wrong location or scale.** The process happens, but not where or at what level the lens asks about. *Example: "glycolysis" for the surfaces lens — happens in cytoplasm, not at a membrane.*
2. **Wrong aspect of a right-seeming process.** The process is relevant, but a different feature of it answers the lens. *Example: "crossing over" for genetic continuity — it's part of meiosis but generates variation, the opposite of continuity.*
3. **Adjacent but distinct category.** The example sits next to the lens topic without being inside it. *Example: "hemoglobin cooperative binding" for gas-exchange-and-metabolism — it's transport, which sits between exchange and metabolism and is neither.*
4. **Surface keyword match without substance.** A word in the example matches a word in the lens, but the connection is verbal only. *Example: "carbon-14 half-life" for doubling-and-halving — "half" in the name is a trap; radioactive decay isn't biological.*

If a student can plausibly argue the impostor *does* fit through a creative reframing, it's a weaker fit, not an impostor — rewrite it.

---

## 6. Visual design language

Lens is designed to feel nothing like Duolingo. The whole identity is **the naturalist's field notebook**: cream paper, ink illustrations, pinned specimen cards, hand-pressed rubber stamps, pencil marginalia. The user is a researcher examining specimens through a hand-held magnifying loupe, where the loupe is the active linking question.

### 6.1 Palette (strict)

| Role | Hex |
|------|-----|
| Page (background) | `#F2E9D0` |
| Card surface (raised) | `#FBF6E5` |
| Card border / dividers | `#c8bd9e` |
| Ink black (primary text, illustrations) | `#2A2520` |
| Pencil gray (annotations, secondary text) | `#8a8170` |
| Faded red ink (impostor, "does not fit") | `#9c3a2c` |
| Forest green ink ("fits", checkmarks) | `#2f5234` |
| Phone chrome (mockups only) | `#1f1d1a` |
| Body subtle text on cream | `#5a544a` |

Two ink colors maximum on any screen plus pencil gray. No other colors.

### 6.2 Typography

- **Serif italic** (EB Garamond, Cormorant, or similar humanist serif) for editorial content: linking questions, biological examples, explanatory whys, the "Field Guide" title plate.
- **Monospace** (IBM Plex Mono, JetBrains Mono, or similar) for marginalia: round counter, timer, tally-mark scores, section labels, instructions like "examining through" or "turn the page".
- Two weights only: regular 400 and medium 500. Never 600+ — heavy weights break the inkwell feel.
- **Sentence case** throughout, with one exception: rubber stamps use uppercase letterspacing because real stamps do.
- No sans-serif anywhere in the app.

### 6.3 Core motifs

**The loupe.** A hand-drawn ink illustration of a magnifying loupe is the signature element. It represents the active linking question. It appears full-size on the Lens Sort playfield and compact as a header on Study cards.

```svg
<!-- Full size: ~46×68 viewBox -->
<svg width="46" height="68" viewBox="0 0 46 68">
  <circle cx="22" cy="22" r="17" fill="#FBF6E5" stroke="#2A2520" stroke-width="1.6"/>
  <circle cx="22" cy="22" r="13" fill="none" stroke="#2A2520" stroke-width="0.5" opacity="0.35"/>
  <path d="M 13 17 Q 17 12 23 11" fill="none" stroke="#2A2520" stroke-width="0.6" opacity="0.45"/>
  <line x1="34" y1="34" x2="42" y2="46" stroke="#2A2520" stroke-width="2.5"/>
  <rect x="38" y="44" width="8" height="14" rx="1.5" fill="#2A2520" transform="rotate(-45 42 51)"/>
</svg>
```

**Specimen cards.** Cream-on-cream raised cards (`#FBF6E5` on `#F2E9D0`) with hairline tan border (`1px solid #c8bd9e`). The Lens Sort hero specimen card optionally has small "masking tape" rectangles at the top corners (slightly rotated) suggesting it's been physically pinned into a journal page.

**Rubber stamps.** Large circular borders (2.5px stroke) containing serif uppercase text with wide letterspacing (`letter-spacing: 0.1em` to `0.15em`). Slightly rotated (-5° and +4°) so they look hand-pressed. Used for "Fits" / "Does not fit" buttons in Lens Sort and as a diagonal "IMPOSTOR" stamp across the failed specimen in Study reveals.

**Hand-drawn checkmarks.** Small SVG paths, never Unicode `✓`:
```svg
<svg width="14" height="14" viewBox="0 0 14 14">
  <path d="M 2 7.5 L 5.5 11 L 12 3.5" fill="none" stroke="#2f5234"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Pencil tally marks.** Score is rendered as `| | | |`, not numerals. After 5, restart with a new group on a new line or run together — same convention as a lab notebook.

**Side thumb tabs.** On the Browse / Field Guide screen, the right edge has vertical tabs styled like the colored thumb cuts on a printed dictionary or birding guide. One tab per IB theme. Active tab is solid ink-black with cream text; inactive tabs are tan with ink-black text.

**Marginalia.** Small pencil-gray monospace annotations at unusual margins. "Round 01" in the top-left, timer in the top-center with a tiny loupe glyph beside it, tally-mark score in the top-right. Vertical "no. 14 of 32" up the right edge of the Lens Sort card.

**Ornaments.** A small ink line drawing under the Field Guide title — an undulating line with a dot, suggesting a leaf vein or a microorganism:
```svg
<svg width="50" height="14" viewBox="0 0 50 14">
  <path d="M 2 7 Q 12 2 25 7 Q 38 12 48 7" fill="none" stroke="#2A2520" stroke-width="0.8"/>
  <circle cx="25" cy="7" r="1.5" fill="#2A2520"/>
</svg>
```

### 6.4 Layout principles

- Mobile-first, single column, ~340px screen width
- Generous whitespace; hairline 1px tan dividers, never thick borders
- Asymmetry is welcome: stamps rotate slightly, marginalia sits at unusual margins, vertical text on edges is fine
- Everything should look placed by hand, nothing should look centered by algorithm

### 6.5 Anti-patterns (do not do)

- No gradients, drop shadows, glows, blurs, or neon effects
- No bright accent colors beyond the ink tones above
- No sans-serif type
- No emoji or icon fonts; all icons are hand-drawn SVG line work
- No animated celebrations, confetti, mascots, streak counters, XP bars, or progress rings
- No rounded pill buttons; verdict actions are circular rubber stamps, navigation is mono text with arrow glyphs (`→`)
- No bottom tab bar; navigation between modes happens from the home screen
- No dark mode; this app is paper, paper is cream

---

## 7. Screen specifications

### 7.1 Home / inside cover

The inside cover of a journal.

- Cream background, generous top padding
- Small mono caps subject label centered: `IB BIOLOGY`
- Title `Lens` in large serif italic (~52px), centered
- Subtitle in serif italic, smaller (~16px): "A field guide to the 32 linking questions"
- Ornament beneath the subtitle (the leaf-vein flourish)
- A spacer
- Three mode entries listed like a contents page: each one a row with a serif italic mode name on the left, mono description on the right, separated by a faint dotted line. Tap a row to enter the mode.
  - `Study` ………… `examine three specimens, find the impostor`
  - `Lens Sort` …… `60-second sorting against a single lens`
  - `Browse` ……… `the full field guide`
- At the bottom, mono pencil-gray credit line.

When future subjects exist, the subject label becomes a tappable picker that opens a small overlay listing available subjects.

### 7.2 Lens Sort (playing)

See the visual reference. Top-down:
- Mono status bar: `round 01` · timer with tiny loupe glyph (`◯ 0:47`) · tally-mark score (`| | | |`)
- Mono caps label: `EXAMINING THROUGH —`
- Loupe illustration (full size) + linking question in serif italic, gap 14px, baseline aligned
- Hairline divider (`1px solid #c8bd9e`)
- Specimen card (cream on cream) with two masking-tape corners; mono caps `SPECIMEN 03` label, then example in serif (~20px)
- Mono caps prompt: `DOES IT FIT THE LENS?`
- Two circular stamp buttons centered, gap 18px:
  - "Does not fit" — red ink, ~108×108, rotated -5°, two-line text
  - "Fits" — green ink, ~108×108, rotated +4°, single word
- Vertical mono annotation up the right edge: `no. 14 of 32`

Background flashes briefly green or red on tap (~150ms), then advances.

### 7.3 Lens Sort (results)

After the timer hits 0:
- Mono caps top: `ROUND COMPLETE`
- Centered: a large stamp-style circle showing `score / total` in serif (e.g. `12/14`)
- Mono caps label: `INCORRECT JUDGMENTS — REVIEW`
- A list of only the wrong answers, each as a mini specimen card with red border:
  - The linking question in mono caps small at the top
  - The example in serif
  - Mono small: `you said FITS · actually DOESN'T FIT` (or vice versa)
  - The why in serif italic, smaller, at the bottom
- Two stamp-style action buttons at the bottom: `Play again` and `Home`
- If no incorrect answers: a single line "A clean sweep" in serif italic centered.

### 7.4 Study (active card)

- Mono status bar: `study mode` · `card 14 / 32`
- Mono caps: `EXAMINING THROUGH`
- Compact loupe (32×46) + linking question in serif italic (smaller, ~14px), gap 12px
- Hairline divider
- Three specimen cards stacked, gap 11px. Each shows just the example text (~14px serif, weight 500) until tapped.
- Mono caps footer prompt: `TAP THE SPECIMEN THAT DOESN'T BELONG`

On tap: see Study (post-reveal).

### 7.5 Study (post-reveal)

- Same header as active state.
- The two fits show small hand-drawn green checkmarks in the top-right corner and their `why` beneath the example in serif italic gray (~12px, color `#5a544a`).
- The impostor card has its border switched from tan to red (`1.5px solid #9c3a2c`), shows a diagonal red `IMPOSTOR` stamp in the top-right corner (rotated 20°, partially clipped by the card edge), and shows its `why` underneath.
- Mono footer: `turn the page →` (tap anywhere to advance).

### 7.6 Browse (Field Guide)

- Mono status bar: `browse` · `32 lenses`
- Title plate, centered:
  - Mono caps: `IB BIOLOGY`
  - Serif italic large (~28px): `Field Guide`
  - Ornament (leaf-vein flourish)
- Right edge: vertical thumb tabs, one per theme (`A`, `B`, `C`, `D`). Active tab is solid ink-black `#2A2520` with cream text; inactive tabs are tan `#c8bd9e` with ink-black text. Tapping a tab scrolls to that section.
- Body content (left of tabs, ~18px right padding):
  - Theme header: mono caps with theme letter and name, separated by `·`. Example: `A · UNITY & DIVERSITY`. Hairline divider beneath.
  - Question rows: mono question number in pencil gray (width 20px) on the left, italic serif question title on the right.
  - Tap a row to expand inline, showing the 5 options for that question, each with its hand-drawn check or impostor stamp and its why in serif italic small.

---

## 8. Multi-subject architecture

The MVP ships with biology, but the data layer must be subject-agnostic from day one.

**Content directory:** see Section 9 for the full layout. In short, each subject is a hand-edited xlsx in `/content/source/` that compiles to JSON in `/content/generated/`. `index.ts` collects all generated subjects into a single `SUBJECTS` array.

**Subject registration:** `index.ts` exports `SUBJECTS`. The home screen reads from this array. With one subject (biology), the subject label on home is static. With two or more subjects, it becomes a tappable picker.

**Stateful subject:** the app holds a single `currentSubjectId` in app state. All three modes (Study, Lens Sort, Browse) read from `SUBJECTS.find(s => s.id === currentSubjectId)`. Switching subjects resets the current deck position and timer state.

**Theme handling:** the `Theme[]` field on Subject is optional. If a subject defines themes (Biology has A/B/C/D), Browse renders thumb tabs and groups questions under theme headers. If a subject has no themes, Browse renders a single flat list and omits the tabs. This lets future subjects opt into theme grouping or not.

**Card-writing rubric is shared.** The four impostor failure modes apply to chemistry and physics equally. When future content is authored, the same rubric applies — wrong location/scale, wrong aspect of a right-seeming process, adjacent-but-distinct category, surface keyword trap.

**The visual design is shared.** Cream paper, ink loupe, rubber stamps, field guide aesthetic — none of it is biology-specific. The loupe metaphor is about *examining through a lens*, which works for any conceptual question. No subject should require its own palette or its own type system.

---

## 9. Content authoring pipeline

Content is authored in Excel and built into JSON consumed by the app. This keeps content authoring out of the codebase — the person writing cards never touches TypeScript, can scan and filter rows visually, and gets autocorrect and spellcheck for free. With ~160 cells per subject and three subjects planned, the difference is meaningful.

### Directory structure

```
/content
  /source
    biology.xlsx        // canonical, hand-edited
    chemistry.xlsx      // future
    physics.xlsx        // future
  /generated
    biology.json        // built from xlsx
    chemistry.json
    physics.json
  build.ts              // converts xlsx → json
  index.ts              // imports generated/*.json, exports SUBJECTS
```

### XLSX schema

Each subject's xlsx file has two sheets, plus an optional third for themes.

**Sheet 1 — `Cards`** (one row per option; 160 rows for biology):

| Column | Header | Type | Example |
|--------|--------|------|---------|
| A | Q# | integer | `2` |
| B | Linking Question | text | `What biological processes only happen at or near surfaces?` |
| C | Example | text | `Glycolysis in muscle cells` |
| D | Why | text | `Happens in cytoplasm — solution-phase chemistry, no surface involved.` |
| E | Role | enum | `fit` or `IMPOSTOR` |

The linking question text is repeated on every row of the same Q#. Verbose, but it makes filtering by question and by role straightforward in Excel.

**Sheet 2 — `Questions`** (one row per question):

| Column | Header | Type |
|--------|--------|------|
| A | Q# | integer |
| B | Linking Question | text |

**Sheet 3 (optional) — `Themes`.** Present only for subjects that group questions into themes (biology has A/B/C/D):

| Column | Header | Type | Example |
|--------|--------|------|---------|
| A | Letter | text | `A` |
| B | Name | text | `Unity & diversity` |
| C | Q#s | comma-separated integers | `1,2,3,5,29` |

If a subject has no Themes sheet, the build outputs `themes: undefined` and Browse renders a flat list (no thumb tabs).

### Build script

`build.ts` reads each xlsx in `/content/source/`, validates it, and writes the corresponding JSON to `/content/generated/`. Recommended library: `exceljs` or `xlsx` (SheetJS).

Validations to enforce (build fails loudly on any of these):
- Each `Q#` in `Cards` appears in `Questions`
- Each question has exactly 5 rows in `Cards`
- Each question has exactly 1 `IMPOSTOR` row, the other 4 marked `fit`
- No empty `Example` or `Why` cells
- No duplicate `Q#`s in `Questions`
- If `Themes` exists: every `Q#` is referenced exactly once across all theme rows

The build script should treat role values case-insensitively (`IMPOSTOR`, `impostor`, `Impostor` all valid) and trim whitespace from all text cells.

Wire `npm run build:content` into `npm run dev` so contributors don't forget to rebuild after editing the xlsx.

### Commit policy

Commit both `/content/source/*.xlsx` and `/content/generated/*.json`. The xlsx is the source of truth for human editing; the JSON makes the repo build-able without needing to run the script on every clone, and makes content diffs reviewable in pull requests.

### Excel quirks worth knowing

- Excel autocorrect silently rewrites straight quotes to curly, double-hyphens to em-dashes, and `(c)` to `©`. Most are fine; the build script can optionally normalize them. To prevent: File → Options → Proofing → AutoCorrect → uncheck "Replace as you type."
- Long whys may visually wrap in Excel; this has no effect on output. Cell content is taken verbatim.

---

## 10. Tone of voice

Quiet, precise, scholarly. The interface should sound like the marginalia of someone who is good at the subject and writes carefully.

- "Examining through" not "Now playing"
- "Turn the page" not "Next card"
- "32 lenses" not "32 questions available"
- "Specimen 03" not "Question 3 of 5"
- "Round complete" not "Time's up!"
- "A clean sweep" not "Perfect score! 🎉"

---

## 11. Files included with this spec

- `lens-spec.md` — this document
- `lens-cards.xlsx` — the biology dataset, ready to drop into `/content/source/biology.xlsx`. Two sheets: `Cards` (160 rows, color-coded for impostor vs. fit) and `Questions` (32 rows). A `Themes` sheet is not included in this version — Claude Code should add it during MVP build using the IB theme groupings (A · Unity and diversity, B · Form and function, C · Interaction and interdependence, D · Continuity and change). The build script in Section 9 consumes this file directly.
- `linking-lenses.jsx` — a working reference implementation in React. Useful as a behavioral spec for the modes (selection logic, timer behavior, results aggregation). The visual design in this file is the *previous* iteration; replace it with the field-notebook design specified in Section 6.

---

## 12. MVP build order (suggested)

1. Set up the content pipeline (Section 9): `/content/source/biology.xlsx` in place, `build.ts` written, `npm run build:content` produces `/content/generated/biology.json`. Verify validations fail correctly on bad input.
2. Build the home screen at full visual fidelity — this locks the design system into reusable components (the loupe, stamps, specimen cards, mono marginalia, type pairing).
3. Build Study mode (state machine is simple; focus on getting the reveal right — the IMPOSTOR stamp is the moneyshot).
4. Build Browse mode (mostly static; thumb tabs are the trickiest piece).
5. Build Lens Sort (timer, queue management, results screen — most complex state machine).
6. Polish pass on type, spacing, and ornament consistency across all screens.

After MVP ships and content for chemistry and physics is authored as new xlsx files, adding a subject is a matter of dropping the file in `/content/source/`, running the build, and registering the generated JSON in `/content/index.ts`. The home screen will automatically expose the subject picker.
