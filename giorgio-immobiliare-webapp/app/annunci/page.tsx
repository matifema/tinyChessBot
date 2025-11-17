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
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0033cc] to-[#0055ff] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tutti gli Annunci
          </h1>
          <p className="text-xl text-blue-100">
            Scopri tutte le nostre proposte immobiliari
          </p>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Nessun annuncio disponibile
            </h2>
            <p className="text-gray-600">
              Al momento non ci sono annunci disponibili. Torna presto per
              nuove opportunità!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {listings.length}
                </span>{" "}
                {listings.length === 1 ? "annuncio trovato" : "annunci trovati"}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
