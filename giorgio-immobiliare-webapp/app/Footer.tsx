export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-8 px-8 mt-12">
      <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
        <p className="mb-2">
          &copy; 2025 Agenzia Immobiliare Giorgio Immobiliare - Cerenova -
          Cerveteri (Roma)
        </p>
        <p className="mb-1">
          Via Oriolo (Centro Commerciale I Portici) - Tel. 333.3496169
        </p>
        <p className="mb-1">Chiuso il Giovedì e Domenica</p>
        <p>
          Per Informazioni:{" "}
          <a
            href="mailto:giorgiotravagliati@gmail.com"
            className="text-blue-400 hover:underline"
          >
            giorgiotravagliati@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}
