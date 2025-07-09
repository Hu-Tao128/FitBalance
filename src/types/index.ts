

type Nutrients = {
    energy_kcal: number;
    protein_g: number;
    carbohydrates_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
};

type FoodDataForPatientMeal = {
    _id: string;
    name: string;
    portion_size_g: number;
    nutrients: Nutrients;
};

type IngredientInPatientMeal = {
    food_id: FoodDataForPatientMeal;
    amount_g: number;
};

export interface PatientMeal {
    _id: string;
    patient_id: string;
    name: string;
    ingredients: IngredientInPatientMeal[];
    nutrients: Nutrients;
    instructions?: string;
    created_at: string;
    updated_at: string;
}