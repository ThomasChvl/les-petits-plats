import { useRef } from "react";
import { CloseIcon, SearchIcon } from "./Icons";

export default function SearchBar({ query, onChange }) {
  const inputRef = useRef(null);

  function clearSearch() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="recipe-search" className="sr-only">
        Rechercher une recette
      </label>
      <input
        ref={inputRef}
        id="recipe-search"
        type="search"
        placeholder="Rechercher une recette, un ingrédient…"
        autoComplete="off"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") clearSearch();
        }}
        aria-describedby="search-hint"
      />
      <span id="search-hint" className="sr-only">
        La recherche dans les noms, ingrédients et descriptions commence à
        partir de 3 caractères. Les filtres s’appliquent aussi avant ce seuil.
      </span>
      {query && (
        <button
          type="button"
          className="icon-button search-clear"
          aria-label="Effacer la recherche principale"
          onClick={clearSearch}
        >
          <CloseIcon size={20} />
        </button>
      )}
      <button
        type="submit"
        className="icon-button search-submit"
        aria-label="Rechercher"
      >
        <SearchIcon size={28} />
      </button>
    </form>
  );
}
