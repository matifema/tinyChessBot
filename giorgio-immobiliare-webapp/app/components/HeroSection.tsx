"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0033cc] to-[#0055ff] text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-left"
          style={{
            backgroundImage: "url('/images/heroimage.png')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0033cc]/0 to-[#0055ff]/70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Trova{" "}
            <span className="inline-block relative">
              <span className="animated-text"></span>
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
  );
}
