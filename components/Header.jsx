import Link from "next/link";
import Image from "next/image";

export default function Header({ overlay = false }) {
  return (
    <header className={`site-header${overlay ? " site-header-overlay" : ""}`}>
      <Link href="/" className="brand" aria-label="Les Petits Plats — Accueil">
        <Image src="/logo.svg" alt="" width={207} height={26} preload />
      </Link>
    </header>
  );
}
