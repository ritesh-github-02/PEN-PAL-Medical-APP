import { questionnaireConfig } from '@/config/questionnaire';

/**
 * Iterates through the questionnaire config following branch logic and sequence
 * to find the first unanswered step index and whether all steps are completed.
 */
export function findNextUnansweredStepIndex(answers: Record<string, any>): {
  targetIndex: number;
  isAllCompleted: boolean;
} {
  let index = 0;
  const visitedIds = new Set<string>();

  while (index >= 0 && index < questionnaireConfig.length) {
    const step = questionnaireConfig[index];
    if (visitedIds.has(step.id)) break;
    visitedIds.add(step.id);

    const ans = answers[step.id];

    if (step.isTerminal) {
      return { targetIndex: index, isAllCompleted: true };
    }

    const isAnswered =
      ans !== undefined &&
      ans !== null &&
      ans !== 'undefined' &&
      (Array.isArray(ans) ? ans.length > 0 : true);

    if (!isAnswered) {
      return { targetIndex: index, isAllCompleted: false };
    }

    let nextId = step.nextStepId;
    if (step.branchLogic && ans !== undefined) {
      const match = step.branchLogic.find((b: any) => b.value === String(ans));
      if (match) nextId = match.targetStepId;
    }

    if (!nextId) break;

    const nextIdx = questionnaireConfig.findIndex((s) => s.id === nextId);
    if (nextIdx === -1) break;
    index = nextIdx;
  }

  return { targetIndex: index, isAllCompleted: true };
}
