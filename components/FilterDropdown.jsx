"use client";

import { useRef, useState } from "react";
import { normalizeText } from "@/lib/search.mjs";
import { ChevronIcon, CloseIcon, SearchIcon } from "./Icons";

export default function FilterDropdown({
  category,
  label,
  options,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}) {
  const [query, setQuery] = useState("");
  const toggleRef = useRef(null);
  const inputRef = useRef(null);
  const visibleOptions = options.filter((option) =>
    normalizeText(option).includes(normalizeText(query)),
  );

  function handleToggle() {
    setQuery("");
    onToggle();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      toggleRef.current?.focus();
    }
    if (event.key === "ArrowDown" && event.target === toggleRef.current) {
      event.preventDefault();
      if (!isOpen) handleToggle();
      // L'ouverture au clavier place le focus sur la recherche du filtre.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <div
      className="filter"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button
        ref={toggleRef}
        className="filter-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={`filter-${category}`}
        onClick={handleToggle}
      >
        {label}
        <ChevronIcon />
      </button>
      {isOpen && (
        <div id={`filter-${category}`} className="filter-panel">
          <div className="filter-search">
            <label className="sr-only" htmlFor={`search-${category}`}>
              Rechercher dans {label.toLocaleLowerCase("fr")}
            </label>
            <input
              ref={inputRef}
              id={`search-${category}`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="icon-button"
                aria-label={`Effacer la recherche ${label.toLocaleLowerCase("fr")}`}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <CloseIcon size={14} />
              </button>
            )}
            <SearchIcon size={17} />
          </div>
          {visibleOptions.length > 0 ? (
            <ul
              className="filter-options"
              aria-label={`Options ${label.toLocaleLowerCase("fr")}`}
            >
              {visibleOptions.map((option) => (
                <li key={normalizeText(option)}>
                  <button
                    type="button"
                    className="filter-option"
                    onClick={() => {
                      onSelect({ category, value: option });
                      setQuery("");
                      onClose();
                      toggleRef.current?.focus();
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="filter-empty" role="status">
              Aucune option disponible.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
