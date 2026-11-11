import Link from "next/link";
import Header from "@/components/Header";

export const metadata = { title: "Recette introuvable" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenu" className="not-found">
        <span className="error-code" aria-hidden="true">
          404
        </span>
        <h1>Cette page reste introuvable</h1>
        <p>
          La recette ou la page que tu cherches n’existe pas.
          <br />
          Retrouve nos petits plats depuis l’accueil.
        </p>
        <Link href="/" className="home-button">
          Retour à l’accueil
        </Link>
      </main>
    </>
  );
}
