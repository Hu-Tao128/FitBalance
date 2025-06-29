/* -----------------------------------------------------------
   FitBalance – Backend con ObjectId en PatientMeals
----------------------------------------------------------- */
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose, { Document, Schema, Types } from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------ Utilidad env obligatorias ------------
function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`❌ Falta ${name} en process.env`);
  return v;
}
const PORT = process.env.PORT || 3000;

// ------------ Variables de entorno ------------
const MONGODB_URI = getEnv('MONGODB_URI');
const FATSECRET_CONSUMER_KEY = getEnv('FATSECRET_CONSUMER_KEY');
const FATSECRET_CONSUMER_SECRET = getEnv('FATSECRET_CONSUMER_SECRET');
const NUTRITIONIX_APP_ID = getEnv('NUTRITIONIX_APP_ID');
const NUTRITIONIX_APP_KEY = getEnv('NUTRITIONIX_APP_KEY');

// ------------ Modelos ------------
interface IFood {
  name: string;
  portion_size_g: number;
  category: string;
  nutrients: Record<string, number>;
}
const Food = mongoose.model<IFood>(
  'Food',
  new mongoose.Schema({}, { strict: false, collection: 'Food' })
);

interface IPatientMealIngredient { food_id: Types.ObjectId; amount_g: number; }
interface IPatientMeal extends Document {
  patient_id: Types.ObjectId;
  name: string;
  ingredients: IPatientMealIngredient[];
  nutrients: Record<string, number>;
  instructions?: string;
  created_at: Date;
  updated_at: Date;
}

const PatientMealSchema = new Schema<IPatientMeal>({
  patient_id: { type: Schema.Types.ObjectId, required: true, ref: 'Patient' },
  name: { type: String, required: true },
  ingredients: [{
    food_id: { type: Schema.Types.ObjectId, required: true, ref: 'Food' },
    amount_g: { type: Number, required: true, min: 1 }
  }],
  nutrients: {
    energy_kcal: { type: Number, required: true, min: 0 },
    protein_g: { type: Number, required: true, min: 0 },
    carbohydrates_g: { type: Number, required: true, min: 0 },
    fat_g: { type: Number, required: true, min: 0 },
    fiber_g: { type: Number, required: true, min: 0 },
    sugar_g: { type: Number, required: true, min: 0 },
  },
  instructions: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'PatientMeals', timestamps: true });

const PatientMeal = mongoose.model<IPatientMeal>('PatientMeal', PatientMealSchema);

// ------------ Ruta alimentos (sin cambios) ------------
app.get('/api/food', async (_req, res) => {
  try { res.json(await Food.find()); }
  catch (err) {
    console.error('❌ GET /api/food', err);
    res.status(500).json({ error: 'Error al obtener alimentos' });
  }
});

/* ======================================================
 * POST /PatientMeals   (ObjectId cast + validación)
 * ==================================================== */
app.post('/PatientMeals', async (req: Request, res: Response) => {
  try {
    const { patient_id, name, ingredients, nutrients, instructions = '' } = req.body;
    if (!patient_id || !name || !Array.isArray(ingredients) || !nutrients)
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });

    if (!Types.ObjectId.isValid(patient_id))
      return res.status(400).json({ error: 'patient_id inválido' });
    const pid = new Types.ObjectId(patient_id);

    const castIngredients = ingredients.map((ing: any) => {
      if (!ing.food_id || typeof ing.amount_g !== 'number' || ing.amount_g <= 0)
        throw new Error('Cada ingrediente necesita food_id y amount_g>0');
      if (!Types.ObjectId.isValid(ing.food_id))
        throw new Error(`food_id inválido: ${ing.food_id}`);
      return { food_id: new Types.ObjectId(ing.food_id), amount_g: ing.amount_g };
    });

    const requiredN = ['energy_kcal', 'protein_g', 'carbohydrates_g', 'fat_g', 'fiber_g', 'sugar_g'];
    for (const k of requiredN)
      if (typeof nutrients[k] !== 'number' || nutrients[k] < 0)
        return res.status(400).json({ error: `Nutriente ${k} debe ser numérico ≥0` });

    const meal = await PatientMeal.create({
      patient_id: pid,
      name: name.trim(),
      ingredients: castIngredients,
      nutrients,
      instructions: instructions.trim(),
    });
    res.status(201).json({ message: 'Comida creada', meal });
  } catch (err: any) {
    console.error('❌ POST /PatientMeals', err);
    res.status(500).json({ error: err.message || 'Error interno' });
  }
});

/* ==== GET /PatientMeals/:patient_id ==== */
app.get('/PatientMeals/:patient_id', async (req, res) => {
  const { patient_id } = req.params;
  if (!Types.ObjectId.isValid(patient_id))
    return res.status(400).json({ error: 'patient_id inválido' });
  const meals = await PatientMeal.find({ patient_id }).sort({ created_at: -1 }).lean();
  res.json(meals);
});

/* ==== Otros handlers (GET por id, PUT, DELETE)… usa mongoose.isValidObjectId y cast si editas) ==== */

// ------------ Mongo y server ------------
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => { console.error('❌ MongoDB', err); process.exit(1); });

console.log('Voy a levantar Express…');
app.listen(PORT, () => console.log(`🚀 API corriendo en puerto ${PORT}`))
  .on('error', err => console.error('❌ Error al escuchar:', err));
