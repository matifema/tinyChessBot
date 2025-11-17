export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0033cc] to-[#0055ff] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">GI</span>
              </div>
              <div>
                <div className="text-lg font-bold">Giorgio Immobiliare</div>
                <div className="text-xs text-gray-400">Dal 1985</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              La tua agenzia immobiliare di fiducia a Cerenova e Cerveteri.
              Professionalità e esperienza al tuo servizio.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contatti</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-[#0033cc] mt-0.5 flex-shrink-0"
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
                <div className="text-gray-300">
                  <div>Via Oriolo</div>
                  <div>Centro Commerciale I Portici</div>
                  <div>Cerenova - Cerveteri (Roma)</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-[#0033cc] flex-shrink-0"
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
                <a
                  href="tel:3333496169"
                  className="text-gray-300 hover:text-[#0033cc] transition-colors"
                >
                  333.3496169
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-[#0033cc] flex-shrink-0"
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
                <a
                  href="mailto:giorgiotravagliati@gmail.com"
                  className="text-gray-300 hover:text-[#0033cc] transition-colors"
                >
                  giorgiotravagliati@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Orari</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Lunedì - Mercoledì:</span>
                <span className="font-medium">9:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Giovedì:</span>
                <span className="font-medium text-[#fe0000]">Chiuso</span>
              </div>
              <div className="flex justify-between">
                <span>Venerdì - Sabato:</span>
                <span className="font-medium">9:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domenica:</span>
                <span className="font-medium text-[#fe0000]">Chiuso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Giorgio Immobiliare. Tutti i
            diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}
