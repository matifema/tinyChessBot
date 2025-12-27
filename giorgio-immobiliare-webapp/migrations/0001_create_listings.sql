-- D1 / SQLite schema for listings
-- Mirrors the Prisma Listing model, with these differences:
-- - image_urls is stored as JSON text (TEXT) instead of TEXT[]
-- - enums are stored as TEXT with CHECK constraints
-- - reference_number is an autoincrement integer unique
-- - created_at / updated_at stored as ISO strings (TEXT)

PRAGMA foreign_keys = ON;

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

-- Auto-increment reference_number behavior:
-- In SQLite, AUTOINCREMENT only works on INTEGER PRIMARY KEY.
-- We emulate it with a trigger that sets reference_number to max+1 when omitted/0.
CREATE TRIGGER IF NOT EXISTS listings_reference_number_autoinc
BEFORE INSERT ON listings
FOR EACH ROW
WHEN NEW.reference_number IS NULL OR NEW.reference_number = 0
BEGIN
  SELECT
    CASE
      WHEN (SELECT COUNT(*) FROM listings) = 0
      THEN NEW.reference_number = 1
      ELSE NEW.reference_number = (SELECT MAX(reference_number) + 1 FROM listings)
    END;
END;
