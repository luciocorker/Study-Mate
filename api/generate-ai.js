// api/generate-ai.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt, userId } = req.body;
  if (!prompt || !userId) {
    res.status(400).json({ error: "Missing prompt or userId" });
    return;
  }

  try {
    // Call Gemini REST API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + geminiApiKey;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const geminiData = await geminiRes.json();
    const result = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

    // Optionally save to Supabase
    await supabase.from("ai_results").insert({ user_id: userId, result });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
