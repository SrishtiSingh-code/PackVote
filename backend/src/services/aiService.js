/**
 * =====================================================================
 * AI SUMMARY SERVICE
 * =====================================================================
 * IMPORTANT ARCHITECTURAL RULE:
 * The AI NEVER chooses the destination. By the time this file runs,
 * recommendationEngine.js has already picked the winning destination
 * using a deterministic point-based algorithm. All the AI does is turn
 * that decision into a friendly, natural-language paragraph:
 *
 *   Group Preferences -> Recommendation Algorithm -> Best Destination
 *                                                          |
 *                                                          v
 *                                                       AI API
 *                                                          |
 *                                                          v
 *                                              Human-readable explanation
 *
 * If no API key is configured, we fall back to a simple template so the
 * app still works end-to-end in a local demo without any external calls.
 * =====================================================================
 */

const fetch = require('node-fetch');

async function generateAISummary({ destination, groupScore, factors, preferenceSummary }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return buildFallbackSummary({ destination, groupScore, factors, preferenceSummary });
  }

  const prompt = buildPrompt({ destination, groupScore, factors, preferenceSummary });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-sonnet-4-5',
        max_tokens: 250,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((block) => block.type === 'text');

    if (textBlock && textBlock.text) {
      return textBlock.text.trim();
    }

    throw new Error('AI API returned no text content');
  } catch (err) {
    console.error('AI summary generation failed, using fallback:', err.message);
    return buildFallbackSummary({ destination, groupScore, factors, preferenceSummary });
  }
}

function buildPrompt({ destination, groupScore, factors, preferenceSummary }) {
  return `You are writing a short, friendly trip summary for a group travel planning app called PackVote.

A deterministic scoring algorithm has ALREADY selected "${destination.name}, ${destination.country}" as the group's best-matching destination, with a group compatibility score of ${groupScore}%.

Group preference summary: ${preferenceSummary}

Key matching factors: ${factors.join('; ')}

Write a short (2-4 sentence) natural-language paragraph explaining why this destination is a great match for the group. Do NOT suggest a different destination and do NOT mention scores/percentages directly -- just explain the reasoning in a warm, human tone.`;
}

function buildFallbackSummary({ destination, groupScore, factors, preferenceSummary }) {
  const factorText = factors.slice(0, 3).join(', ').toLowerCase();
  return `Your group is looking for a trip built around ${preferenceSummary}. ${destination.name} emerged as the strongest overall match, with ${groupScore}% group compatibility, because it delivers on ${factorText}. It's a well-rounded pick that satisfies most members of the group without leaving anyone's preferences out.`;
}

module.exports = { generateAISummary };
