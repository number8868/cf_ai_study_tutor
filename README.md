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

```bash
npm install
npm run dev

Visit in browser:
http://127.0.0.1:8787/

Deploy
npm run deploy

Config (wrangler.toml)
[ai]
binding = "AI"

[[kv_namespaces]]
binding = "CHAT_KV"
id = "YOUR_KV_ID"

Notes

Conversation memory stored per session using KV

Prompt definition is included in PROMPTS.md

Max tokens and temperature configurable in Worker code