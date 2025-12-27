"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PropertyCard from "../components/PropertyCard";
import { Listing } from "@prisma/client";

// --- Helper Components ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-56 md:h-64 bg-gray-200 w-full" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="pt-4 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/5" />
        <div className="h-4 bg-gray-200 rounded w-1/5" />
      </div>
    </div>
  </div>
);

// --- Main Logic Component ---

function AnnunciContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data States
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

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

  // Fetch Data
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/listings");
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();
        setListings(data);

        if (data.length > 0) {
          const max = Math.max(...data.map((l: Listing) => Number(l.price)));
          const roundedMax = Math.ceil(max / 10000) * 10000;
          setMaxPrice(roundedMax);
          setPriceRange([0, roundedMax]);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter Logic
  useEffect(() => {
    let filtered = [...listings];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.location.toLowerCase().includes(query) ||
          listing.title.toLowerCase().includes(query)
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (listing) => listing.propertyType === selectedType
      );
    }

    filtered = filtered.filter((listing) => {
      const price = Number(listing.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    setFilteredListings(filtered);
  }, [listings, debouncedSearch, selectedType, priceRange]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (type === "all") {
      router.push("/annunci", { scroll: false });
    } else {
      router.push(`/annunci?type=${type}`, { scroll: false });
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedType !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    return count;
  }, [searchQuery, selectedType, priceRange, maxPrice]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-10">
      {/* Filters Container */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8 border border-gray-100">
        {/* Mobile Filter Toggle */}
        <div className="flex justify-between items-center md:hidden mb-4">
          <span className="font-bold text-gray-900 text-lg">Filtra Risultati</span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#0033cc] font-bold bg-blue-50 px-4 py-2 rounded-lg active:bg-blue-100"
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
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            {showFilters ? "Nascondi" : "Filtri"}
            {activeFiltersCount > 0 && (
              <span className="bg-[#0033cc] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Content */}
        <div
          className={`${showFilters ? "block" : "hidden"} md:block space-y-8`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Search & Type */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ricerca
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per località, zona o parola chiave..."
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0033cc] focus:border-transparent transition-all text-base"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0033cc]"
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Tipologia
                </label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedType === type.value
                          ? "bg-[#0033cc] text-white border-[#0033cc] shadow-md transform scale-105"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Fascia di prezzo
              </label>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3 text-sm font-bold text-[#0033cc] tabular-nums">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>

                <div className="relative h-8">
                  {/* Track */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full" />
                  {/* Active range */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#0033cc] rounded-full"
                    style={{
                      left: `${(priceRange[0] / maxPrice) * 100}%`,
                      right: `${100 - (priceRange[1] / maxPrice) * 100}%`,
                    }}
                  />

                  {/* Sliders */}
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="10000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Math.min(
                        Number(e.target.value),
                        priceRange[1] - 10000
                      );
                      setPriceRange([val, priceRange[1]]);
                    }}
                    className="absolute inset-0 w-full h-8 appearance-none bg-transparent pointer-events-none z-20"
                    style={{
                      zIndex: priceRange[0] > maxPrice - 100000 ? 30 : 20,
                    }}
                    aria-label="Prezzo minimo"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Math.max(
                        Number(e.target.value),
                        priceRange[0] + 10000
                      );
                      setPriceRange([priceRange[0], val]);
                    }}
                    className="absolute inset-0 w-full h-8 appearance-none bg-transparent pointer-events-none z-20"
                    aria-label="Prezzo massimo"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 tabular-nums">
                  <span>0</span>
                  <span>{formatPrice(maxPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setPriceRange([0, maxPrice]);
                  router.push("/annunci", { scroll: false });
                }}
                className="text-sm text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline p-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Rimuovi tutti i filtri
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {loading ? "Caricamento..." : `${filteredListings.length} Risultati`}
        </h2>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-[#0033cc]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nessun risultato trovato
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Non abbiamo trovato annunci corrispondenti ai tuoi criteri.
                Prova a espandere il raggio di ricerca o a rimuovere alcuni
                filtri.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setPriceRange([0, maxPrice]);
                }}
                className="inline-flex items-center px-6 py-3 bg-[#0033cc] text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-900/20"
              >
                Mostra tutti gli immobili
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }

        /* WebKit */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
          border: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #0033cc;
          border: 2px solid white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          margin-top: -7px; /* centers thumb on 4px track */
        }
        input[type="range"]:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(0, 51, 204, 0.25);
        }

        /* Firefox */
        input[type="range"]::-moz-range-track {
          height: 4px;
          background: transparent;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #0033cc;
          border: 2px solid white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
        input[type="range"]:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(0, 51, 204, 0.25);
        }
      `}</style>
    </div>
  );
}

// --- Exported Page Wrapper ---

export default function AnnunciPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0033cc] text-white pt-8 md:pt-10 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            Tutti gli Annunci
          </h1>
          <p className="text-blue-100 text-lg">
            Scopri le nostre migliori proposte immobiliari
          </p>
        </div>
      </div>

      {/* Suspense Boundary for useSearchParams */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {[1, 2, 3].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <AnnunciContent />
      </Suspense>
    </div>
  );
}
