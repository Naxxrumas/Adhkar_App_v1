# Cloud Deployment Checklist (Vercel & Supabase)

Use this checklist to ensure the application is ready for 100% cloud-only production.

## 1. Vercel Configuration (Frontend)

- [ ] Connect the GitHub repository to a new Vercel Project.
- [ ] Set "Framework Preset" to `Vite`.
- [ ] Ensure the Build Command is `npm run build` or `vite build`.
- [ ] Ensure the Output Directory is `dist`.
- [ ] **Vercel Environment Variables Verification**:
  في `Vercel > Project Settings > Environment Variables` يجب إضافة:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  *Note: Not doing this will trigger the Environment Configuration Error page in the app.*

## 2. Supabase Configuration (Backend)

- [ ] Create a new Project on Supabase.
- [ ] Ensure **Site URL** in `Authentication > URL Configuration` is exactly your Vercel deployment URL (e.g. `https://your-app.vercel.app`).
- [ ] Ensure **Redirect URLs** in `Authentication > URL Configuration` contains `https://your-app.vercel.app/**`.
- [ ] Check Database schema & RLS policies using `SUPABASE_INTEGRATION_GUIDE.md`.

## 3. Google OAuth Configuration

- [ ] In Google Cloud Console, ensure the **Authorized JavaScript Origins** is set to your Supabase Project URL (e.g., `https://[SUPABASE_PROJECT_ID].supabase.co`).
- [ ] Ensure the **Authorized Redirect URIs** is your Supabase callback URL (e.g. `https://[SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`).

## 4. Run & Test Instructions (Without Local Setup)

- [ ] Shut down the local process (`ctrl+c` if running).
- [ ] Shut down `Google Antigravity` if running.
- [ ] Open a browser on an incognito window or your phone.
- [ ] Navigate to your `https://your-app.vercel.app` link.
- [ ] Try logging in.
- [ ] Ensure there are no 404 errors when refreshing the page on `/login` or `/register` (This is handled by `vercel.json`).

Enjoy your 100% Cloud Setup!
