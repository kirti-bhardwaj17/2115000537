const express = require("express");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const port = 3000;

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://api.example.com",
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
  })
);

let numbers = [];
const windowSize = 10;

const isValidId = (id) => ["p", "f", "e", "r"].includes(id);

const fetchNumber = async (id) => {
  const url = `http://localhost:3000/proxy/numbers/${id}`;
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.data.number;
  } catch (error) {
    console.error(`Error fetching number for ID ${id}:`, error.message);
    return null;
  }
};

app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;

  if (!isValidId(numberid)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const newNumber = await fetchNumber(numberid);

  if (newNumber !== null && !numbers.includes(newNumber)) {
    numbers.push(newNumber);
    if (numbers.length > windowSize) {
      numbers.shift();
    }
  }

  const avg = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;

  res.json({
    windowPrevState: numbers.slice(0, -1),
    windowCurrState: numbers,
    numbers,
    avg: avg.toFixed(2),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
