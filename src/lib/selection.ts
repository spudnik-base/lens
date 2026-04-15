// Study-mode option selection, see Section 4.1 of lens-spec.md.
//
// We show exactly three of a card's five options: the impostor plus
// two randomly chosen fits. Variety across runs is pedagogical, the
// same card looks different next time, which forces re-examining the
// lens rather than memorizing option positions.

import type { Card } from '@/types/subject';
import { shuffle } from './shuffle';

export function pickStudyOptions(card: Card): number[] {
  const impostorIdx = card.options.findIndex((o) => o.impostor);
  const fitIdxs = card.options.map((_, i) => i).filter((i) => i !== impostorIdx);
  const chosenFits = shuffle(fitIdxs).slice(0, 2);
  return shuffle([impostorIdx, ...chosenFits]);
}
