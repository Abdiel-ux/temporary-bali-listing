// src/server/server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// endpoint chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ reply: "API key belum diatur di server." });
    }

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant for Bali Listings." },
          { role: "user", content: message },
        ],
        max_tokens: 300,
      }),
    });

    const data = await apiRes.json();

    // log supaya kelihatan balasan raw
    console.log("OpenAI response:", JSON.stringify(data, null, 2));

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Maaf, saya tidak mendapatkan jawaban.";

    res.json({ reply });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ reply: "Terjadi kesalahan di server." });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
