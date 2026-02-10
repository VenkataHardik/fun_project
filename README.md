# Penguin Pet

A cute penguin digital pet web app. Log in, set your name and birthday, and take care of your penguin: feed it, give it a bath, and chat with scripted cute replies. Data is stored in the cloud so you can use it from any device.

## Setup

1. Copy `.env.example` to `.env` and set `JWT_SECRET` for production.
2. (Optional) Set `GROQ_API_KEY` in `.env` to enable AI replies (free key at [console.groq.com](https://console.groq.com)). Restart the dev server after changing `.env`. Without a key, the app uses scripted replies. Check `/api/ask/status` when logged in to confirm (`openaiConfigured: true`). Chat input is limited to 500 characters; optional `ASK_RATE_LIMIT_PER_MINUTE` in `.env` rate-limits ask requests per user (default 30, set to 0 to disable).
3. Install dependencies: `npm install`
3. Push the database schema: `npm run db:push`
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000). Register an account, then set your name and birthday in Profile.

For a single-friend deployment, set `FRIEND_DISPLAY_NAME` and `FRIEND_BIRTHDAY` in `.env` to preload her name and birthday; the app uses these when the profile is empty, and the header can show "{Name}'s Penguin".

## Tech

- Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Prisma + SQLite (or switch `DATABASE_URL` to PostgreSQL)
- JWT auth via HTTP-only cookie

## Features

- **Auth**: Register, login, logout; protected routes
- **Profile**: Display name (what the penguin calls you) and birthday
- **Penguin**: Feed and bath actions; hunger and cleanliness decay over time; mood (happy / ok / sad)
- **Chat**: Ask the penguin anything. Replies appear in the **penguin speech bubble** above the pet. Use Groq for free AI replies, or scripted cute answers (name + birthday) with no API key
- **Birthday**: On your birthday, special UI and birthday-themed replies
