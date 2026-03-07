# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Script Talk is a React app for Japanese language learning. It displays a two-speaker dialogue in a chat-bubble UI and reads lines aloud using the Web Speech API (`SpeechSynthesisUtterance` with `lang: "ja-JP"`). Each script line has a `display` field (kanji) and a `speak` field (hiragana reading) to ensure correct pronunciation.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite build (outputs to `docs/` for GitHub Pages)
- `npm run lint` — ESLint
- `npm run preview` — Preview production build

## Architecture

- **`src/App.tsx`** — Main component. Fetches `data.json` at startup, renders chat bubbles, handles play/pause/stop controls. Auto-scrolls to the currently speaking line.
- **`src/useSpeech.ts`** — Custom hook managing speech synthesis. Uses a cancellation ID pattern (`cancelIdRef`) to safely handle overlapping play/stop requests. Speakers A and B have different voice configs (rate/pitch).
- **`src/types.ts`** — `ScriptLine` type: `{ speaker: "A" | "B", name, display, speak }`.
- **`public/data.json`** — Dialogue script data. `display` is the text shown in the UI; `speak` is the hiragana reading passed to speech synthesis.

## Build & Deploy

- Vite is configured with `base: '/script-talk/'` and `outDir: 'docs'` for GitHub Pages deployment.
