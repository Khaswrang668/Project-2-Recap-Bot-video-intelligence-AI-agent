# Recap-Bot

A full-stack RAG (Retrieval-Augmented Generation) video intelligence platform. Upload a video, get it transcribed and embedded, then ask questions about its content and get streamed, context-aware answers.

## Live Demo

🔗 [Live Demo](https://www.recapbot.in/)

## Screenshots

| Home / Upload | Chat / Query |
|---|---|
| ![Home Screenshot](./img/Screenshot (28) (1).png) | ![Chat Screenshot](./img/Screenshot (29).png) |


| Transcript View |
|---|
| ![Transcript Screenshot](./img/Screenshot (30).png) |

## How It Works

1. **Upload** — a video is uploaded and stored.
2. **Transcribe** — audio is extracted and transcribed using OpenAI Whisper.
3. **Chunk & Embed** — the transcript is split into chunks and converted into vector embeddings.
4. **Store** — chunks and embeddings are saved in Supabase (Postgres + pgvector).
5. **Query** — when a user asks a question, the most relevant chunks are retrieved via similarity search.
6. **Generate** — retrieved context + question are sent to an LLM, and the answer is streamed back in real time.

## Features

- End-to-end RAG pipeline: upload → transcribe → embed → retrieve → generate
- Real-time streaming responses using the Vercel AI SDK v5
- Secure authentication with JWTs stored in HTTP-only cookies
- Semantic search over video transcripts using vector embeddings
- RESTful API built with Node.js and Express

## Tech Stack

**Backend**
- Node.js, Express
- Supabase (Postgres + pgvector)
- OpenAI Whisper (transcription)
- OpenAI Embeddings API
- Vercel AI SDK v5 (streaming)
- JWT auth (HTTP-only cookies)

**Frontend**
- React

## Project Structure

```
recap-bot/
├── src/
│   ├── config/          # env & service configuration (Supabase, OpenAI clients)
│   ├── controllers/      # request handlers
│   ├── middleware/       # auth, error handling
│   ├── routes/            # API route definitions
│   ├── services/         # transcription, embedding, retrieval logic
│   ├── utils/             # helpers
│   └── index.js          # app entry point
├── client/                # React frontend
├── .env.example
├── package.json
└── README.md
```

> Adjust this tree to match your actual folder layout.

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase project with the `pgvector` extension enabled
- An OpenAI API key

### Installation

```bash
git clone https://github.com/<your-username>/recap-bot.git
cd recap-bot
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Cookies
COOKIE_DOMAIN=localhost
```

### Database Setup

Enable `pgvector` in your Supabase project and create the tables needed for storing video metadata, transcript chunks, and embeddings (via the Supabase SQL editor or migration files).

### Running Locally

```bash
# Start the backend
npm run dev

# In a separate terminal, start the frontend
cd client
npm install
npm run dev
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and set auth cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| POST | `/api/videos/upload` | Upload a video for processing |
| GET | `/api/videos/:id` | Get video/transcript status |
| POST | `/api/chat/:videoId` | Ask a question about a video (streamed response) |

> Update this table to match your actual routes.

## Authentication

Auth uses JWTs stored in HTTP-only cookies rather than local storage, reducing exposure to XSS-based token theft. Protected routes are guarded by middleware that verifies the token on each request.

## Roadmap

- [ ] Multi-video / playlist-level querying
- [ ] Support for additional video sources (YouTube links, etc.)
- [ ] Usage analytics dashboard

## License

MIT (or your preferred license)

## Author

Khaswrang Debbarma