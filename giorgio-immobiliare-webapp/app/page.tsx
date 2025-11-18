"use client"

import Link from "next/link";
import prisma from "@/lib/prisma";
import PropertyCard from "@/app/components/PropertyCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredListings = await prisma.listing.findMany({
    where: {
      status: {
        in: ["for_sale", "for_rent"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0033cc] to-[#0055ff] text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "/images/heroimage.png",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0033cc]/95 to-[#0055ff]/90"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Trova{" "}
              <span className="inline-block relative">
                <span className="animated-text">la Casa</span>
              </span>
              <br />
              dei Tuoi Sogni
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Oltre 35 anni di esperienza nel settore immobiliare a Cerenova e
              Cerveteri
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/annunci"
                className="inline-block px-8 py-4 bg-white text-[#0033cc] rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-lg"
              >
                Vedi Tutti gli Annunci
              </Link>
              <a
                href="tel:3333496169"
                className="inline-block px-8 py-4 bg-[#fe0000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center shadow-lg"
              >
                Chiamaci Ora
              </a>
            </div>
          </div>
        </div>

        {/* Animated Text Styles */}
        <style jsx>{`
          @keyframes flipText {
            0%,
            15% {
              content: "la Casa";
            }
            16%,
            31% {
              content: "la Villa";
            }
            32%,
            47% {
              content: "l'Appartamento";
            }
            48%,
            63% {
              content: "il Casale";
            }
            64%,
            79% {
              content: "il Negozio";
            }
            80%,
            95% {
              content: "il Terreno";
            }
            96%,
            100% {
              content: "il Box";
            }
          }

          @keyframes fadeInOut {
            0%,
            100% {
              opacity: 0;
              transform: translateY(10px);
            }
            10%,
            90% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animated-text {
            display: inline-block;
            min-width: 280px;
            text-align: left;
            animation: fadeInOut 3.5s ease-in-out infinite;
          }

          .animated-text::before {
            content: "la Casa";
            animation: flipText 24.5s ease-in-out infinite;
          }

          @media (max-width: 768px) {
            .animated-text {
              min-width: 200px;
            }
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#0033cc]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Esperienza
              </h3>
              <p className="text-gray-600">
                Oltre 35 anni di attività nel settore immobiliare
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#0033cc]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Professionalità
              </h3>
              <p className="text-gray-600">
                Team qualificato e sempre a tua disposizione
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#0033cc]"
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
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Territorio
              </h3>
              <p className="text-gray-600">
                Conoscenza approfondita della zona di Cerenova e Cerveteri
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Annunci in Evidenza
            </h2>
            <p className="text-lg text-gray-600">
              Scopri le nostre migliori proposte immobiliari
            </p>
          </div>

          {featuredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nessun annuncio disponibile al momento.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featuredListings.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/annunci"
                  className="inline-block px-8 py-4 bg-[#0033cc] text-white rounded-lg font-semibold hover:bg-[#0055ff] transition-colors shadow-lg"
                >
                  Vedi Tutti gli Annunci
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0033cc] to-[#0055ff] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hai una Proprietà da Vendere o Affittare?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Contattaci per una valutazione gratuita e senza impegno. Il nostro
            team è pronto ad aiutarti.
          </p>
          <a
            href="tel:3333496169"
            className="inline-block px-8 py-4 bg-white text-[#0033cc] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Contattaci Ora
          </a>
        </div>
      </section>
    </div>
  );
}
