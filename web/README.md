This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Prisma / Supabase setup

- Place your database secrets in `web/.env` for Prisma CLI. If you prefer to keep local-only overrides, mirror them in `web/.env.local`; it will override values from `.env` when running CLI or Next dev.
- Required variables: `DATABASE_URL` (Supabase pooled URL for app runtime) and, optionally, `DIRECT_URL` (Supabase direct URL for migrations/Prisma Client).
- Run Prisma commands from the `web` directory so `prisma.config.ts` can load your `.env`/`.env.local`:
  - `npx prisma validate`
  - `npx prisma migrate status`
  - `npx prisma migrate dev --name vv_init` (or `migrate deploy` if migrations already exist)
  - `npx prisma generate`
- For Vercel, set `DATABASE_URL` to the pooled connection string (pgBouncer) and `DIRECT_URL` to the direct connection string (no pgBouncer) so migrations keep using a direct connection while serverless runtime uses the pooler.
