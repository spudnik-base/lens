/**
 * Subject registry.
 *
 * Imports every generated subject JSON and re-exports them as a typed
 * array. When a new subject is added to content/source/*.xlsx, run the
 * content build and append the import here, that's the only code change
 * required to register a new subject.
 */
import biologyJson from './generated/biology.json';
import physicsJson from './generated/physics.json';
import type { Subject } from '../src/types/subject.js';

export const SUBJECTS: readonly Subject[] = [
  biologyJson as Subject,
  physicsJson as Subject,
];

export const DEFAULT_SUBJECT_ID = 'biology' as const;

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
