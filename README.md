# Stamply

Digital loyalty platform that replaces physical punch cards with mobile wallet passes. Merchants create loyalty programs, customers enroll via QR code, and stamps are tracked automatically with Apple Wallet and Google Wallet integration.

## Features

- **Merchant Dashboard** — Create and manage loyalty programs with custom branding, stamp counts, and rewards
- **QR Code Enrollment** — Customers join programs by scanning a QR code, no app download required
- **Mobile Wallet Passes** — Auto-generated Apple Wallet and Google Wallet passes delivered instantly
- **PWA Scanner** — Merchants scan customer QR codes from any device to add stamps
- **Real-time Analytics** — Track active cards, stamps given, and rewards redeemed
- **Fraud Prevention** — Rate-limited stamping (1 stamp per card per 15 minutes)
- **Customizable Cards** — Custom colors, emoji stamp icons, and business branding

## Tech Stack

| Layer        | Technology                                  |
|-------------|---------------------------------------------|
| Frontend    | Next.js 16, React 19, TypeScript            |
| Styling     | Tailwind CSS 4, shadcn/ui, Motion           |
| Backend     | Express.js 5, TypeScript                    |
| Database    | PostgreSQL, Prisma 7                        |
| Auth        | JWT, bcrypt                                 |
| Wallet      | passkit-generator (Apple), Google Wallet API |
| Data        | SWR (client caching)                        |

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

## Setup

### 1. Clone and install

```bash
git clone https://github.com/alexandreelkhoury/Stamply.git
cd Stamply

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure environment variables

```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

Edit both `.env` files with your values. See [.env.example](.env.example) and [backend/.env.example](backend/.env.example) for all available variables.

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev
cd ..
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (port 4000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

### Frontend

| Script          | Command            | Description                        |
|----------------|--------------------|------------------------------------|
| `npm run dev`   | `next dev`         | Start dev server on port 3000      |
| `npm run build` | `prisma generate && next build` | Build for production |
| `npm start`     | `next start`       | Start production server            |
| `npm run lint`  | `eslint`           | Run linter                         |

### Backend

| Script               | Command                  | Description                        |
|----------------------|-------------------------|------------------------------------|
| `npm run dev`         | `tsx watch src/index.ts` | Start dev server with auto-reload  |
| `npm run build`       | `tsc`                    | Compile TypeScript                 |
| `npm start`           | `node dist/index.js`     | Start production server            |
| `npm run db:generate` | `prisma generate`        | Generate Prisma client             |
| `npm run db:push`     | `prisma db push`         | Push schema to database            |
| `npm run db:migrate`  | `prisma migrate dev`     | Run database migrations            |
| `npm run db:studio`   | `prisma studio`          | Open Prisma visual editor          |

## Project Structure

```
├── src/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── (auth)/               # Login & registration pages
│   │   ├── card/[code]/          # Public loyalty card view
│   │   ├── join/[code]/          # Customer enrollment flow
│   │   ├── dashboard/            # Merchant dashboard
│   │   │   ├── scan/             # QR code scanner
│   │   │   ├── customers/        # Customer management
│   │   │   ├── programs/[id]/    # Program detail
│   │   │   └── setup/            # Program creation wizard
│   │   └── page.tsx              # Landing page
│   ├── components/               # Shared UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities & API client
│   └── providers/                # Context providers (SWR, theme)
├── backend/
│   └── src/
│       ├── controllers/          # Request handlers
│       ├── services/             # Business logic
│       ├── repositories/         # Data access layer
│       ├── routes/               # Express route definitions
│       ├── middleware/            # Auth middleware
│       └── lib/                  # DB client, auth helpers
├── prisma/                       # Frontend Prisma schema & migrations
└── backend/prisma/               # Backend Prisma schema & migrations
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Next.js   │────▶│  Express.js  │────▶│ PostgreSQL │
│  Frontend   │ API │   Backend    │     │  (Prisma)  │
│  :3000      │◀────│   :4000      │◀────│            │
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────┴───────┐
                    │  Wallet APIs │
                    │  Apple / Google │
                    └──────────────┘
```

**Flow:** Customer enrolls via QR → card created with unique QR code → merchant scans to stamp → backend validates and updates wallet pass → customer sees updated pass on their phone.

## License

All rights reserved.
