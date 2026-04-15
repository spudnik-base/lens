// Thin app-side re-export of the content registry so components import
// from a single @/lib/ entry point rather than reaching into /content/.
export { SUBJECTS, DEFAULT_SUBJECT_ID, getSubject } from '@content/index';
export type { Subject, Card, Option, Theme, SubjectId } from '@/types/subject';
