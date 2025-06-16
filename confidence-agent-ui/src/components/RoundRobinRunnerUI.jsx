import React, { useState } from 'react';
import axios from 'axios';

const DEFAULT_BANDS = ["65", "75", "85", "95", "99"];

function RoundRobinRunnerUI() {
  const [initialPrompt, setInitialPrompt] = useState('');
  const [numRounds, setNumRounds] = useState(3);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [humanInput, setHumanInput] = useState('');
  const [awaitingHuman, setAwaitingHuman] = useState(false);
  const [includeDisagreement, setIncludeDisagreement] = useState(false);
  const [direction, setDirection] = useState("forward");


  const handleBegin = async () => {
    setLoading(true);
    setHistory([]);
    setCurrentRound(0);
    setAwaitingHuman(false);
    try {
      // Start the round robin process
      const res = await axios.post('http://localhost:5001/roundrobin', {
        initialPrompt,
        numRounds,
        bands: DEFAULT_BANDS,
        includeDisagreement,
        direction, // Pass direction to backend
      });
      setHistory(res.data.history);
      setCurrentRound(numRounds); // All rounds done
    } catch (err) {
      setHistory([{ output: "⚠️ Error communicating with backend" }]);
    }
    setLoading(false);
  };

  // Optionally, you can implement a step-by-step mode with human input between rounds

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h2>Round Robin Runner</h2>
      <textarea
        value={initialPrompt}
        onChange={e => setInitialPrompt(e.target.value)}
        rows={4}
        placeholder="Enter the initial prompt..."
        style={{ width: "100%", marginBottom: "1rem", fontSize: "1rem", padding: "0.5rem" }}
        disabled={loading}
      />
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            name="direction"
            value="forward"
            checked={direction === "forward"}
            onChange={() => setDirection("forward")}
            disabled={loading}
            style={{ marginRight: "0.5em" }}
          />
          Convergent (forward)
        </label>
        <label style={{ marginLeft: "1em" }}>
          <input
            type="radio"
            name="direction"
            value="reverse"
            checked={direction === "reverse"}
            onChange={() => setDirection("reverse")}
            disabled={loading}
            style={{ marginRight: "0.5em" }}
          />
          Divergent (reverse)
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
            <input
                type="checkbox"
                checked={includeDisagreement}
                onChange={e => setIncludeDisagreement(e.target.checked)}
                disabled={loading}
                style={{ marginRight: "0.5em" }}
            />
            Enable Disagreement Prompting
        </label>
        </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Number of Rounds: </label>
        <select
          value={numRounds}
          onChange={e => setNumRounds(Number(e.target.value))}
          disabled={loading}
        >
          {Array.from({ length: 9 }, (_, i) => i + 2).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleBegin}
        disabled={loading || !initialPrompt.trim()}
        style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
      >
        {loading ? "Running..." : "Begin"}
      </button>

      <div style={{
        marginTop: "2rem",
        maxHeight: "400px",
        overflowY: "auto",
        background: "#f9f9f9",
        padding: "1rem",
        borderRadius: "5px"
      }}>
        {history.length === 0 && <div style={{ color: "#888" }}>No responses yet.</div>}
        {history.length > 0 && (
          <div>
            {history.map((entry, idx) => (
                <div key={idx} style={{ marginBottom: "1.5rem" }}>
                    {entry.band === "meta" && entry.tag === "Meta-Synthesis" ? (
                    <>
                        <strong style={{ color: "#31708f" }}>Meta-agent synthesis:</strong>
                        <div style={{ background: "#d9edf7", padding: "0.5em", margin: "0.5em 0" }}>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{entry.output}</pre>
                        </div>
                    </>
                    ) : entry.band === "meta" ? (
                    <>
                        <strong>Meta-agent input prompt:</strong>
                        <div style={{ background: "#eee", padding: "0.5em", margin: "0.5em 0" }}>
                        <pre>{entry.input}</pre>
                        </div>
                    </>
                    ) : (
                    <>
                        <strong>Round {entry.round + 1}, Band {entry.band}:</strong>
                        <div style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>{entry.output}</div>
                        {entry.tag && <div style={{ fontSize: "0.9em", color: "#888" }}>Tag: {entry.tag}</div>}
                    </>
                    )}
                </div>
                ))}
          </div>
        )}
      </div>

      {/* Human intervention UI (future/optional) */}
      {awaitingHuman && (
        <div style={{ marginTop: "2rem" }}>
          <textarea
            value={humanInput}
            onChange={e => setHumanInput(e.target.value)}
            rows={2}
            placeholder="Add human input for the next round (optional)..."
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          <button
            onClick={() => {
              // Implement logic to continue with human input
              setAwaitingHuman(false);
              setHumanInput('');
            }}
            style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default RoundRobinRunnerUI;