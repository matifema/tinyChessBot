export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 pt-24">
      <h1 className="text-5xl font-extrabold mb-12 text-[#333333]">
        Le nostre ultime proprietà
      </h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/annunci/${listing.id}`}
            className="group"
          >
            <div className="border rounded-lg shadow-md bg-white p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <h2 className="text-2xl font-semibold text-blue-600 group-hover:underline mb-2">
                {listing.title}
              </h2>
              <p className="text-lg text-gray-800 font-bold">
                €{listing.price.toString()}
              </p>
              <p className="text-md text-gray-600 mb-4 flex-grow">
                {listing.location}
              </p>
              <p className="text-gray-700 leading-relaxed line-clamp-3">
                {listing.description || "Nessuna descrizione disponibile."}
              </p>
            </div>
          </Link>
        ))}
        {listings.length === 0 && (
          <p className="text-center col-span-3 text-gray-500">
            Nessun annuncio disponibile al momento.
          </p>
        )}
      </div>
    </div>
  );
}
