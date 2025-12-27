-- D1 / SQLite schema for listings
-- Mirrors the previous Listing model, with these differences:
-- - image_urls is stored as JSON text (TEXT) instead of TEXT[]
-- - enums are stored as TEXT with CHECK constraints
-- - reference_number is assigned in application code (SELECT MAX + 1) to avoid
--   SQLite trigger assignment limitations in D1.
-- - created_at / updated_at stored as ISO strings (TEXT)

PRAGMA foreign_keys = ON;

-- Ensure the schema is applied to the correct D1 database by running:
--   npx wrangler d1 execute giorgio-immobiliare --local --file=giorgio-immobiliare-webapp/migrations/0001_create_listings.sql
-- and for production:
--   npx wrangler d1 execute giorgio-immobiliare --remote --file=giorgio-immobiliare-webapp/migrations/0001_create_listings.sql

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY NOT NULL,
  reference_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'for_sale' CHECK (status IN ('for_sale','for_rent','sold','rented')),
  property_type TEXT NOT NULL CHECK (property_type IN ('appartamento','villa','casale','negozio','terreno','box')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_meters INTEGER,
  image_urls TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
