# Deploy Penguin Pet to Vercel

Vercel doesn’t support SQLite (no persistent disk). Use a **hosted PostgreSQL** database, then deploy.

---

## 1. Create a PostgreSQL database

Pick one (all have free tiers):

| Service | Link | Notes |
|--------|-----|------|
| **Vercel Postgres** | [vercel.com/storage/postgres](https://vercel.com/storage/postgres) | Same dashboard as your app |
| **Neon** | [neon.tech](https://neon.tech) | Free tier, works well with Vercel |
| **Supabase** | [supabase.com](https://supabase.com) | Free tier, Postgres + extras |

- Create a project and copy the **connection string** (e.g. `postgresql://user:pass@host/db?sslmode=require`).
- You’ll add this as `DATABASE_URL` on Vercel.

---

## 2. Switch the app to PostgreSQL

The project is set up for Postgres: `prisma/schema.prisma` uses `provider = "postgresql"`.  
Set `DATABASE_URL` in your `.env` to your Postgres connection string (and add the same on Vercel).

---

## 3. Run migrations once (local or CI)

Using your **Postgres** `DATABASE_URL` in `.env`:

```bash
npm install
npx prisma migrate dev --name init
# or, to only push schema without migration history: npx prisma db push
```

This creates the tables in your hosted DB. You only need to do it once per database.

---

## 4. Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in (GitHub).
2. **Add New** → **Project** → import **VenkataHardik/fun_project** (or your repo).
3. **Environment Variables** (before or after first deploy):
   - `DATABASE_URL` = your Postgres connection string
   - `JWT_SECRET` = a long random string (e.g. `openssl rand -base64 32`)
   - Optional: `GROQ_API_KEY`, `FRIEND_DISPLAY_NAME`, `FRIEND_BIRTHDAY`, `DEDICATION_MESSAGE`, `ASK_RATE_LIMIT_PER_MINUTE`
4. Click **Deploy**.

Vercel will run `prisma generate` automatically. It will **not** run `prisma migrate deploy` or `prisma db push` by default.

---

## 5. Run migrations for production

Create the first migration **locally** (with `DATABASE_URL` set to your Postgres URL in `.env`):

```bash
npx prisma migrate dev --name init
```

Commit the new `prisma/migrations` folder and push. Then in **Vercel** set the build command so migrations run on deploy:

- **Settings** → **General** → **Build & Development Settings**
- **Build Command:** `prisma generate && prisma migrate deploy && next build`

Redeploy. Tables will be created/updated on first deploy.

(If you prefer not to run migrations on every deploy, leave build as `next build` and run `npx prisma migrate deploy` once locally with production `DATABASE_URL`.)

---

## 6. After deploy

- Your app URL will be like `https://fun-project-xxx.vercel.app`.
- PWA install (“Add to Home Screen”) works over HTTPS.
- To use a custom domain: Vercel project → **Settings** → **Domains**.
