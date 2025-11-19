import { Listing } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  listing: Listing;
}

export default function PropertyCard({ listing }: PropertyCardProps) {
  const firstImage =
    listing.imageUrls[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      appartamento: "Appartamento",
      villa: "Villa",
      casale: "Casale",
      negozio: "Negozio",
      terreno: "Terreno",
      box: "Box",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    if (status === "for_sale") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-white bg-[#0033cc] rounded-full shadow-sm">
          In Vendita
        </span>
      );
    }
    if (status === "for_rent") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-full shadow-sm">
          In Affitto
        </span>
      );
    }
    return null;
  };

  return (
    <Link href={`/annunci/${listing.id}`} className="group block h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col transform active:scale-[0.98] md:active:scale-100 md:group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative w-full h-56 md:h-64 overflow-hidden bg-gray-100">
          <Image
            src={firstImage}
            alt={listing.title}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-110 transition-transform duration-500"
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            {getStatusBadge(listing.status)}
          </div>
          {/* Property Type Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 text-xs font-bold text-gray-800 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
              {getPropertyTypeLabel(listing.propertyType)}
            </span>
          </div>
          {/* Gradient Overlay for text contrast if needed, though we have content below */}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0033cc] transition-colors line-clamp-2 leading-tight">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-4">
            <svg
              className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm truncate">{listing.location}</span>
          </div>

          {/* Features */}
          {(listing.bedrooms || listing.bathrooms || listing.squareMeters) && (
            <div className="flex items-center gap-3 md:gap-4 text-sm text-gray-600 mb-4 flex-wrap">
              {listing.bedrooms && (
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                  <svg
                    className="w-4 h-4 mr-1.5 text-[#0033cc]"
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
                  <span className="font-medium">{listing.bedrooms}</span>
                  <span className="hidden sm:inline ml-1">camere</span>
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                  <svg
                    className="w-4 h-4 mr-1.5 text-[#0033cc]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                  <span className="font-medium">{listing.bathrooms}</span>
                  <span className="hidden sm:inline ml-1">bagni</span>
                </div>
              )}
              {listing.squareMeters && (
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                  <svg
                    className="w-4 h-4 mr-1.5 text-[#0033cc]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  <span className="font-medium">{listing.squareMeters} m²</span>
                </div>
              )}
            </div>
          )}

          {/* Price and Reference */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl md:text-2xl font-bold text-[#0033cc]">
                  {formatPrice(Number(listing.price))}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">
                  Rif. {listing.referenceNumber}
                </div>
              </div>
              <div className="text-[#0033cc] bg-blue-50 p-2 rounded-full group-hover:bg-[#0033cc] group-hover:text-white transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
