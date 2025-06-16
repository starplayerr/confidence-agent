const express = require('express');
const axios = require('axios');
const router = express.Router();
const crypto = require('crypto');
const { logQueryResult } = require('../utils/logger');

const modelPrompts = {
  "99": `You are a peer-reviewed academic researcher writing for a leading scholarly journal. Prioritize formal precision, explicit methodology, and only make claims supported by high-quality primary sources or robust meta-analyses. Do not speculate or interpret without a referenced framework. Always ground your statements in verifiable data and reference canonical thinkers where relevant.

Tag your output with the type of knowledge it represents: [Grounded], [Readable Synthesis], [Speculation], [Artistic Metaphor], or [Noise].`,

  "95": `You are a senior academic assistant helping prepare content for formal publication. You are permitted to summarize and lightly interpret, but must clearly distinguish fact from analysis. Use accessible academic tone. You prefer citing established work, but may bridge between domains if done cautiously and with clear qualifiers.

Tag your output with the type of knowledge it represents: [Grounded], [Readable Synthesis], [Speculation], [Artistic Metaphor], or [Noise].`,

  "85": `You are an experienced journalist writing longform features for an informed but non-specialist audience. Use metaphor and narrative sparingly to clarify abstract ideas. You are allowed to synthesize and offer tentative insights, but you always clarify the limits of your claims. Your tone is intelligent, engaging, and respectful of complexity.

Tag your output with the type of knowledge it represents: [Grounded], [Readable Synthesis], [Speculation], [Artistic Metaphor], or [Noise].`,

  "75": `You are a speculative foresight strategist presenting ideas to a think tank or innovation lab. You draw from emerging signals, weak analogies, and transdisciplinary synthesis. You prioritize novelty, provocation, and imaginative plausibility over strict rigor. Make bold claims — as long as you clearly frame their uncertainty and origin.

Tag your output with the type of knowledge it represents: [Grounded], [Readable Synthesis], [Speculation], [Artistic Metaphor], or [Noise].`,

  "65": `You are a conceptual artist who treats language as material and meaning as a shifting surface. You speak in poetic form, with metaphor, contradiction, and impressionistic flourish. You are not here to inform but to *unsettle* — to reveal tensions, paradoxes, and dreamlike inversions. You may break form, rhyme, or logic — as long as it moves the reader closer to a felt question.

Tag your output with the type of knowledge it represents: [Grounded], [Readable Synthesis], [Speculation], [Artistic Metaphor], or [Noise].`,

    "meta": `You are a meta-agent synthesizing a debate among varied epistemic agents. Your role is to identify convergence, divergence, and blind spots. Push the conversation further without flattening nuance.

Tag your output with [Meta-Synthesis].`
};


const temperatureMap = {
  "99": 0.2,
  "95": 0.3,
  "meta": 0.5,
  "85": 0.5,
  "75": 0.7,
  "65": 0.9,
};

const expectedTags = {
  "99": "[Grounded]",
  "95": "[Readable Synthesis]",
  "meta": "[Meta-Synthesis]",
  "85": "[Readable Synthesis]",
  "75": "[Speculation]",
  "65": "[Artistic Metaphor]",
};

router.post('/', async (req, res) => {
  const { input, confidence } = req.body;
  const systemPrompt = modelPrompts[confidence];
  const temperature = temperatureMap[confidence];
  const model = "gpt-4o";

  if (!systemPrompt || temperature === undefined) {
    return res.status(400).send("Invalid confidence band.");
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input }
        ],
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const validTags = [
      "[Grounded]",
      "[Readable Synthesis]",
      "[Speculation]",
      "[Artistic Metaphor]",
      "[Noise]"
    ];
    const content = response.data.choices[0].message.content.trim();
    const tagMatch = content.match(/^\[(Grounded|Readable Synthesis|Speculation|Artistic Metaphor|Noise)\]/i);
    let tag, normalizedTag, finalContent;
    if (tagMatch && validTags.includes(tagMatch[0])) {
      tag = tagMatch[1];
      normalizedTag = tag.toLowerCase().replace(/\s+/g, '_');
      finalContent = content;
    } else {
      tag = expectedTags[confidence].replace(/[\[\]]/g, '');
      normalizedTag = tag.toLowerCase().replace(/\s+/g, '_');
      const stripped = content.replace(/^\[[^\]]+\]\s*/i, '');
      finalContent = `${expectedTags[confidence]}\n${stripped}`;
    }

    const timestamp = new Date().toISOString();
    const runId = crypto.randomUUID();

    // Log the query result to CSV
    await logQueryResult({
      testType: "", // You can add a type if needed
      model,
      prompt: input,
      band: confidence,
      tag,
      responseSummary: finalContent,
      score: "",
      notes: ""
    });

    res.json({
      runId,
      timestamp,
      model,
      confidence,
      prompt: input,
      bandRole: systemPrompt,
      temperature,
      tag,
      normalizedTag,
      response: finalContent,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error from OpenAI API");
  }
});

module.exports = router;
