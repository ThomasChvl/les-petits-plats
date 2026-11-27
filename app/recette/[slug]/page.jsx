import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import IngredientList from "@/components/IngredientList";
import MaterialList from "@/components/MaterialList";
import recipes from "@/data/recipes.json";
import { recipePresentation } from "@/data/recipe-presentation";

// Seuls les 50 slugs fournis existent : toute autre adresse renvoie directement la 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return recipes.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const recipe = recipes.find((recipe) => recipe.slug === slug);

  return recipe
    ? { title: recipe.name, description: recipe.description }
    : { title: "Recette introuvable" };
}

export default async function RecipePage({ params }) {
  // Dans cette version de Next.js, params est une promesse.
  const { slug } = await params;
  const recipe = recipes.find((recipe) => recipe.slug === slug);

  if (!recipe) notFound();
  const presentation = recipePresentation[recipe.slug];

  return (
    <>
      <div className="detail-banner">
        <Image
          src="/images/hero-officiel.jpg"
          alt=""
          fill
          sizes="100vw"
          preload
          className="detail-banner-photo"
        />
        <Header overlay />
      </div>
      <main id="contenu" className="recipe-page">
        <article className="recipe-detail">
          <div className="detail-photo">
            <Image
              src={`/images/${recipe.image}`}
              alt={recipe.name}
              fill
              sizes="(max-width: 1100px) 100vw, 50vw"
              preload
            />
          </div>
          <div className="detail-body">
            <h1>{recipe.name}</h1>
            <section aria-labelledby="time-title">
              <h2 id="time-title" className="section-label">Temps de préparation</h2>
              <span className="time-badge">{recipe.time} min</span>
            </section>
            <section aria-labelledby="ingredients-title">
              <h2 id="ingredients-title" className="section-label">
                Ingrédients
              </h2>
              <IngredientList ingredients={recipe.ingredients} />
            </section>
            <section aria-labelledby="utensils-title">
              <h2 id="utensils-title" className="section-label">
                Ustensiles nécessaires
              </h2>
              <MaterialList
                items={presentation?.utensils ?? recipe.ustensils.map((name) => ({ name }))}
              />
            </section>
            <section aria-labelledby="appliances-title">
              <h2 id="appliances-title" className="section-label">
                Appareils nécessaires
              </h2>
              <MaterialList
                items={presentation?.appliances ?? [{ name: recipe.appliance }]}
              />
            </section>
            <section
              aria-labelledby="preparation-title"
              className={presentation?.steps ? "detail-preparation" : undefined}
            >
              <h2 id="preparation-title" className="section-label">
                Recette
              </h2>
              {presentation?.steps ? (
                <ol className="preparation-steps">
                  {presentation.steps.map(({ title, actions }) => (
                    <li key={title}>
                      <span>{title} :</span>
                      <ul>
                        {actions.map((action) => <li key={action}>{action}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="preparation">{recipe.description}</p>
              )}
            </section>
          </div>
        </article>
      </main>
    </>
  );
}
