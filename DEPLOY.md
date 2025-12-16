Deployment guide — Demo setup (Hostinger shared hosting for frontend + Render for backend)

Overview

This repository contains a React frontend (Vite + TypeScript) in `frontend/` and an Express backend in `backend/`.

Because you have shared hosting (Hostinger), the easiest demo setup is:

- Host the frontend static build on Hostinger (upload to `public_html`) — works with any shared hosting.
- Host the backend on a free managed Node host (Render, Railway, Fly, or Heroku) and point `VITE_API_URL` to the backend URL.

What I'll prepare here:
- `.htaccess` template for SPA fallback (in `frontend/deploy/.htaccess`) for Hostinger uploads
- `Procfile` in `backend/` for deploy to Render/Heroku
- `DEPLOY.md` with step-by-step instructions (this file)

Frontend (Hostinger shared hosting)

1. Set the API base URL for production in a `.env` (locally) before building:

   - In your shell:
     ```bash
     cd frontend
     export VITE_API_URL=https://<YOUR_BACKEND_DOMAIN_OR_RENDER_URL>/api
     npm ci
     npm run build
     ```
   - On Windows (PowerShell):
     ```powershell
     cd frontend
     $env:VITE_API_URL = 'https://<YOUR_BACKEND_DOMAIN>/api'
     npm ci
     npm run build
     ```

2. After the build completes, the production output will be in `frontend/dist/` (Vite default). Upload the *contents* of `dist/` to your Hostinger `public_html/` directory via FTP or the Hostinger File Manager.

3. Upload the `.htaccess` file included at `frontend/deploy/.htaccess` into `public_html/` as well (this enables SPA client-side routing fallback).

4. Ensure CORS on your backend allows `https://<YOUR_DOMAIN>`.

Backend (Render / Railway / Heroku)

1. Create a new web service on Render (or Railway). Connect the repository and set the root to the `backend/` folder if prompted.

2. Set the build and start commands (Render usually auto-detects):
   - Build command: `npm install` (in `backend/`, Render will run install)
   - Start command: `node server.js`

3. Add the following environment variables in the Render dashboard (values from your Supabase project and admin secrets):
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `ADMIN_SECRET`
   - `PORT` (Render provides automatically, optional override)

4. Ensure `Procfile` exists at `backend/Procfile` (this repo includes it) if using Heroku.

5. Deploy and copy the backend URL (e.g. `https://your-app.onrender.com`).

6. Update `VITE_API_URL` in the frontend build step to `https://your-app.onrender.com/api` before building the frontend.

Quick tests after deployment

- Visit your frontend URL (Hostinger site). The app should load and call the backend at `https://your-backend-url/api`.
- Test login, vendor portal, and tracking flows.

Optional: Split deployment (Vercel + Render)

- For faster frontend deployments you can use Vercel (connect repo, set `VITE_API_URL` in Environment Variables). Vercel offers automatic previews, instant builds, and global CDN.
- Host backend on Render/Railway as above.

If you want, I can now:

A) Add `backend/ecosystem.config.js` (PM2) and `backend/start:prod` script.
B) Add a small `frontend/deploy/README.md` with exact upload steps for Hostinger.
C) Prepare a one-click Render deploy file (render.yaml) — optional.

Which option do you want me to prepare next? (A/B/C) or I can implement all of them.