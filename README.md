# gila community

India-focused **diabetic peer community** by [gila](https://github.com/athrvakhrbde/gila) — discussions, nested comments, likes, profiles, search, and realtime DMs.

Built for people living with diabetes in India (type 1, type 2, gestational). Peer support only — not a substitute for clinical care.

## Stack

- **Client:** Vite · React · TypeScript · Tailwind · Framer Motion · Socket.io client
- **Server:** Express · MongoDB/Mongoose · JWT · Socket.io
- **Design:** gila tokens (Aeonik, `#001317` / `#00fcee`)

## Setup

Requires **Node 20+** and a running **MongoDB** instance.

### Local MongoDB (Docker / Colima)

```bash
# macOS: start Docker runtime if needed
colima start

# from repo root — persistent Mongo on :27017
docker compose up -d mongo

cp .env.example .env
# TOKEN_KEY must be ≥ 32 characters
# MONGO_URI defaults to mongodb://127.0.0.1:27017/gila-community

npm install
npm install --prefix client
npm install --prefix server

npm run dev
```

### Hosted MongoDB (Atlas) — recommended for real users

```bash
brew install mongodb-atlas-cli mongosh   # once
atlas auth login
npm run atlas:bootstrap                 # creates free M0 cluster + writes MONGO_URI
npm run dev
```

Promote a moderator after they sign up:

```bash
npm run make-admin -- theirusername
```

### Deploy the app (Render)

This stack needs a long-running Node process (Socket.io). Use `render.yaml`:

1. `render login`
2. Create a Blueprint from this repo (or `render blueprints apply`)
3. Set `MONGO_URI` (from Atlas) and `CLIENT_URL` (your Render URL) in the dashboard

Vercel alone is not enough for the API + realtime DMs.

- App: http://127.0.0.1:5173 (Vite proxies `/api` and `/socket.io` to the API)
- API: http://127.0.0.1:4000

## Production

```bash
# set NODE_ENV-relevant values in .env:
# MONGO_URI, TOKEN_KEY (≥32 chars), CLIENT_URL=https://your-domain

npm run build
NODE_ENV=production npm start
```

In production the Express server serves `client/dist` and the API on the same origin. Leave `VITE_API_URL` unset so the browser talks to `/api` and Socket.io on the same host.

## Environment

| Variable | Where | Description |
|----------|--------|-------------|
| `MONGO_URI` | root `.env` | MongoDB connection string (required) |
| `TOKEN_KEY` | root `.env` | JWT secret, ≥ 32 characters (required) |
| `PORT` | root `.env` | API port (default `4000`) |
| `CLIENT_URL` | root `.env` | Public app origin; required in production for CORS |
| `VITE_API_URL` | `client/.env` | Optional; leave unset for same-origin |

## Scripts

```bash
npm run dev          # API + Vite together
npm run build        # production builds
NODE_ENV=production npm start   # API + static client
```

## Features

- Auth (JWT, 7-day expiry, Bearer token)
- Discussion posts with markdown
- Likes + likers list
- Nested peer comments
- Profiles (posts / liked / comments + bio)
- Search by title, sort feed, infinite scroll
- Realtime private messages (Socket.io)
- Profanity filter + post/comment cooldowns

## Brand

From gila: dark `#001317`, accent `#00fcee`, light bg `#efefef`, Aeonik, `--ease-augen` motion.
