export function parseRecipeFromText(text: string) {
  // Basic recipe structure
  const recipe = {
    title: "",
    ingredients: [] as string[],
    instructions: [] as string[],
    prepTime: "",
    cookTime: "",
    servings: 0,
  };

  // Try to extract title (usually at the beginning)
  const titleMatch = text.match(/^([^.!?]+)[.!?]/);
  if (titleMatch) {
    recipe.title = titleMatch[1].trim();
  } else {
    // Fallback: use first line or first few words
    const firstLine = text.split("\n")[0];
    recipe.title = firstLine.length > 50 
      ? firstLine.substring(0, 50) + "..." 
      : firstLine;
  }

  // Look for ingredients section
  let ingredientsSection = "";
  const ingredientsMatch = text.match(
    /ingredients:?(.+?)(?:instructions|directions|method|steps|preparation)/is
  );
  
  if (ingredientsMatch) {
    ingredientsSection = ingredientsMatch[1];
  } else {
    // Try to find a list pattern that might be ingredients
    const listMatch = text.match(/(?:need|you'll need|you will need):?(.+?)(?:steps|instructions|directions|method|to prepare|preparation)/is);
    if (listMatch) {
      ingredientsSection = listMatch[1];
    }
  }

  // Parse ingredients
  if (ingredientsSection) {
    // Split by common list indicators
    const ingredientsList = ingredientsSection
      .split(/(?:\r?\n|,|•|\*|\d+\s*\.|\d+\s*\))/g)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 100); // Filter out empty items and very long text

    recipe.ingredients = ingredientsList;
  }

  // Look for instructions section
  let instructionsSection = "";
  const instructionsMatch = text.match(
    /(?:instructions|directions|method|steps|preparation):?(.+)$/is
  );
  
  if (instructionsMatch) {
    instructionsSection = instructionsMatch[1];
  } else {
    // If we found ingredients but no explicit instructions, assume the rest is instructions
    if (ingredientsSection && text.indexOf(ingredientsSection) > -1) {
      const afterIngredients = text.substring(
        text.indexOf(ingredientsSection) + ingredientsSection.length
      );
      instructionsSection = afterIngredients;
    }
  }

  // Parse instructions
  if (instructionsSection) {
    // Split by common step indicators
    const instructionsList = instructionsSection
      .split(/(?:\r?\n|step\s*\d+|^\d+\s*\.|\d+\s*\))/gi)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 500); // Filter out empty items

    recipe.instructions = instructionsList;
  }

  // Try to extract prep time
  const prepTimeMatch = text.match(/prep(?:aration)?\s*time:?\s*(\d+\s*(?:min|minute|hour|hr)[^\n.]*)/i);
  if (prepTimeMatch) {
    recipe.prepTime = prepTimeMatch[1].trim();
  }

  // Try to extract cook time
  const cookTimeMatch = text.match(/cook(?:ing)?\s*time:?\s*(\d+\s*(?:min|minute|hour|hr)[^\n.]*)/i);
  if (cookTimeMatch) {
    recipe.cookTime = cookTimeMatch[1].trim();
  }

  // Try to extract servings
  const servingsMatch = text.match(/(?:serves|servings|yield):?\s*(\d+)/i);
  if (servingsMatch) {
    recipe.servings = parseInt(servingsMatch[1]);
  }

  return recipe;
}