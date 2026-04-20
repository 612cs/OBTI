# OBTI

## Local Development

This project uses:
- Frontend: Vite (`http://localhost:5173`)
- Backend: local Node API wrapper (`http://localhost:3000/api/generate-avatar`)

`vite.config.js` proxies `/api/*` to `http://localhost:3000`, so frontend code can always call `/api/generate-avatar`.

### 1) Prepare env vars

Create `.env.local` in project root:

```bash
GEMINI_API_KEY=your_real_key
```

The local Node API server will read `.env.local` automatically.

### 2) Run locally

Terminal A:

```bash
npm run dev:api
```

Terminal B:

```bash
npm run dev:web
```

### Optional: debug with Vercel runtime

```bash
npm run dev:api:vercel
```

### 3) Deploy on Vercel

Set `GEMINI_API_KEY` in Vercel Environment Variables (Preview + Production).
