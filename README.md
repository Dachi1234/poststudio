# PostStudio — AI Social Media Post Creator

A full-stack app for generating, designing, and exporting branded social media posts for **CodeLess** — built with Next.js 14 (frontend) and Node.js/Express (backend).

---

## Project Structure

```
POST_CREATOR/
├── poststudio/        ← Next.js 14 frontend (deploy to Vercel)
└── backend/           ← Node.js/Express backend (deploy to Cloud Run)
```

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 20.x |
| npm | 10.x |
| Git | any recent |
| Google Chrome (optional) | any — Puppeteer downloads its own Chromium |

---

## Quick Start (Local Dev)

### 1. Clone the repo

```bash
git clone https://github.com/Dachi1234/poststudio.git
cd poststudio
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create `.env` (copy from `.env.example` and fill in your keys):

```bash
cp .env.example .env
```

`.env` contents:
```
PORT=8080
ANTHROPIC_API_KEY=your_anthropic_key_here
REPLICATE_API_TOKEN=your_replicate_token_here
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

Start the backend:
```bash
node server.js
# → PostStudio backend running on port 8080
```

> **Note:** On first run, Puppeteer will use its bundled Chromium (~170MB, downloaded automatically to `~/.cache/puppeteer/` — NOT in the project folder). This only happens once per machine.

---

### 3. Set up the Frontend

```bash
cd ../poststudio
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> The `ANTHROPIC_API_KEY` and `REPLICATE_API_TOKEN` are no longer needed in the frontend — they live in the backend.

Start the frontend:
```bash
npm run dev
# → http://localhost:3000 (or 3001 if 3000 is taken)
```

---

## Running Both Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd poststudio
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Backend API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/api/generate-copy` | Generate post copy via Claude |
| POST | `/api/generate-image/flux` | FLUX Schnell — fast photo preview |
| POST | `/api/generate-image/flux-pro` | FLUX 1.1 Pro — best quality photo |
| POST | `/api/generate-image/recraft` | Recraft v3 — graphic design style |
| POST | `/api/generate-image/ideogram` | Ideogram v3 Turbo — text in image |
| POST | `/api/generate-image/nano-banana` | Google Imagen 3 Fast |
| POST | `/api/generate-image/nano-banana-pro` | Google Imagen 3 Pro |
| POST | `/api/export-template` | Render template with Puppeteer → PNG/JPG |

---

## Available Templates (10 total)

| ID | Name | Best for |
|----|------|----------|
| `gradient-overlay` | Gradient Overlay | Instagram feed posts |
| `bold-statement` | Bold Statement | Announcements, quotes |
| `split-layout` | Split Layout | Posts with photos |
| `geometric-bold` | Geometric Bold | Bold brand statements |
| `big-quote` | Big Quote | Testimonials, quotes |
| `stat-card` | Stat Card | Numbers, milestones |
| `before-after` | Before / After | Transformation stories |
| `checklist` | Checklist | Myth-busting posts |
| `typography-poster` | Type Poster | Bold statements |
| `minimal-card` | Minimal Card | Strong copy |

---

## Backend Dependencies

```json
"express": "^4.18.2"
"cors": "^2.8.5"
"dotenv": "^16.3.1"
"puppeteer": "^21.0.0"
"sharp": "^0.33.0"
"replicate": "^0.25.0"
"@anthropic-ai/sdk": "^0.24.0"
```

## Frontend Dependencies

```json
"next": "14.x"
"react": "18.x"
"typescript": "5.x"
"tailwindcss": "3.x"
"fabric": "^6.x"
"sonner": "^1.x"
"lucide-react": "^0.x"
"@anthropic-ai/sdk": "^0.24.0"
```

---

## Deploy to Production

### Frontend → Vercel

1. Connect the `poststudio/` folder to Vercel
2. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-cloud-run-url.run.app
   ```

### Backend → Google Cloud Run

```bash
cd backend

gcloud auth login
gcloud config set project poststudio-backend

gcloud run deploy poststudio-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 60 \
  --set-env-vars "ANTHROPIC_API_KEY=your_key" \
  --set-env-vars "REPLICATE_API_TOKEN=your_token" \
  --set-env-vars "FRONTEND_URL=https://your-vercel-app.vercel.app"
```

After deploy, copy the Cloud Run URL and update `NEXT_PUBLIC_API_URL` in Vercel.

---

## Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 8080) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `REPLICATE_API_TOKEN` | Yes | Replicate API token |
| `FRONTEND_URL` | Yes | Allowed CORS origin |
| `NODE_ENV` | No | `development` or `production` |
| `PUPPETEER_EXECUTABLE_PATH` | No | Set automatically in Docker |

### Frontend (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (`http://localhost:8080` locally) |

---

## .gitignore Notes

The following are excluded from the repo and must be created manually:
- `backend/.env` — create from `backend/.env.example`
- `poststudio/.env.local` — create manually (see above)
- `node_modules/` in both folders — run `npm install` in each
