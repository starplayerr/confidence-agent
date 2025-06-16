import React from 'react';

function HomePage({ onSelect }) {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "auto" }}>
      <h2>Welcome to Confidence Agent</h2>
      <button
        style={{ fontSize: "1.2rem", margin: "1rem", padding: "1rem 2rem" }}
        onClick={() => onSelect('query')}
      >
        Single Query
      </button>
      <button
        style={{ fontSize: "1.2rem", margin: "1rem", padding: "1rem 2rem" }}
        onClick={() => onSelect('roundrobin')}
      >
        Round Robin
      </button>
    </div>
  );
}

export default HomePage;