export default function IngredientList({ ingredients }) {
  // Le JSON officiel utilise aussi « unite » pour la moutarde de la tarte au thon.
  return (
    <dl className="ingredient-list">
      {ingredients.map(({ ingredient, quantity, unit, unite }) => (
        <div key={ingredient}>
          <dt>{ingredient}</dt>
          <dd>
            {[quantity, unit ?? unite]
              .filter((value) => value !== undefined)
              .join(" ") || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
