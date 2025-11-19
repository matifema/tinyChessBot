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
| `referenceNumber` | Int | Auto-incrementing unique reference number. |
| `title` | String | Title of the listing. |
| `description` | String? | Detailed description (optional). |
| `location` | String | Address or general location. |
| `price` | Decimal | Asking price. |
| `status` | ListingStatus | Status of the listing (default: `for_sale`). |
| `propertyType` | PropertyType | Type of property. |
| `bedrooms` | Int? | Number of bedrooms (optional). |
| `bathrooms` | Int? | Number of bathrooms (optional). |
| `squareMeters` | Int? | Size in square meters (optional). |
| `imageUrls` | String[] | Array of URLs pointing to Vercel Blob storage. |
| `createdAt` | DateTime | Timestamp of creation. |
| `updatedAt` | DateTime | Timestamp of last update. |

### Enums

#### ListingStatus
Defines the availability status of a property.
- `for_sale`
- `for_rent`
- `sold`
- `rented`

#### PropertyType
Defines the category of the property.
- `appartamento`
- `villa`
- `casale`
- `negozio`
- `terreno`
- `box`

## Migrations

Database changes are handled via Prisma Migrations.

- **Run migrations**: `npx prisma migrate dev`
- **Reset database**: `npx prisma migrate reset`
- **Seed data**: `npx prisma db seed` (uses `prisma/seed.ts`)

## Connection

The database connection string is configured via the `POSTGRES_PRISMA_URL` environment variable.
