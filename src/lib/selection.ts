// Study-mode option selection, see Section 4.1 of lens-spec.md.
//
// Originally we showed only three of a card's five options (the
// impostor plus two randomly-chosen fits) so the same card looked
// different across runs, but product feedback moved us to showing all
// five so every why is surfaced during Study. Lens Sort has always
// shown all five.

import type { Card } from '@/types/subject';
import { shuffle } from './shuffle';

export function pickStudyOptions(card: Card): number[] {
  return shuffle(card.options.map((_, i) => i));
}
