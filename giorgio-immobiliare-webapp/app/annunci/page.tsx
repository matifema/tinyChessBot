"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PropertyCard from "../components/PropertyCard";
import { Listing } from "@prisma/client";

export default function AnnunciPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const propertyTypes = [
    { value: "all", label: "Tutti" },
    { value: "appartamento", label: "Appartamenti" },
    { value: "villa", label: "Ville" },
    { value: "casale", label: "Casali" },
    { value: "negozio", label: "Negozi" },
    { value: "terreno", label: "Terreni" },
    { value: "box", label: "Box" },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/listings");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();
        setListings(data);

        // Calculate max price for slider
        if (data.length > 0) {
          const max = Math.max(...data.map((l: Listing) => Number(l.price)));
          setMaxPrice(Math.ceil(max / 10000) * 10000);
          setPriceRange([0, Math.ceil(max / 10000) * 10000]);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    let filtered = [...listings];

    // Filter by search query (location and title)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.location.toLowerCase().includes(query) ||
          listing.title.toLowerCase().includes(query)
      );
    }

    // Filter by property type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (listing) => listing.propertyType === selectedType
      );
    }

    // Filter by price range
    filtered = filtered.filter((listing) => {
      const price = Number(listing.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedType, priceRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (type === "all") {
      router.push("/annunci");
    } else {
      router.push(`/annunci?type=${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0033cc] to-[#0055ff] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tutti gli Annunci
          </h1>
          <p className="text-xl text-blue-100">
            Scopri tutte le nostre proposte immobiliari
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Cerca per località o titolo
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Es. Cerenova, Appartamento..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo di proprietà
            </label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedType === type.value
                      ? "bg-[#0033cc] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Fascia di prezzo
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">{formatPrice(priceRange[0])}</span>
                <span className="font-medium">{formatPrice(priceRange[1])}</span>
              </div>
              <div className="relative">
                {/* Min Price Slider */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="10000"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([
                      Math.min(Number(e.target.value), priceRange[1] - 10000),
                      priceRange[1],
                    ])
                  }
                  className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20"
                  style={{
                    background: "transparent",
                  }}
                />
                {/* Max Price Slider */}
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      Math.max(Number(e.target.value), priceRange[0] + 10000),
                    ])
                  }
                  className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20"
                  style={{
                    background: "transparent",
                  }}
                />
                {/* Track Background */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-[#0033cc] rounded-full"
                    style={{
                      left: `${(priceRange[0] / maxPrice) * 100}%`,
                      right: `${100 - (priceRange[1] / maxPrice) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Prezzo minimo
                  </label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        Math.min(
                          Number(e.target.value),
                          priceRange[1] - 10000
                        ),
                        priceRange[1],
                      ])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Prezzo massimo
                  </label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        Math.max(
                          Number(e.target.value),
                          priceRange[0] + 10000
                        ),
                      ])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedType !== "all" || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setPriceRange([0, maxPrice]);
                  router.push("/annunci");
                }}
                className="flex items-center space-x-2 text-[#fe0000] hover:text-red-700 font-medium transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Cancella tutti i filtri</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? (
              "Caricamento..."
            ) : (
              <>
                <span className="font-semibold text-gray-900">
                  {filteredListings.length}
                </span>{" "}
                {filteredListings.length === 1
                  ? "annuncio trovato"
                  : "annunci trovati"}
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033cc]"></div>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && (
          <>
            {filteredListings.length === 0 ? (
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
                  Nessun annuncio trovato
                </h2>
                <p className="text-gray-600 mb-6">
                  Prova a modificare i filtri di ricerca per trovare più
                  risultati.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setPriceRange([0, maxPrice]);
                    router.push("/annunci");
                  }}
                  className="inline-flex items-center px-6 py-3 bg-[#0033cc] text-white rounded-lg hover:bg-[#0055ff] transition-colors font-semibold"
                >
                  Mostra tutti gli annunci
                </button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0033cc;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
          position: relative;
          z-index: 30;
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0033cc;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          pointer-events: auto;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          background: #0055ff;
        }

        input[type="range"]::-moz-range-thumb:hover {
          background: #0055ff;
        }
      `}</style>
    </div>
  );
}
