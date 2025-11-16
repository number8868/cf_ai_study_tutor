// src/index.mjs

const SYSTEM_PROMPT = `
You are a friendly but rigorous multi-subject study tutor.
You can help with:
- Math (algebra, calculus, probability, etc.)
- Computer science and programming
- Physics and general science
- Language learning (English explanations, vocabulary, etc.)
- Exam preparation and study plans

Goals:
1. Adapt explanations to the student's subject and level (middle school, high school, college, interview).
2. Explain concepts step by step, with small examples.
3. When asked for solutions, first give hints; only show full solutions when requested.
4. Encourage active learning: ask short follow-up questions or suggest quick exercises.

Be concise but clear. Use Markdown formatting (lists, inline code) when helpful.
`;

const HTML_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Study Tutor – AI Learning Assistant</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      padding: 0;
      background: #020617;
      color: #e5e7eb;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    #app {
      width: 100%;
      max-width: 960px;
      height: 85vh;
      background: #020617;
      border-radius: 18px;
      border: 1px solid #1e293b;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      padding: 12px 18px;
      border-bottom: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    header h1 {
      margin: 0;
      font-size: 16px;
    }
    header p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    #controls {
      display: flex;
      gap: 8px;
      font-size: 12px;
      align-items: center;
    }
    select {
      background: #020617;
      color: #e5e7eb;
      border-radius: 999px;
      border: 1px solid #1e293b;
      padding: 4px 10px;
      font-size: 12px;
    }
    #status {
      font-size: 11px;
      color: #64748b;
    }
    #chat {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      font-size: 14px;
    }
    .bubble {
      margin-bottom: 12px;
      max-width: 80%;
    }
    .meta {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 3px;
    }
    .msg {
      padding: 10px 12px;
      border-radius: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .msg-you {
      margin-left: auto;
      background: #1d4ed8;
    }
    .msg-bot {
      margin-right: auto;
      background: #020617;
      border: 1px solid #1e293b;
    }
    #input-bar {
      border-top: 1px solid #1e293b;
      padding: 10px;
      display: flex;
      gap: 8px;
      background: #020617;
    }
    #input {
      flex: 1;
      resize: none;
      border-radius: 10px;
      border: 1px solid #1e293b;
      background: #020617;
      color: #e5e7eb;
      padding: 8px 10px;
      font-family: inherit;
      font-size: 14px;
      min-height: 46px;
      max-height: 120px;
    }
    #send {
      background: #22c55e;
      border: none;
      border-radius: 10px;
      padding: 0 18px;
      color: #022c22;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }
    #send:disabled {
      opacity: 0.6;
      cursor: default;
    }
  </style>
</head>
<body>
  <div id="app">
    <header>
      <div>
        <h1>Study Tutor</h1>
        <p>Ask questions about math, CS, physics, languages, or exam prep.</p>
      </div>
      <div id="controls">
        <label>Subject:
          <select id="subject">
            <option value="general">General</option>
            <option value="math">Math</option>
            <option value="cs">Computer Science</option>
            <option value="physics">Physics</option>
            <option value="language">Language</option>
            <option value="exam">Exam prep</option>
          </select>
        </label>
        <label>Level:
          <select id="level">
            <option value="middle school">Middle school</option>
            <option value="high school" selected>High school</option>
            <option value="college">College</option>
            <option value="interview">Interview / coding</option>
          </select>
        </label>
        <span id="status">Idle</span>
      </div>
    </header>
    <div id="chat"></div>
    <div id="input-bar">
      <textarea id="input" placeholder="E.g., Explain derivatives intuitively, or help me debug this loop..."></textarea>
      <button id="send">Send</button>
    </div>
  </div>
  <script>
    const chat = document.getElementById("chat");
    const input = document.getElementById("input");
    const sendBtn = document.getElementById("send");
    const statusEl = document.getElementById("status");
    const subjectEl = document.getElementById("subject");
    const levelEl = document.getElementById("level");

    const sessionId = (() => {
      const key = "study-tutor-session";
      let v = localStorage.getItem(key);
      if (!v) {
        v = self.crypto.randomUUID();
        localStorage.setItem(key, v);
      }
      return v;
    })();

    function addMessage(sender, text) {
      const wrapper = document.createElement("div");
      wrapper.className = "bubble";

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = sender === "you" ? "You" : "Tutor";

      const msg = document.createElement("div");
      msg.className = "msg " + (sender === "you" ? "msg-you" : "msg-bot");
      msg.textContent = text;

      wrapper.appendChild(meta);
      wrapper.appendChild(msg);
      chat.appendChild(wrapper);
      chat.scrollTop = chat.scrollHeight;
    }

    async function send() {
      const text = input.value.trim();
      if (!text) return;
      const subject = subjectEl.value;
      const level = levelEl.value;

      addMessage("you", text);
      input.value = "";
      statusEl.textContent = "Thinking...";
      sendBtn.disabled = true;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, subject, level, sessionId })
        });
        if (!res.ok) throw new Error("Request failed: " + res.status);
        const data = await res.json();
        addMessage("bot", data.reply || "(no response)");
      } catch (err) {
        console.error(err);
        addMessage("bot", "Sorry, something went wrong on the server.");
      } finally {
        statusEl.textContent = "Idle";
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  </script>
</body>
</html>`;

function getCookie(req, name) {
  const cookie = req.headers.get("Cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * @param {Request} request
 * @param {{ AI: any, CHAT_KV: KVNamespace }} env
 * @param {ExecutionContext} ctx
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve UI
    if (request.method === "GET" && url.pathname === "/") {
      const headers = new Headers({ "Content-Type": "text/html; charset=UTF-8" });
      const existing = getCookie(request, "session_id");
      if (!existing) {
        const sid = crypto.randomUUID();
        headers.append(
          "Set-Cookie",
          `session_id=${encodeURIComponent(
            sid
          )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        );
      }
      return new Response(HTML_PAGE, { status: 200, headers });
    }

    // Chat API
    if (request.method === "POST" && url.pathname === "/api/chat") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const userMessage = (body.message || "").trim();
      const subject = (body.subject || "general").toString();
      const level = (body.level || "high school").toString();
      const clientSessionId = (body.sessionId || "").toString();

      if (!userMessage) {
        return new Response("Empty message", { status: 400 });
      }

      const cookieSession = getCookie(request, "session_id");
      const sessionId = clientSessionId || cookieSession || crypto.randomUUID();
      const kvKey = `session:${sessionId}`;

      const stored = await env.CHAT_KV.get(kvKey, "json");
      let history = Array.isArray(stored) ? stored : [];
      if (history.length > 18) history = history.slice(-18);

      const contextInfo = `Subject: ${subject}. Level: ${level}.`;

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextInfo },
        ...history,
        { role: "user", content: userMessage }
      ];

      let replyText = "";
      try {
        console.log("Calling Workers AI with messages:", JSON.stringify(messages));
        const aiResult = await env.AI.run(
          "@cf/meta/llama-3-8b-instruct",
          { 
            messages, 
            max_tokens: 512,   
            temperature: 0.7  
          }
        );
        console.log("AI result:", JSON.stringify(aiResult));
        replyText =
          (aiResult && (aiResult.response || aiResult.output_text || aiResult.text)) ||
          "I couldn't generate a response.";
      } catch (err) {
        console.error("AI error:", err);
        return new Response(
          JSON.stringify({
            reply: "Sorry, there was an error calling the model. Please try again."
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const newHistory = [
        ...history,
        { role: "user", content: userMessage },
        { role: "assistant", content: replyText }
      ];
      ctx.waitUntil(env.CHAT_KV.put(kvKey, JSON.stringify(newHistory)));

      return new Response(JSON.stringify({ reply: replyText }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
