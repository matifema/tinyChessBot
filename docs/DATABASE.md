# Database Schema

This document defines the database schema for the GiorgioImmobiliare application, hosted on Vercel Postgres.

## 1. Database Engine

- **Provider**: Vercel Postgres
- **Engine**: PostgreSQL 16

## 2. Connection

The application connects to the database using connection strings provided by Vercel as environment variables. All database access is funneled through the `/lib/db.ts` module.

## 3. Tables

### `listings`

This is the primary table that stores all property listing information.

#### SQL Schema (DDL)

```sql
-- Custom ENUM types for status and property type
CREATE TYPE listing_status AS ENUM ('for_sale', 'for_rent', 'sold', 'rented');
CREATE TYPE property_type AS ENUM ('appartamento', 'villa', 'casale', 'terreno', 'box');

-- The main listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    status listing_status NOT NULL DEFAULT 'for_sale',
    property_type property_type NOT NULL,
    bedrooms INT,
    bathrooms INT,
    square_meters INT,
    image_urls TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: Create an index on columns used for filtering
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_location ON listings(location);
```

#### Column Descriptions

| Column          | Type                 | Description                                                                 |
|-----------------|----------------------|-----------------------------------------------------------------------------|
| `id`            | `UUID`               | The unique identifier for the listing (Primary Key).                          |
| `title`         | `VARCHAR(255)`       | The title of the listing (e.g., "Villa Panoramica").                          |
| `description`   | `TEXT`               | A detailed description of the property.                                     |
| `location`      | `VARCHAR(255)`       | The city or area where the property is located (e.g., "Cerenova").          |
| `price`         | `NUMERIC(12, 2)`     | The price of the property. For rentals, this is the monthly rate.           |
| `status`        | `listing_status`     | The current status of the listing (`for_sale`, `for_rent`, `sold`, `rented`). |
| `property_type` | `property_type`      | The type of property (`appartamento`, `villa`, `casale`, `terreno`, `box`).   |
| `bedrooms`      | `INT`                | The number of bedrooms.                                                     |
| `bathrooms`     | `INT`                | The number of bathrooms.                                                    |
| `square_meters` | `INT`                | The total area of the property in square meters.                            |
| `image_urls`    | `TEXT[]`             | An array of URLs pointing to the property images stored in Vercel Blob.       |
| `created_at`    | `TIMESTAMPTZ`        | Timestamp of when the listing was created.                                  |
| `updated_at`    | `TIMESTAMPTZ`        | Timestamp of the last update to the listing.                                |

---
*This schema is the single source of truth for the database structure. Any migrations or changes should be reflected here.*
