# GiorgioImmobiliare Website

This is the official website for the GiorgioImmobiliare real estate agency, presented entirely in Italian. It serves as a public-facing platform for users to view property listings and as an internal tool for the agent to manage these listings.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (for Admin Panel)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Image Storage**: Cloudflare R2
- **Deployment**: Cloudflare Pages

## Documentation

Detailed documentation for the project architecture, database, and API can be found in the `docs/` directory:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Documentation](docs/API.md)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- A Cloudflare account with:
  - Pages project
  - D1 database
  - R2 bucket

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

3.  **Set up Cloudflare resources (local + deploy):**
    - Create a D1 database and apply migrations (see commands below).
    - Create an R2 bucket for images.
    - Configure bindings in `giorgio-immobiliare-webapp/wrangler.toml` (D1 + R2).

4.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables for NextAuth.js.

    ```sh
    # NextAuth.js
    AUTH_SECRET=
    ADMIN_EMAIL=
    ADMIN_PASSWORD=
    ```

5.  **Run the development server:**
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

The application is designed for deployment on Cloudflare Pages. Configure your Pages project to build the `giorgio-immobiliare-webapp` directory and ensure D1 + R2 bindings are set in your Pages project settings (or via `wrangler.toml` if using Wrangler-based workflows).
