# GiorgioImmobiliare Website

This is the official website for the GiorgioImmobiliare real estate agency. It serves as a public-facing platform for users to view property listings and as an internal tool for the agent to manage these listings.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Vercel Postgres](https://vercel.com/storage/postgres)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (for Admin Panel)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Image Storage**: [Vercel Blob](https://vercel.com/storage/blob)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- A Vercel account with a Postgres database and Blob store configured.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/giorgio-immobiliare.git
    cd giorgio-immobiliare
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables for your Vercel Postgres database, Vercel Blob storage, and NextAuth.js.

    ```sh
    # Vercel Postgres
    POSTGRES_URL=
    POSTGRES_PRISMA_URL=
    POSTGRES_URL_NON_POOLING=
    POSTGRES_USER=
    POSTGRES_HOST=
    POSTGRES_PASSWORD=
    POSTGRES_DATABASE=

    # Vercel Blob
    BLOB_READ_WRITE_TOKEN=

    # NextAuth.js
    AUTH_SECRET=
    ADMIN_USERNAME=
    ADMIN_PASSWORD=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Public Website:**
    - View all property listings.
    - Filter and search listings by type, location, and price.
    - View detailed information for each property.
    - Fully responsive design.
- **Admin Panel:**
    - Secure login for the real estate agent.
    - Dashboard to view all listings in a table.
    - CRUD (Create, Read, Update, Delete) functionality for listings.
    - Image upload capabilities for property photos.

## Deployment

The application is designed for seamless deployment on [Vercel](https://vercel.com/). Simply connect your Git repository to a Vercel project. Vercel will automatically build and deploy the application, handling environment variables and integrations with Vercel Postgres and Blob.
