"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    status: "for_sale",
    propertyType: "appartamento",
    bedrooms: "",
    bathrooms: "",
    squareMeters: "",
    imageUrls: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create listing");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold">Crea Nuovo Annuncio</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Torna alla Gestione
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Titolo
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Località
          </label>
          <input
            type="text"
            name="location"
            id="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Prezzo
          </label>
          <input
            type="number"
            name="price"
            id="price"
            required
            value={formData.price}
            onChange={handleChange}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="propertyType"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo di Proprietà
            </label>
            <select
              name="propertyType"
              id="propertyType"
              required
              value={formData.propertyType}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            >
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
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Stato
            </label>
            <select
              name="status"
              id="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            >
              {["for_sale", "for_rent", "sold", "rented"].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descrizione
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="bedrooms"
              className="block text-sm font-medium text-gray-700"
            >
              Camere da letto
            </label>
            <input
              type="number"
              name="bedrooms"
              id="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="bathrooms"
              className="block text-sm font-medium text-gray-700"
            >
              Bagni
            </label>
            <input
              type="number"
              name="bathrooms"
              id="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="squareMeters"
              className="block text-sm font-medium text-gray-700"
            >
              Metri quadri
            </label>
            <input
              type="number"
              name="squareMeters"
              id="squareMeters"
              value={formData.squareMeters}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="imageUrls"
            className="block text-sm font-medium text-gray-700"
          >
            URL Immagini
          </label>
          <input
            type="text"
            name="imageUrls"
            id="imageUrls"
            value={formData.imageUrls}
            onChange={handleChange}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Separati da virgola, es. url1, url2"
          />
          <p className="mt-2 text-sm text-gray-500">
            Inserisci gli URL delle immagini separati da una virgola.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? "Creazione in corso..." : "Crea Annuncio"}
          </button>
        </div>
      </form>
    </div>
  );
}
