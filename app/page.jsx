import RecipeExplorer from "@/components/RecipeExplorer";
import recipes from "@/data/recipes.json";

export default function Home() {
  return <RecipeExplorer recipes={recipes} />;
}
