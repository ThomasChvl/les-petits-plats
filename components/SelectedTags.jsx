import { normalizeText } from "@/lib/search.mjs";
import { CloseIcon } from "./Icons";

export default function SelectedTags({ tags, label, onRemove }) {
  if (tags.length === 0) return null;

  return (
    <ul className="selected-tags" aria-label={`Filtres sélectionnés : ${label}`}>
      {tags.map((tag) => (
        <li
          className="selected-tag"
          key={`${tag.category}-${normalizeText(tag.value)}`}
        >
          <span>{tag.value}</span>
          <button
            type="button"
            className="icon-button"
            aria-label={`Supprimer le filtre ${label} : ${tag.value}`}
            onClick={(event) => {
              const item = event.currentTarget.closest("li");
              const nextFocus =
                item.nextElementSibling?.querySelector("button") ??
                item.previousElementSibling?.querySelector("button") ??
                item.closest(".filter-group")?.querySelector(".filter-toggle");
              onRemove(tag);
              nextFocus?.focus();
            }}
          >
            <CloseIcon />
          </button>
        </li>
      ))}
    </ul>
  );
}
