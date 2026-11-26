import Image from "next/image";
import Header from "@/components/Header";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <>
      <Header overlay />
      <main id="contenu" className="not-found">
        <Image
          src="/images/hero-officiel.jpg"
          alt=""
          fill
          sizes="100vw"
          preload
          className="hero-photo"
        />
        <div>
          <p className="error-code" aria-hidden="true">404 :(</p>
          <h1>La page que vous demandez est introuvable.</h1>
        </div>
      </main>
    </>
  );
}
