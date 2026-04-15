// Data model — see Section 3 of lens-spec.md.
// Kept in /src/types so it is imported by both the content build script
// and the app code. The build script writes JSON that conforms to this
// shape; the app reads it back with the same types.

export type SubjectId = 'biology' | 'chemistry' | 'physics';

export type Option = {
  /** The example, short noun phrase. Fits two lines at ~20px on 340px. */
  text: string;
  /** One sentence explaining why it fits or why it's the impostor. */
  why: string;
  /** Present on exactly one option per card. */
  impostor?: true;
};

export type Card = {
  /** 1-based index into Subject.questions. */
  qIndex: number;
  /** Exactly 5 options, exactly 1 with impostor: true. */
  options: Option[];
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
  /**
   * Optional theme groupings. Biology's MVP release ships without themes:
   * the 32 questions live in a single flat list and Browse shows progress
   * against them as one set. A subject that defines themes makes Browse
   * render thumb tabs.
   */
  themes?: Theme[];
  /** Linking questions, indexed 1..N. */
  questions: string[];
  /** One card per question. */
  cards: Card[];
};
