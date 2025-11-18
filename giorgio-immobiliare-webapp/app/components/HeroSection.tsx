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
    <section className="relative bg-[#0033cc] text-white overflow-hidden min-h-[600px]">
      {/* Image Container - Absolute positioning to fill left half on desktop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-full md:w-1/2">
          {/* The Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 md:opacity-100"
            style={{
              backgroundImage: "url('/images/heroimage.png')",
            }}
          ></div>

          {/* The Gradient Overlay - Fades from transparent to the section bg color */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, transparent 50%, rgba(0, 51, 204, 0.6) 80%, #0033cc 100%)",
            }}
          ></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="flex justify-center md:justify-end">
          <div className="max-w-2xl text-center md:text-left md:pr-8 lg:pr-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Trova{" "}
              <span className="inline-block relative min-h-[1.2em]">
                <span
                  className={`inline-block transition-all duration-500 ${isAnimating
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
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Oltre 35 anni di esperienza nel settore immobiliare a Cerenova e
              Cerveteri
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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
      </div>
    </section>
  );
}