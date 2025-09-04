const express = require("express");
const cors = require("cors");
const shortid = require("shortid");

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage
let urls = {};

// Create Short URL
app.post("/shorturls", (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url) return res.status(400).json({ message: "URL is required" });

  // Generate shortcode if not provided
  const code = shortcode || shortid.generate();

  if (urls[code]) {
    return res.status(400).json({ message: "Shortcode already exists" });
  }

  // Expiry calculation
  const expiryDate = validity
    ? new Date(Date.now() + validity * 60000)
    : new Date(Date.now() + 30 * 60000); // default 30 min

  urls[code] = {
    url,
    shortcode: code,
    createdAt: new Date(),
    expiry: expiryDate,
    clicks: 0,
    clickData: [],
  };

  res.status(201).json({
    shortLink: `http://localhost:5000/${code}`,
    expiry: expiryDate,
  });
});

// Redirect
app.get("/:code", (req, res) => {
  const { code } = req.params;
  const entry = urls[code];

  if (!entry) return res.status(404).json({ message: "Not found" });
  if (entry.expiry < new Date()) return res.status(410).json({ message: "Link expired" });

  entry.clicks++;
  entry.clickData.push({
    timestamp: new Date(),
    referrer: req.headers.referer || "direct",
    userAgent: req.headers["user-agent"],
  });

  res.redirect(entry.url);
});

// Get Stats
app.get("/shorturls/:code", (req, res) => {
  const { code } = req.params;
  const entry = urls[code];

  if (!entry) return res.status(404).json({ message: "Not found" });

  res.json({
    url: entry.url,
    shortcode: entry.shortcode,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    clicks: entry.clicks,
    clickData: entry.clickData,
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
