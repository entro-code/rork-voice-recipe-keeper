export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  category?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  createdAt: number;
}