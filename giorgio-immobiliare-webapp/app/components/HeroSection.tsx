"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const propertyTypes = [
  "la Casa",
  "la Villa",
  "l'Appartamento",
  "il Casale",
  "il Negozio",
  "il Terreno",
  "il Box",
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % propertyTypes.length);
        setIsAnimating(false);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#0033cc] text-white overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
      {/* Image Container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Mobile: Full background image */}
        <div className="absolute inset-0 md:hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/heroimage.png')",
            }}
          ></div>
          {/* Stronger gradient for mobile readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0, 51, 204, 0.85) 0%, rgba(0, 51, 204, 0.7) 50%, #0033cc 100%)",
            }}
          ></div>
        </div>

        {/* Desktop: Split background */}
        <div className="hidden md:block absolute left-0 top-0 h-full w-1/2">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/heroimage.png')",
            }}
          ></div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, transparent 40%, rgba(0, 51, 204, 0.6) 80%, #0033cc 100%)",
            }}
          ></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-32">
        <div className="flex justify-center md:justify-end">
          <div className="max-w-2xl text-center md:text-left md:pr-8 lg:pr-16">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Trova{" "}
              <br className="hidden md:block" />
              <span className="inline-block relative min-h-[1.2em]">
                <span
                  className={`inline-block transition-all duration-500 ${
                    isAnimating
                      ? "opacity-0 translate-y-4"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  {propertyTypes[currentIndex]}
                </span>
              </span>
              <br />
              dei Tuoi Sogni
            </h1>
            <p className="text-lg md:text-2xl mb-8 text-blue-100 max-w-lg mx-auto md:mx-0">
              Oltre 35 anni di esperienza nel settore immobiliare a Cerenova e
              Cerveteri
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/annunci"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0033cc] rounded-xl font-bold hover:bg-gray-50 transition-colors text-center shadow-lg active:scale-95 transform duration-150"
              >
                Vedi Annunci
              </Link>
              <a
                href="tel:3333496169"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#fe0000] text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-center shadow-lg active:scale-95 transform duration-150"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Chiamaci Ora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
