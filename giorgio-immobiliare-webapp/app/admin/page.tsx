"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PropertyType, Listing } from "@prisma/client";
import Link from "next/link";

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
        fetchListings(); // Refresh listings
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestione Annunci</h1>
        <Link
          href="/admin/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuovo Annuncio
        </Link>
      </div>

      <div className="flex space-x-4 mb-8">
        <div>
          <label
            htmlFor="propertyType"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo di Proprietà
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
            className="block text-sm font-medium text-gray-700"
          >
            Ordina per
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="createdAt_desc">Più Recenti</option>
            <option value="createdAt_asc">Meno Recenti</option>
            <option value="price_asc">Prezzo Crescente</option>
            <option value="price_desc">Prezzo Decrescente</option>
          </select>
        </div>
      </div>

      {loading && <p>Caricamento...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {listings.length === 0 ? (
              <li className="px-4 py-4 text-center text-gray-500">
                Nessun annuncio trovato.
              </li>
            ) : (
              listings.map((listing) => (
                <li key={listing.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {listing.title} (Rif. {listing.referenceNumber})
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {listing.propertyType}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {listing.location}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          €{listing.price.toString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-4">
                        <Link
                          href={`/admin/edit/${listing.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Modifica
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
