import { Listing } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  listing: Listing;
}

export default function PropertyCard({ listing }: PropertyCardProps) {
  const firstImage = listing.imageUrls[0] || "/placeholder.jpg";

  return (
    <Link href={`/annunci/${listing.id}`} className="group">
      <div className="border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative w-full h-56">
          <Image
            src={firstImage}
            alt={listing.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h2 className="text-2xl font-semibold text-blue-600 group-hover:underline mb-2">
            {listing.title}
          </h2>
          <p className="text-lg text-gray-800 font-bold">
            €{listing.price.toString()}
          </p>
          <p className="text-md text-gray-600 mb-4 flex-grow">
            {listing.location}
          </p>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-sm font-medium text-gray-700">
              Rif. {listing.referenceNumber}
            </span>
            <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-lg">
              {listing.propertyType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
