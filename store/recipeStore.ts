import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Recipe } from "@/types/recipe";

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  getRecipe: (id: string) => Recipe | undefined;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      addRecipe: (recipe) => {
        set((state) => ({
          recipes: [recipe, ...state.recipes],
        }));
      },
      updateRecipe: (recipe) => {
        set((state) => ({
          recipes: state.recipes.map((r) => (r.id === recipe.id ? recipe : r)),
        }));
      },
      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        }));
      },
      getRecipe: (id) => {
        return get().recipes.find((r) => r.id === id);
      },
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);