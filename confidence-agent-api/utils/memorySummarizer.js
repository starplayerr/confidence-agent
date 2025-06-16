// memorySummarizer.js

/**
 * Extracts key ideas from an agent's response.
 * Currently uses simple regex and heuristics for prototype phase.
 * Eventually could use LLM summarization or keyword extraction.
 */
function extractKeyIdeas({ output, tag, band, round }) {
  const sentences = output.split(/(?<=\.)\s+/); // crude sentence split
  const keyPhrases = sentences.filter(s => s.length > 40 && /[a-z]/i.test(s)).slice(0, 3); // heuristics

  return keyPhrases.map(phrase => ({
    phrase: phrase.trim(),
    sourceBand: band,
    round,
    tag
  }));
}

/**
 * Compiles a rolling concept summary from history.
 */
function buildConceptSummary(history) {
  const conceptList = [];

  for (const entry of history) {
    const extracted = extractKeyIdeas({
      output: entry.output,
      tag: entry.tag,
      band: entry.band,
      round: entry.round
    });
    conceptList.push(...extracted);
  }

  return conceptList;
}

/**
 * Converts the concept summary into a human-readable string for prompt injection,
 * and optionally includes a disagreement directive.
 */
function formatConceptSummary(conceptList, options = {}) {
  const { includeDisagreement = false } = options;

  const summary = conceptList.map(item => {
    return `- [${item.sourceBand}, Round ${item.round}, ${item.tag}] ${item.phrase}`;
  }).join("\n");

  if (includeDisagreement) {
    return `${summary}
\nYour task:
1. Identify any assumptions, weaknesses, or gaps in the above ideas.
2. Either build upon, critique, or offer a contrasting viewpoint to one or more concepts.`;
  }

  return summary;
}

module.exports = {
  extractKeyIdeas,
  buildConceptSummary,
  formatConceptSummary
};