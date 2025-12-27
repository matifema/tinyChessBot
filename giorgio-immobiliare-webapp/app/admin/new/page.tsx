"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent, useRef } from "react";
import Link from "next/link";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

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

  const validateFiles = (fileList: FileList): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Tipo di file non supportato. Usa JPG, JPEG, PNG o WEBP.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File troppo grande. Massimo 10MB.`);
      } else {
        valid.push(file);
      }
    });

    return { valid, errors };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { valid, errors } = validateFiles(e.target.files);
      
      if (errors.length > 0) {
        setError(errors.join("\n"));
      } else {
        setError(null);
      }
      
      setFiles(valid);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const uploadedImageUrls: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const response = await fetch(`/api/upload?filename=${file.name}`, {
            method: "POST",
            headers: {
              "x-admin-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "",
            },
            body: file,
          });

          const rawText = await response.text();
          let parsed: any = null;

          try {
            parsed = rawText ? JSON.parse(rawText) : null;
          } catch {
            // Keep parsed as null; we'll throw a more helpful error below.
          }

          if (!response.ok) {
            throw new Error(
              parsed?.error ||
                `Failed to upload ${file.name} (HTTP ${response.status}). Response: ${rawText || "<empty>"}`
            );
          }

          const newBlob = parsed as { url?: string } | null;
          if (!newBlob?.url) {
            throw new Error(`Upload did not return a URL. Response: ${rawText || "<empty>"}`);
          }

          uploadedImageUrls.push(newBlob.url);
        }
      }

      const listingData = {
        ...formData,
        imageUrls: uploadedImageUrls,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "",
        },
        body: JSON.stringify(listingData),
      });

      if (!res.ok) {
        const rawText = await res.text();
        let parsed: any = null;

        try {
          parsed = rawText ? JSON.parse(rawText) : null;
        } catch {
          // ignore
        }

        throw new Error(
          parsed?.error ||
            `Failed to create listing (HTTP ${res.status}). Response: ${rawText || "<empty>"}`
        );
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033cc]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-[#0033cc] hover:text-[#0055ff] font-semibold mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Torna alla Gestione
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Crea Nuovo Annuncio
          </h1>
          <p className="text-gray-600 mt-1">
            Compila tutti i campi per creare un nuovo annuncio immobiliare
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg whitespace-pre-line">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Titolo *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              placeholder="Es. Appartamento luminoso con vista mare"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Località *
            </label>
            <input
              type="text"
              name="location"
              id="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              placeholder="Es. Cerenova, Cerveteri"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Prezzo (€) *
            </label>
            <input
              type="number"
              name="price"
              id="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              placeholder="150000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="propertyType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Tipo di Proprietà *
              </label>
              <select
                name="propertyType"
                id="propertyType"
                required
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
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
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Stato *
              </label>
              <select
                name="status"
                id="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              >
                <option value="for_sale">In Vendita</option>
                <option value="for_rent">In Affitto</option>
                <option value="sold">Venduto</option>
                <option value="rented">Affittato</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Descrizione
            </label>
            <textarea
              name="description"
              id="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
              placeholder="Descrivi le caratteristiche principali dell'immobile..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="bedrooms"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Camere da letto
              </label>
              <input
                type="number"
                name="bedrooms"
                id="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
                placeholder="3"
              />
            </div>
            <div>
              <label
                htmlFor="bathrooms"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Bagni
              </label>
              <input
                type="number"
                name="bathrooms"
                id="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
                placeholder="2"
              />
            </div>
            <div>
              <label
                htmlFor="squareMeters"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Metri quadri
              </label>
              <input
                type="number"
                name="squareMeters"
                id="squareMeters"
                value={formData.squareMeters}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033cc] focus:border-transparent"
                placeholder="120"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="images"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Immagini
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0033cc] transition-colors">
              <input
                type="file"
                name="images"
                id="images"
                ref={inputFileRef}
                onChange={handleFileChange}
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputFileRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Seleziona Immagini
              </button>
              <p className="mt-2 text-sm text-gray-500">
                PNG, JPG, JPEG, WEBP fino a 10MB
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  {files.length} {files.length === 1 ? "file" : "file"}{" "}
                  selezionato{files.length === 1 ? "" : "i"}:
                </p>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Rimuovi file"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#0033cc] text-white rounded-lg hover:bg-[#0055ff] transition-colors font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creazione in corso...
                </span>
              ) : (
                "Crea Annuncio"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
