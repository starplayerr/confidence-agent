import React, { useState } from 'react';
import axios from 'axios';

function QueryRouterUI() {
  const [confidence, setConfidence] = useState("95");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/query', {
        input,
        confidence,
      });
      setResponse(res.data.response);
    } catch (err) {
      console.error(err);
      setResponse("⚠️ Error communicating with backend");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h2>Confidence-Aware AI Agent</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder="Ask your question here..."
        style={{ width: "100%", marginBottom: "1rem", fontSize: "1rem", padding: "0.5rem" }}
      />
      <label>Confidence Level:</label>
      <select
        value={confidence}
        onChange={(e) => setConfidence(e.target.value)}
        style={{ marginLeft: "1rem", fontSize: "1rem" }}
      >
        <option value="99">99 - Legal Certainty</option>
        <option value="95">95 - Academic</option>
        <option value="85">85 - Technical Journalism</option>
        <option value="75">75 - Concept Ideation</option>
        <option value="65">65 - Conceptual Metaphor</option>
      </select>
      <br /><br />
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
      >
        {loading ? "Processing..." : "Ask"}
      </button>
      <div style={{ marginTop: "2rem", whiteSpace: "pre-wrap", backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "5px" }}>
        {response}
      </div>
    </div>
  );
}

export default QueryRouterUI;