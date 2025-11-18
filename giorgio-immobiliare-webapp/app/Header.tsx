"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const propertyTypes = [
    { value: "appartamento", label: "Appartamenti" },
    { value: "villa", label: "Ville" },
    { value: "casale", label: "Casali" },
    { value: "negozio", label: "Negozi" },
    { value: "terreno", label: "Terreni" },
    { value: "box", label: "Box" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Contact Info */}
        <div
          className={`hidden lg:flex items-center justify-end text-sm border-b border-gray-200 overflow-hidden transition-all duration-300 ${
            isScrolled ? "max-h-0 py-0 opacity-0" : "max-h-20 py-2 opacity-100"
          }`}
        >
          <div className="flex items-center space-x-6 text-gray-600">
            <a
              href="tel:3333496169"
              className="flex items-center space-x-2 hover:text-[#0033cc] transition-colors"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>333.3496169</span>
            </a>
            <a
              href="mailto:giorgiotravagliati@gmail.com"
              className="flex items-center space-x-2 hover:text-[#0033cc] transition-colors"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>giorgiotravagliati@gmail.com</span>
            </a>
            <div className="flex items-center space-x-2">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Lun-Mer, Ven-Sab: 9:00-19:00</span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/logo.png"
              alt="Giorgio Immobiliare Logo"
              width={300}
              height={40}
              className="cursor-pointer h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/annunci"
              className="text-gray-700 hover:text-[#0033cc] font-medium transition-colors"
            >
              Tutti gli Annunci
            </Link>

            {/* Property Types Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
                onBlur={() =>
                  setTimeout(() => setPropertyDropdownOpen(false), 200)
                }
                className="flex items-center space-x-1 text-gray-700 hover:text-[#0033cc] font-medium transition-colors"
              >
                <span>Tipologie</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    propertyDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {propertyDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  {propertyTypes.map((type) => (
                    <Link
                      key={type.value}
                      href={`/annunci?type=${type.value}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#0033cc] transition-colors"
                      onClick={() => setPropertyDropdownOpen(false)}
                    >
                      {type.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href="tel:3333496169"
              className="flex items-center space-x-2 px-4 py-2 bg-[#0033cc] text-white rounded-lg hover:bg-[#0055ff] transition-colors font-medium"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>Contattaci</span>
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/annunci"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tutti gli Annunci
            </Link>

            {/* Mobile Property Types */}
            <div className="px-4 py-2">
              <div className="text-sm font-semibold text-gray-500 mb-2">
                Tipologie
              </div>
              <div className="space-y-1 pl-2">
                {propertyTypes.map((type) => (
                  <Link
                    key={type.value}
                    href={`/annunci?type=${type.value}`}
                    className="block px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {type.label}
                  </Link>
                ))}
              </div>
            </div>

            <a
              href="tel:3333496169"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              📞 333.3496169
            </a>
            <a
              href="mailto:giorgiotravagliati@gmail.com"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✉️ giorgiotravagliati@gmail.com
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
