# Application Architecture

This document outlines the architecture of the GiorgioImmobiliare website, built with Next.js 14 and deployed on Vercel.

## 1. Core Philosophy

The architecture prioritizes simplicity, performance, and maintainability. It leverages the full power of the Next.js App Router, emphasizing Server Components for performance and Server Actions for secure data mutations.

## 2. Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres
- **Authentication**: NextAuth.js
- **UI**: shadcn/ui with Tailwind CSS
- **Deployment**: Vercel

## 3. Folder Structure

The project is organized to separate concerns and features clearly.

```
.
├── /app/
│   ├── (public)/              # Public-facing routes
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Home page
│   │   └── /immobili/
│   │       ├── page.tsx       # All listings page
│   │       └── /[id]/page.tsx # Single listing detail page
│   │
│   ├── (admin)/               # Agent-only protected routes
│   │   ├── /dashboard/page.tsx
│   │   └── layout.tsx
│   │
│   └── /api/auth/[...nextauth]/route.ts # NextAuth.js route
│
├── /actions/                  # Next.js Server Actions for data mutation
│   └── listing-actions.ts
│
├── /components/               # Shared React components (UI, layout, etc.)
│   ├── /ui/                   # shadcn/ui components
│   └── /shared/               # Custom shared components
│
├── /lib/                      # Core logic, helpers, and database access
│   ├── db.ts                  # Database client and queries
│   └── types.ts               # TypeScript type definitions
│
├── /public/                   # Static assets (images, fonts)
└── middleware.ts              # Next.js middleware for protecting admin routes
```

## 4. Data Flow and State Management

- **Data Fetching**: Primarily done on the server using React Server Components (RSCs). Pages and components fetch data directly from the database, minimizing client-side loading states and API calls.
- **Data Mutation**: Handled exclusively through **Next.js Server Actions**. Forms on the client call these server-side functions directly to create, update, or delete data. This approach is secure and eliminates the need for manual API endpoint creation.
- **State Management**: Client-side state is kept to a minimum.
    - **URL State**: Filters and search queries on the listings page are managed via URL query parameters (`?type=villa`), making the state shareable and bookmarkable.
    - **UI State**: Local component state (e.g., for toggling a dropdown) is handled by React hooks (`useState`).

## 5. Authentication

Authentication is implemented only for the admin panel.

- **Provider**: NextAuth.js with a `CredentialsProvider`.
- **Strategy**: A simple username/password check against environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). This avoids the complexity of a user database for a single-agent system.
- **Route Protection**: The `/admin` routes are protected using Next.js Middleware (`middleware.ts`), which checks for a valid session and redirects unauthenticated users to a login page.

## 6. Styling

- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) is used for all styling, providing a utility-first approach.
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) provides a set of accessible and customizable components. Components are added via the CLI (`npx shadcn-ui@latest add <component>`) and can be modified directly within the project.

## 7. Deployment

The application is deployed on Vercel.
- **Continuous Integration**: Vercel automatically deploys the `main` branch.
- **Infrastructure**: Vercel handles the serverless functions, database (Vercel Postgres), and image storage (Vercel Blob), providing a fully managed, high-performance infrastructure.
