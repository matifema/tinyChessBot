import "./globals.css";
import AuthProvider from "./AuthProvider";
import Footer from "./Footer";
import Header from "./Header";

export const metadata = {
  title: "Giorgio Immobiliare - Agenzia Immobiliare Cerenova",
  description:
    "Agenzia Immobiliare Giorgio Immobiliare - Cerenova - Cerveteri (Roma). Vendita e affitto di appartamenti, ville, casali e terreni.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="h-full">
      <body className="h-full overflow-hidden bg-gray-50">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
