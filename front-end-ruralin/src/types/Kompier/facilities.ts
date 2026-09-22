export interface KompierFacility{
  id?: number;

  recipes: KompierRecipe[];
  equipments: KompierEquipment[];

  createdAt?: string;
  updatedAt?: string;
}

export interface KompierRecipe {
  id?: number;

  recipeId: number;
  recipeName: string;

  dmPerHeadGrams: number;
  afPerHeadGrams: number;

  ingredients: KompierRecipeIngredients[];

  createdAt?: string;
  updatedAt?: string;
}

export interface KompierRecipeIngredients {
  ingredientId: string;
  ingredientName: string;

  afPerHeadGrams: number;
  dmPerHeadGrams: number;
  costPerGram: number;
  dmPercent: number;

  isMicroRation : boolean;

  postDelay:number;

  sequence : number;
  tolerance: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface KompierEquipment {
  equipId: string;
  equipName: string;

  macSuffix: string;
  meshMacAddress: string;

  equipmentTypeKey: string;

  createdAt?: string;
  updatedAt?: string;
}
