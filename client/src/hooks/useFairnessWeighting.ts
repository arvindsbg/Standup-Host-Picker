import { useMemo } from 'react';
import type { MemberStats } from '@/../../shared/const';

interface FairnessWeights {
  [memberId: string]: number;
}

export const useFairnessWeighting = (
  memberIds: string[],
  stats: MemberStats[]
): FairnessWeights => {
  return useMemo(() => {
    if (memberIds.length === 0) return {};

    const statsMap = new Map(stats.map((s) => [s.memberId, s]));
    const totalSelections = stats.reduce((sum, s) => sum + s.totalSelections, 0);
    const avgSelections = totalSelections / memberIds.length || 0;

    const weights: FairnessWeights = {};

    memberIds.forEach((memberId) => {
      const memberStats = statsMap.get(memberId);
      const selectionCount = memberStats?.totalSelections || 0;

      // Calculate fairness factor: members with fewer selections get higher weight
      // Formula: weight = (avgSelections + 1) / (selectionCount + 1)
      // This ensures:
      // - Members with 0 selections get the highest weight
      // - Members with more selections get lower weights
      // - The +1 prevents division by zero and ensures minimum weight
      const fairnessFactor = (avgSelections + 1) / (selectionCount + 1);

      // Apply exponential smoothing to make fairness more pronounced
      // Higher exponent = stronger preference for underselected members
      weights[memberId] = Math.pow(fairnessFactor, 1.5);
    });

    // Normalize weights to sum to 1 for probability distribution
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach((memberId) => {
      weights[memberId] = weights[memberId] / totalWeight;
    });

    return weights;
  }, [memberIds, stats]);
};

export const selectWeightedRandom = (
  memberIds: string[],
  weights: FairnessWeights
): string => {
  if (memberIds.length === 0) return '';
  if (memberIds.length === 1) return memberIds[0];

  // Generate random number between 0 and 1
  let random = Math.random();

  // Use cumulative weights to select member
  for (const memberId of memberIds) {
    random -= weights[memberId] || 0;
    if (random <= 0) {
      return memberId;
    }
  }

  // Fallback (should rarely happen due to rounding)
  return memberIds[memberIds.length - 1];
};
