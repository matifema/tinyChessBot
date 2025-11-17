import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageGallery from "@/app/components/ImageGallery";
import { use } from "react";

interface ListingPageProps {
  params: {
    id: string;
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  // HACK: With Turbopack, `params` can be a promise. `React.use` unwraps it.
  // The cast is necessary because the defined prop type is a plain object.
  const { id } = use(params as unknown as Promise<{ id: string }>);

  if (!id) {
    notFound();
  }
  
  console.log(`[ListingPage] Searching for listing with ID: '${id}'`);

  // DEBUG: Check what listings are visible from this component                            
  const allListings = await prisma.listing.findMany({ select: { id: true } });
  console.log(
    "[ListingPage] IDs of all listings found in DB:",
    allListings.map((l) => l.id)
  );

  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    console.log(`[ListingPage] Listing with ID '${id}' not found in database.`);
    notFound();
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{listing.location}</p>

        <ImageGallery imageUrls={listing.imageUrls} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Descrizione</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {listing.description || "Nessuna descrizione disponibile."}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Dettagli</h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Prezzo:</span> €
                {listing.price.toString()}
              </p>
              <p>
                <span className="font-semibold">Tipo:</span>{" "}
                {listing.propertyType}
              </p>
              <p>
                <span className="font-semibold">Stato:</span> {listing.status}
              </p>
              {listing.bedrooms && (
                <p>
                  <span className="font-semibold">Camere da letto:</span>{" "}
                  {listing.bedrooms}
                </p>
              )}
              {listing.bathrooms && (
                <p>
                  <span className="font-semibold">Bagni:</span>{" "}
                  {listing.bathrooms}
                </p>
              )}
              {listing.squareMeters && (
                <p>
                  <span className="font-semibold">Metri quadri:</span>{" "}
                  {listing.squareMeters} m²
                </p>
              )}
              <p className="pt-4 text-sm text-gray-500">
                Riferimento: {listing.referenceNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
