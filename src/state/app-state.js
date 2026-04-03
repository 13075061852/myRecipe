import { seedMaterials } from "../data/materials.js";
import { seedRecipes } from "../data/recipes.js";
import { cloneData } from "../utils/helpers.js";

export function createEmptyDraft() {
    return {
        id: null,
        name: "",
        application: "",
        family: "PBT",
        process: "注塑",
        target: "",
        items: []
    };
}

export const state = {
    materials: cloneData(seedMaterials),
    recipes: cloneData(seedRecipes),
    selectedMaterialId: seedMaterials[0]?.id ?? null,
    sidebarCollapsed: false,
    inventoryFilters: {
        keyword: "",
        family: "all",
        category: "all",
        status: "all"
    },
    libraryKeyword: "",
    formulaDraft: createEmptyDraft()
};
