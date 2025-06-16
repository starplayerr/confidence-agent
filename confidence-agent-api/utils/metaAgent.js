function buildMetaAgentPrompt(history) {
  const maxRound = Math.max(...history.map(h => h.round));
  const latestRound = history.filter(entry => entry.round === maxRound);

  let metaInput = `You are a meta-agent analyzing multi-agent epistemic discourse. You have access to diverse agent responses across certainty bands and rounds. Your job is not to summarize — your job is to clarify, challenge, and deepen.

1. Identify epistemic tensions: Where do agents disagree? Where do they talk past each other? What core assumptions are never questioned?

2. Evaluate process: Did the agents refine the conversation or entrench existing framings? Where did novelty plateau?

3. Push the discourse forward: What new question, frame, or conceptual shift would re-energize the conversation? Offer it.

Avoid flattening disagreement. Do not simply summarize. Think like a philosophical moderator in a high-stakes symposium.

`;

  latestRound.forEach(entry => {
    metaInput += `Band ${entry.band} responded:\n${entry.output}\n\n`;
  });

  metaInput += `Now produce a response tagged as [Meta-Synthesis] that reflects and evolves the discussion.`;
  return metaInput;
}

module.exports = { buildMetaAgentPrompt };