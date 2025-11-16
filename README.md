# Study Tutor (Cloudflare AI Assignment)

This is a simple AI-powered study tutor built using Cloudflare Workers, Workers AI, and KV storage.  
Users can chat with the tutor, select subject and level, and the assistant provides learning guidance and explanations.

## Features
- Supports multiple subjects: Math, CS, Physics, Language, Exam Prep
- Supports different learning levels
- Chat-based web UI
- Stores conversation history using KV
- Runs fully on Cloudflare edge

## Tech Stack
- Cloudflare Workers
- Workers AI (llama-3-8b-instruct)
- Cloudflare KV
- HTML + JavaScript (frontend)

## Run Locally


# 1️⃣ Install & Start
```bash
npm install
npm run dev
```


# 2️⃣ Open in Browser
```bash
http://127.0.0.1:8787/
```


# 3️⃣ Deploy
```bash
npm run deploy
```


# 4️⃣ wrangler.toml Example
```bash
[ai]
binding = "AI"

[[kv_namespaces]]
binding = "CHAT_KV"
id = "YOUR_KV_ID"
```

Notes

Conversation memory stored using Cloudflare KV

Prompt definition documented in PROMPTS.md

max_tokens and temperature configurable in src/index.mjs