import prisma from "@/lib/prisma";
import PropertyCard from "../components/PropertyCard";

export const dynamic = "force-dynamic";

export default async function AnnunciPage() {
  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      status: {
        in: ["for_sale", "for_rent"],
      },
    },
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Tutti gli Annunci</h1>
      {listings.length === 0 ? (
        <p className="text-center text-gray-500">
          Nessun annuncio disponibile al momento.
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
