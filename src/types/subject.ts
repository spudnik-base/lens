// Data model, see Section 3 of lens-spec.md.
// Kept in /src/types so it is imported by both the content build script
// and the app code. The build script writes JSON that conforms to this
// shape; the app reads it back with the same types.

export type SubjectId = 'biology' | 'chemistry' | 'physics';

export type Option = {
  /** The example, short noun phrase. */
  text: string;
  /** One sentence explaining why it fits or why it's the impostor. */
  why: string;
  /** Present on exactly one option per card. */
  impostor?: true;
};

export type Card = {
  /** 1-based index into Subject.questions. */
  qIndex: number;
  /** Sub-card identifier within a lens, e.g. "1a" or "1b". Each lens
      has two sub-cards with distinct impostors so the student sees two
      different failure modes per linking question. */
  subId: string;
  /** Exactly 3 options: 2 fits + 1 impostor. */
  options: Option[];
  /** Present and set to 'hl' when this card covers Higher Level only
      content. Absent (or undefined) means the card is SL-accessible.
      SL students see all cards without this flag; HL students see
      everything. */
  hl?: true;
};

export type Theme = {
  /** 'A' | 'B' | 'C' | 'D' */
  letter: string;
  /** e.g. 'Unity & diversity' */
  name: string;
  /** 1-based indices into Subject.questions. */
  questionIndices: number[];
};

export type Subject = {
  id: SubjectId;
  /** e.g. 'IB Biology' */
  name: string;
  /** Optional theme groupings. */
  themes?: Theme[];
  /** Linking questions, indexed 1..N. */
  questions: string[];
  /** Two cards per question (sub-cards a and b). */
  cards: Card[];
};
