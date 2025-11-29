# AI Chat Module Frontend

Next.js frontend application for AI Chat Module with Subscription Management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (to be added)
- **HTTP Client**: Axios
- **Validation**: Zod

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── (auth)/            # Auth routes
│   └── (dashboard)/       # Protected routes
├── components/            # React components
│   ├── chat/              # Chat components
│   └── subscriptions/     # Subscription components
├── lib/                   # Utilities
│   ├── api/               # API client
│   ├── auth/              # Auth utilities
│   └── utils/             # Helper functions
├── types/                 # TypeScript types
└── hooks/                 # Custom React hooks
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

