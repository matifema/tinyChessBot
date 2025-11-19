# Database Documentation

The project uses **PostgreSQL** as the relational database, managed via **Prisma ORM**.

## Schema Overview

The database schema is defined in `prisma/schema.prisma`.

### Models

#### Listing
The core model representing a real estate property.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Unique identifier. |
| `title` | String | Title of the listing. |
| `description` | String | Detailed description. |
| `price` | Float/Int | Asking price in EUR. |
| `location` | String | Address or general location. |
| `propertyType` | String | Type of property (e.g., Apartment, Villa). |
| `imageUrls` | String[] | Array of URLs pointing to Vercel Blob storage. |
| `createdAt` | DateTime | Timestamp of creation. |
| `updatedAt` | DateTime | Timestamp of last update. |

*(Note: Exact field names and types are defined in `prisma/schema.prisma`)*

## Migrations

Database changes are handled via Prisma Migrations.

- **Run migrations**: `npx prisma migrate dev`
- **Reset database**: `npx prisma migrate reset`
- **Seed data**: `npx prisma db seed` (uses `prisma/seed.ts`)

## Connection

The database connection string is configured via the `POSTGRES_PRISMA_URL` environment variable.
