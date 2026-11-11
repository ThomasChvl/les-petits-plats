import Image from "next/image";
import Header from "./Header";

export default function Hero({ children }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Image
        src="/images/hero-officiel.jpg"
        alt=""
        fill
        sizes="100vw"
        preload
        className="hero-photo"
      />
      <Header overlay />
      <div className="hero-content">
        <h1 id="hero-title">
          <span>Découvrez nos recettes</span>{" "}
          <span>du quotidien,simples et délicieuses</span>
        </h1>
        {children}
      </div>
    </section>
  );
}
