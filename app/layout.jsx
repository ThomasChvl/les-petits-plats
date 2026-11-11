import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";

const anton = localFont({
  src: "../public/fonts/Anton-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
  weight: "400",
});

const manrope = localFont({
  src: "../public/fonts/Manrope.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "200 800",
});

export const metadata = {
  title: {
    default: "Les Petits Plats — Trouvez votre prochaine recette",
    template: "%s | Les Petits Plats",
  },
  description:
    "Découvrez 50 recettes et trouvez votre prochain petit plat grâce à la recherche par ingrédients, appareils et ustensiles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${anton.variable} ${manrope.variable}`}>
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        {children}
        <Footer />
      </body>
    </html>
  );
}
