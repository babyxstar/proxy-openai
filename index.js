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
        "Authorization": Bearer ${process.env.OPENAI_API_KEY},
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

// 🎮 Ruta opcional: lista completa de apps
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

// 🔍 Ruta principal: búsqueda por nombre, ordenada y filtrada
app.get("/steam/search", async (req, res) => {
  const tituloOriginal = req.query.title || "";
  const titulo = tituloOriginal.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();

  if (!titulo) {
    return res.status(400).json({ error: "Falta el parámetro 'title'" });
  }

  try {
    const response = await fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/");
    const data = await response.json();
    const apps = data.applist.apps;

    const puntuado = apps
      .map(app => {
        const raw = app.name || "";
        const normalizado = raw.toLowerCase().replace(/[^a-z0-9]/gi, "").trim();

        let score = 999;
        if (normalizado === titulo) score = 0;
        else if (normalizado.startsWith(titulo)) score = 1;
        else if (normalizado.includes(titulo)) score = 2;

        return { ...app, score, rawName: raw };
      })
      .filter(app => {
        const name = app.rawName.toLowerCase();
        return (
          app.score < 999 &&
          !/dlc|soundtrack|ost/.test(name) && // ❌ excluir estos
          app.name
        );
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 10); // máximo 10 resultados

    // Log de depuración (no afecta velocidad)
    console.log("🔍 Resultados para:", tituloOriginal);
    puntuado.forEach((r, i) => {
      console.log(#${i + 1} →, r.name, (score: ${r.score}));
    });

    res.json({ results: puntuado });
  } catch (err) {
    res.status(500).json({ error: "Error al buscar en Steam", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy combinado OpenAI + Steam funcionando.");
});

app.listen(PORT, () => {
  console.log(Servidor en http://localhost:${PORT});
});
