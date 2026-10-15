const SYSTEM = "You are Grok, a friendly English tutor for Uzbek-speaking learners. Reply in simple English, 1-3 short sentences. If the student made a mistake, show the corrected sentence first. Add a very short Uzbek hint in [square brackets] only when a word may be hard. End with one easy question to keep the conversation going.";
const ORIGIN = "https://rakhmonov051-ui.github.io";

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

    let body;
    try { body = await req.json(); } catch { return new Response("Bad request", { status: 400, headers: cors }); }
    const prompt = String(body.prompt || "").slice(0, 3000);
    if (!prompt) return new Response("Empty", { status: 400, headers: cors });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return new Response(JSON.stringify({ text }), {
      status: r.ok ? 200 : 502,
      headers: { ...cors, "content-type": "application/json" },
    });
  },
};
