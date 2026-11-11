import Image from "next/image";
import Link from "next/link";
import IngredientList from "./IngredientList";

export default function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <Link
        href={`/recette/${recipe.slug}`}
        className="recipe-card-link"
        aria-label={`Voir la recette : ${recipe.name}`}
      >
        <div className="recipe-card-photo">
          <Image
            src={`/images/${recipe.image}`}
            alt={recipe.name}
            fill
            sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, 30vw"
          />
          <span className="time-badge">{recipe.time} min</span>
        </div>
        <div className="recipe-card-body">
          <h3>{recipe.name}</h3>
          <h4 className="section-label">Recette</h4>
          <p className="recipe-excerpt">{recipe.description}</p>
          <h4 className="section-label">Ingrédients</h4>
          <IngredientList ingredients={recipe.ingredients} />
        </div>
      </Link>
    </article>
  );
}
