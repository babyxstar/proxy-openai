const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// 🧠 Ruta GPT
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

// 🎮 Ruta para obtener toda la lista de apps (opcional)
app.get("/steamapps", async (req, res) => {
  try {
    const response = await fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error con Steam API:", err);
    res.status(500).json({ error: "Error al conectar con Steam", details: err.message });
  }
});

// 🔍 Nueva ruta: buscar por nombre
app.get("/steam/search", async (req, res) => {
  const titulo = req.query.title?.toLowerCase()?.replace(/[^a-z0-9]/gi, "") || "";

  if (!titulo) return res.status(400).json({ error: "Falta el parámetro 'title'" });

  try {
    const response = await fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/");
    const data = await response.json();
    const apps = data.applist.apps;

    const match = apps.find(app => {
      const name = app.name.toLowerCase().replace(/[^a-z0-9]/gi, "");
      return name.includes(titulo);
    });

    if (match) {
      res.json({ appid: match.appid, name: match.name });
    } else {
      res.status(404).json({ error: "No se encontró ninguna coincidencia" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error al buscar en Steam", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy combinado OpenAI + Steam funcionando.");
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
