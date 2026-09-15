/**
 * =====================================================================
 * RECOMMENDATION ENGINE
 * =====================================================================
 * This file contains the ENTIRE deterministic algorithm PackVote uses to
 * pick a destination for a group. There is no machine learning here --
 * every score can be traced back to a simple, explainable rule. This is
 * intentional: it needs to be easy to explain line-by-line in an
 * interview, and it needs to be predictable (same inputs -> same output).
 *
 * The pipeline is split into five clearly separated steps:
 *   1. scoreParticipantForDestination  -> one participant, one destination
 *   2. scoreAllDestinationsForParticipant -> one participant, all destinations
 *   3. aggregateGroupScores            -> combine every participant's scores
 *   4. rankDestinations                -> sort destinations by group score
 *   5. explainRecommendation           -> turn the winning score into
 *                                          human-readable bullet points
 * =====================================================================
 */

const destinations = require('../data/destinations');

// Points available per category. They add up to 100.
const WEIGHTS = {
  budget: 20,
  climate: 15,
  duration: 15,
  styles: 20,
  activities: 20,
  accommodation: 10,
};

const BUDGET_ORDER = ['low', 'medium', 'high'];

/**
 * STEP 1: Score how well a single destination matches a single
 * participant's preferences. Returns both the total and a breakdown,
 * so we can later explain *why* a destination scored well.
 */
function scoreParticipantForDestination(preferences, destination) {
  const breakdown = {};

  // Budget: full points for an exact match, half points if the group's
  // budget is only one tier away (e.g. medium vs high), 0 otherwise.
  if (preferences.budget && destination.budget) {
    if (preferences.budget === destination.budget) {
      breakdown.budget = WEIGHTS.budget;
    } else {
      const diff = Math.abs(
        BUDGET_ORDER.indexOf(preferences.budget) - BUDGET_ORDER.indexOf(destination.budget)
      );
      breakdown.budget = diff === 1 ? WEIGHTS.budget / 2 : 0;
    }
  } else {
    breakdown.budget = 0;
  }

  // Climate: simple exact match.
  breakdown.climate =
    preferences.climate && preferences.climate === destination.climate ? WEIGHTS.climate : 0;

  // Duration: does the destination suit the requested trip length?
  breakdown.duration =
    preferences.duration && destination.durations.includes(preferences.duration)
      ? WEIGHTS.duration
      : 0;

  // Travel styles / activities: proportional overlap between the two sets.
  breakdown.styles = overlapScore(preferences.travelStyles, destination.styles, WEIGHTS.styles);
  breakdown.activities = overlapScore(
    preferences.activities,
    destination.activities,
    WEIGHTS.activities
  );

  // Accommodation: exact match against the destination's supported types.
  breakdown.accommodation =
    preferences.accommodation && destination.accommodation.includes(preferences.accommodation)
      ? WEIGHTS.accommodation
      : 0;

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  return { total: Math.round(total), breakdown };
}

/**
 * Helper: what fraction of the participant's chosen options (e.g. travel
 * styles) also appear in the destination's list, scaled to `maxPoints`.
 */
function overlapScore(chosen = [], available = [], maxPoints) {
  if (!chosen || chosen.length === 0) return 0;
  const matches = chosen.filter((item) => available.includes(item)).length;
  return (matches / chosen.length) * maxPoints;
}

/**
 * STEP 2: Score every destination for one participant.
 */
function scoreAllDestinationsForParticipant(preferences) {
  return destinations.map((destination) => {
    const { total, breakdown } = scoreParticipantForDestination(preferences, destination);
    return { destinationId: destination.id, total, breakdown };
  });
}

/**
 * STEP 3: Aggregate scores across the whole group.
 * For every destination we average each participant's score. Averaging
 * (rather than, say, taking the max) is what makes this "democratic":
 * a destination only wins if it works well for the group as a whole,
 * not just for one enthusiastic participant.
 */
function aggregateGroupScores(participants) {
  const perParticipantScores = participants.map((p) =>
    scoreAllDestinationsForParticipant(p.preferences || {})
  );

  return destinations.map((destination, index) => {
    const scoresForThisDestination = perParticipantScores.map((scores) => scores[index]);

    const groupScore = Math.round(
      scoresForThisDestination.reduce((sum, s) => sum + s.total, 0) /
        scoresForThisDestination.length
    );

    // Average each category's score too, so we can explain the winner later.
    const avgBreakdown = {};
    Object.keys(WEIGHTS).forEach((key) => {
      const avg =
        scoresForThisDestination.reduce((sum, s) => sum + s.breakdown[key], 0) /
        scoresForThisDestination.length;
      avgBreakdown[key] = avg;
    });

    return {
      destination,
      groupScore,
      avgBreakdown,
      perParticipant: participants.map((p, i) => ({
        name: p.name,
        score: scoresForThisDestination[i].total,
      })),
    };
  });
}

/**
 * STEP 4: Rank destinations by group score, highest first.
 */
function rankDestinations(groupScores) {
  return [...groupScores].sort((a, b) => b.groupScore - a.groupScore);
}

/**
 * STEP 5: Turn the winning destination's score breakdown into
 * human-readable bullet points (used on the Result page and passed
 * to the AI summary endpoint as context).
 */
function explainRecommendation(winner) {
  const { destination, avgBreakdown } = winner;
  const factors = [];

  if (avgBreakdown.climate >= WEIGHTS.climate * 0.6) {
    factors.push(`Matches the group's preferred ${destination.climate} climate`);
  }
  if (avgBreakdown.styles >= WEIGHTS.styles * 0.6) {
    factors.push(`Strong match for the group's preferred travel styles`);
  }
  if (avgBreakdown.budget >= WEIGHTS.budget * 0.6) {
    factors.push(`Fits the group's budget`);
  }
  if (avgBreakdown.duration >= WEIGHTS.duration * 0.6) {
    factors.push(`Good match for the requested trip duration`);
  }
  if (avgBreakdown.activities >= WEIGHTS.activities * 0.6) {
    factors.push(`Strong activity overlap across the group`);
  }
  if (avgBreakdown.accommodation >= WEIGHTS.accommodation * 0.6) {
    factors.push(`Offers the group's preferred accommodation type`);
  }

  if (factors.length === 0) {
    factors.push('Best overall balance across all group preferences');
  }

  return factors;
}

/**
 * Main entry point used by the controller.
 * Runs the full pipeline and returns the winning destination plus
 * a short list of ranked alternatives.
 */
function generateRecommendation(participants) {
  const groupScores = aggregateGroupScores(participants);
  const ranked = rankDestinations(groupScores);

  const winner = ranked[0];
  const alternatives = ranked.slice(1, 4).map((entry) => ({
    destinationId: entry.destination.id,
    name: entry.destination.name,
    country: entry.destination.country,
    score: entry.groupScore,
  }));

  return {
    destination: winner.destination,
    groupScore: winner.groupScore,
    factors: explainRecommendation(winner),
    alternatives,
    fullRanking: ranked.map((r) => ({
      name: r.destination.name,
      score: r.groupScore,
    })),
  };
}

module.exports = {
  WEIGHTS,
  scoreParticipantForDestination,
  scoreAllDestinationsForParticipant,
  aggregateGroupScores,
  rankDestinations,
  explainRecommendation,
  generateRecommendation,
};
