import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/shorturls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (data.shortLink) {
        setShortLink(data.shortLink);
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Backend not running?");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>🔗 URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a long URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {shortLink && (
        <div className="result">
          <p>
            Short URL:{" "}
            <a href={shortLink} target="_blank" rel="noopener noreferrer">
              {shortLink}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
