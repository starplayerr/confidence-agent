const axios = require('axios');
const { buildConceptSummary, formatConceptSummary } = require('./memorySummarizer');
const { buildMetaAgentPrompt } = require('./metaAgent'); // ➕ Add this import


async function roundRobinRunner({
  initialPrompt,
  numRounds = 3,
  bands = ["65", "75", "85", "95", "99"],
  humanInput = null,
  includeDisagreement = false,
  direction = "forward" // <-- Add this
}) {  let history = [];
  let agentMemory = {}; // e.g., { "65": [output0, output1, ...], "75": [...] }

  let previousOutput = initialPrompt;

  for (let round = 0; round < numRounds; round++) {
    // Determine order based on direction
    const bandOrder = direction === "reverse" ? [...bands].reverse() : bands;

    for (let i = 0; i < bandOrder.length; i++) {
      const band = bandOrder[i];

      // Compose the input for this agent: always include original prompt and previous agent's output
      let agentInput = `Original prompt: ${initialPrompt}\n\nPrevious agent's output: ${previousOutput}`;

        // If agent has spoken in previous rounds, remind it what it said
        if (agentMemory[band] && agentMemory[band].length > 0) {
        const lastSelfOutput = agentMemory[band][agentMemory[band].length - 1];
        agentInput += `\n\nYour last contribution (Round ${round - 1}):\n${lastSelfOutput}`;
        agentInput += `\n\nReflect on your earlier view. Do you wish to reinforce it, revise it, or expand based on how the dialogue has evolved?`;
        }

      // Optionally, include human input if provided for this round
      if (typeof humanInput === 'function') {
        const humanAddition = humanInput({ round, band, previousOutput });
        if (humanAddition) {
          agentInput += `\n\nHuman input: ${humanAddition}`;
        }
      }

      // Inject concept summary so far
      const conceptSummary = formatConceptSummary(buildConceptSummary(history), { includeDisagreement });
      if (conceptSummary && conceptSummary.length > 0) {
        agentInput += `\n\nConcept Summary So Far:\n${conceptSummary}`;
      }

      // Call the queryRouter endpoint
      const res = await axios.post('http://localhost:5001/query', {
        input: agentInput,
        confidence: band
      });

      const output = res.data.response;
      history.push({
        round,
        band,
        input: agentInput,
        output,
        tag: res.data.tag
      });

      if (!agentMemory[band]) agentMemory[band] = [];
        agentMemory[band].push(output);


      previousOutput = output; // For next agent in the chain
    }
  }

  // ➕ Add meta-agent call after all rounds
  const metaPrompt = buildMetaAgentPrompt(history);
  const res = await axios.post('http://localhost:5001/query', {
    input: metaPrompt,
    confidence: "meta"
  });

  const output = res.data.response;
  history.push({
    round: numRounds,
    band: "meta",
    input: metaPrompt,
    output,
    tag: res.data.tag || "Meta-Synthesis"
  });
  return history;
}

module.exports = { roundRobinRunner };