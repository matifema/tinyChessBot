"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/db";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt_desc");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/listings?propertyType=${propertyTypeFilter}&sortBy=${sortBy}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await res.json();
      setListings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchListings();
    }
  }, [status, propertyTypeFilter, sortBy]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo annuncio?")) {
      try {
        const res = await fetch(`/api/listings/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete listing");
        }
        fetchListings();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033cc]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestione Annunci
            </h1>
            <p className="text-gray-600 mt-1">
              Gestisci tutti gli annunci immobiliari
            </p>
          </div>
          <Link
            href="/admin/new"
            className="inline-flex items-center px-6 py-3 bg-[#0033cc] text-white rounded-lg font-semibold hover:bg-[#0055ff] transition-colors shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuovo Annuncio
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="propertyType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Tipo di Proprietà
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              >
                <option value="all">Tutti</option>
                {[
                  "appartamento",
                  "villa",
                  "casale",
                  "negozio",
                  "terreno",
                  "box",
                ].map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="sortBy"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Ordina per
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              >
                <option value="createdAt_desc">Più Recenti</option>
                <option value="createdAt_asc">Meno Recenti</option>
                <option value="price_asc">Prezzo Crescente</option>
                <option value="price_desc">Prezzo Decrescente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033cc]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Listings */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <p className="text-gray-500 text-lg">
                  Nessun annuncio trovato.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {listing.title}
                          </h3>
                          <span className="px-3 py-1 text-xs font-semibold text-white bg-[#0033cc] rounded-full">
                            {listing.propertyType}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
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
                            {listing.location}
                          </div>
                          <div className="font-semibold text-[#0033cc]">
                            €{listing.price.toString()}
                          </div>
                          <div className="text-gray-500">
                            Rif. {listing.referenceNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/edit/${listing.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Modifica
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="px-4 py-2 bg-[#fe0000] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
