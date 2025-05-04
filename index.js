const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🛑 Evitar almacenamiento en caché en todas las respuestas
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.post("/openai", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al conectar con OpenAI", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy IA en funcionamiento.");
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
