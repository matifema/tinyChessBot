export type ListingStatus = "for_sale" | "for_rent" | "sold" | "rented";
export type PropertyType =
  | "appartamento"
  | "villa"
  | "casale"
  | "negozio"
  | "terreno"
  | "box";

export interface Listing {
  id: string;
  referenceNumber: number;
  title: string;
  description: string | null;
  location: string;
  price: number;
  status: ListingStatus;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

function parseImageUrls(value: unknown): string[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function mapListingRow(row: Record<string, unknown>): Listing {
  return {
    id: String(row.id),
    referenceNumber: Number(row.reference_number),
    title: String(row.title),
    description: row.description === null || row.description === undefined ? null : String(row.description),
    location: String(row.location),
    price: Number(row.price),
    status: row.status as ListingStatus,
    propertyType: row.property_type as PropertyType,
    bedrooms: row.bedrooms === null || row.bedrooms === undefined ? null : Number(row.bedrooms),
    bathrooms: row.bathrooms === null || row.bathrooms === undefined ? null : Number(row.bathrooms),
    squareMeters:
      row.square_meters === null || row.square_meters === undefined ? null : Number(row.square_meters),
    imageUrls: parseImageUrls(row.image_urls),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
