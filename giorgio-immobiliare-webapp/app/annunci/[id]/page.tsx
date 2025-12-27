import { notFound } from "next/navigation";
import ImageGallery from "@/app/components/ImageGallery";
import Link from "next/link";
import type { Listing } from "@/lib/db";

interface ListingPageProps {
  params: {
    id: string;
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const resolvedParams = await (params as unknown as Promise<{ id: string }>);
  const id = resolvedParams.id;

  if (!id) {
    notFound();
  }

  // Use a relative URL so it works on Cloudflare Pages without relying on NEXTAUTH_URL.
  const res = await fetch(`/api/listings/${id}`, {
    // Ensure we always render fresh data for listings
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
    return null;
  }

  const listing = (await res.json()) as Listing;

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

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      for_sale: "In Vendita",
      for_rent: "In Affitto",
      sold: "Venduto",
      rented: "Affittato",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
            <Link href="/" className="hover:text-[#0033cc]">
              Home
            </Link>
            <span>/</span>
            <Link href="/annunci" className="hover:text-[#0033cc]">
              Annunci
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {listing.referenceNumber}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {listing.title}
              </h1>
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
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
                <span className="text-base md:text-lg">{listing.location}</span>
              </div>
            </div>
            <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
              <div className="text-3xl md:text-4xl font-bold text-[#0033cc] mb-0 md:mb-2">
                {formatPrice(Number(listing.price))}
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Rif. {listing.referenceNumber}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-[#0033cc] text-white rounded-full text-sm font-semibold shadow-sm">
              {getStatusLabel(listing.status)}
            </span>
            <span className="px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-full text-sm font-semibold shadow-sm">
              {getPropertyTypeLabel(listing.propertyType)}
            </span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8 md:mb-12 mx-4 md:mx-0">
          <ImageGallery imageUrls={listing.imageUrls} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            {(listing.bedrooms ||
              listing.bathrooms ||
              listing.squareMeters) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                  Caratteristiche
                </h2>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  {listing.bedrooms && (
                    <div className="flex flex-col md:flex-row items-center md:space-x-3 text-center md:text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mb-2 md:mb-0">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-[#0033cc]"
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
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          {listing.bedrooms}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          Camere
                        </div>
                      </div>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex flex-col md:flex-row items-center md:space-x-3 text-center md:text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mb-2 md:mb-0">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-[#0033cc]"
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
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          {listing.bathrooms}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          Bagni
                        </div>
                      </div>
                    </div>
                  )}
                  {listing.squareMeters && (
                    <div className="flex flex-col md:flex-row items-center md:space-x-3 text-center md:text-left">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mb-2 md:mb-0">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-[#0033cc]"
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
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          {listing.squareMeters}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          m²
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Descrizione
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                {listing.description || "Nessuna descrizione disponibile."}
              </p>
            </div>
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contattaci
              </h2>
              <div className="space-y-4">
                <a
                  href="tel:3333496169"
                  className="flex items-center justify-center space-x-3 w-full px-6 py-4 bg-[#0033cc] text-white rounded-xl hover:bg-[#0055ff] transition-colors font-bold shadow-lg"
                >
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>Chiamaci</span>
                </a>
                <a
                  href="mailto:giorgiotravagliati@gmail.com"
                  className="flex items-center justify-center space-x-3 w-full px-6 py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-bold"
                >
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Invia Email</span>
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Informazioni Agenzia
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-[#0033cc] mt-0.5 flex-shrink-0"
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
                    <div>
                      <div>Via Oriolo 3/C</div>
                      <div>Centro Commerciale I Portici</div>
                      <div>Cerenova - Cerveteri (Roma)</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-[#0033cc] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>Chiuso Giovedì e Domenica</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 md:mt-12 mb-8">
          <Link
            href="/annunci"
            className="inline-flex items-center space-x-2 text-[#0033cc] hover:text-[#0055ff] font-semibold p-2 -ml-2"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Torna agli annunci</span>
          </Link>
        </div>
      </div>

      {/* Mobile Sticky Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 lg:hidden pb-safe">
        <div className="flex gap-3 max-w-md mx-auto">
          <a
            href="tel:3333496169"
            className="flex-1 flex items-center justify-center space-x-2 bg-[#0033cc] text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>Chiama</span>
          </a>
          <a
            href="mailto:giorgiotravagliati@gmail.com"
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}
