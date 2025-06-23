import axios from "axios";
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import  mongoose, {Types} from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 Utilidad para leer variables de entorno obligatorias
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`❌ La variable ${name} no está definida en process.env`);
  return value;
}

const PORT = process.env.PORT || 3000;

// 🌱 Variables de entorno necesarias
const MONGODB_URI = getEnv('MONGODB_URI');
const FATSECRET_CONSUMER_KEY = getEnv('FATSECRET_CONSUMER_KEY');
const FATSECRET_CONSUMER_SECRET = getEnv('FATSECRET_CONSUMER_SECRET');
const NUTRITIONIX_APP_ID = getEnv('NUTRITIONIX_APP_ID');
const NUTRITIONIX_APP_KEY = getEnv('NUTRITIONIX_APP_KEY');

// 📦 Modelos de Mongoose
interface IPatient {
  _id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  objective?: string;
  allergies?: string[];
  dietary_restrictions?: string[];
  registration_date?: Date;
  notes?: string;
  last_consultation?: Date | null;
  nutritionist_id?: string;
  isActive?: boolean;
}

const Patient = mongoose.model<IPatient>(
  'Patient',
  new mongoose.Schema({
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height_cm: { type: Number },
    weight_kg: { type: Number },
    objective: { type: String },
    allergies: { type: [String], default: [] },
    dietary_restrictions: { type: [String], default: [] },
    registration_date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    last_consultation: { type: Date, default: null },
    nutritionist_id: { type: String },
    isActive: { type: Boolean, default: true }
  }, { collection: 'Patients' })
);

interface IFood {
  name: string;
  portion_size_g: number;
  nutrients: {
    energy_kj: number;
    energy_kcal: number;
    fat_g: number;
    saturated_fat_g: number;
    monounsaturated_fat_g: number;
    polyunsaturated_fat_g: number;
    carbohydrates_g: number;
    sugar_g: number;
    fiber_g: number;
    protein_g: number;
    salt_g: number;
    cholesterol_mg: number;
    potassium_mg: number;
  };
  percent_RI: any;
}

const Food = mongoose.model<IFood>(
  'Food',
  new mongoose.Schema({}, { strict: false, collection: 'Food' })
);


interface WeeklyPlanFood {
  food_id: string;
  grams: number;
}

interface WeeklyMeal {
  day: string; // Ej: "monday"
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: WeeklyPlanFood[];
}

interface IWeeklyPlan {
  patient_id: string;
  week_start: Date;
  dailyCalories: number;
  protein: number;
  fat: number;
  carbs: number;
  meals: WeeklyMeal[];
}

const WeeklyPlan = mongoose.model<IWeeklyPlan>(
  'WeeklyPlan',
  new mongoose.Schema({
    patient_id: { type: String, required: true },
    week_start: { type: Date, required: true },
    dailyCalories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    meals: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
      },
      time: { type: String, required: true },
      foods: [{
        food_id: { type: String, required: true },
        grams: { type: Number, required: true, min: 1 }
      }]
    }]
  }, { collection: 'WeeklyPlan' })
);

// 🔌 Conexión a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// 🧠 Token de FatSecret (con cache)
let fatSecretAccessToken: string | null = null;
let fatSecretTokenExpiry = 0;

async function getFatSecretToken(): Promise<string> {
  const clientId = FATSECRET_CONSUMER_KEY;
  const clientSecret = FATSECRET_CONSUMER_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    'https://oauth.fatsecret.com/connect/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'basic'
    }),
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const token = response.data.access_token;

  if (!token) throw new Error('❌ No se pudo obtener el token de FatSecret');

  return token;
}

// 🔎 Función para buscar en FatSecret
async function searchFatSecretByText(query: string) {
  const accessToken = await getFatSecretToken();

  const response = await axios.post(
    'https://platform.fatsecret.com/rest/server.api',
    new URLSearchParams({
      method: 'foods.search',
      search_expression: query,
      format: 'json',
      max_results: '10'
    }),
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data;
}

// 🧠 Ruta combinada de búsqueda nutricional
app.post('/search-food', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Falta el parámetro "query"' });
  }

  try {
    const nutritionixResponse = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      { query },
      {
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const items = nutritionixResponse.data.foods;
    if (items && items.length > 0) {
      return res.json({
        source: 'nutritionix',
        results: items
      });
    }

    const fatSecretData = await searchFatSecretByText(query);
    const foods = fatSecretData?.foods?.food;

    if (foods && foods.length > 0) {
      return res.json({
        source: 'fatsecret',
        results: foods
      });
    }

    return res.status(404).json({ message: 'No se encontraron alimentos con ese nombre.' });

  } catch (error: any) {
    console.error('❌ Error en /search-food:', error.message);
    return res.status(500).json({ error: 'Error en la búsqueda de alimentos' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing fields: username and/or password' });
  }

  try {
    const patient = await Patient.findOne({ username, password }).select('-password');

    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      id: patient._id,
      username: patient.username,
      name: patient.name,
      email: patient.email
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const patient = await Patient.findOne({ username }).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// 🍽 Ruta para obtener alimentos guardados
app.get('/api/food', async (_req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alimentos' });
  }
});

app.get('/dailyplan', async (req: Request, res: Response) => {
  const { patient_id } = req.query;

  if (!patient_id || typeof patient_id !== 'string') {
    return res.status(400).json({ error: 'Falta el parámetro patient_id' });
  }

  try {
    // 1. Validar y convertir el ID correctamente
    if (!mongoose.Types.ObjectId.isValid(patient_id)) {
      return res.status(400).json({ error: 'ID de paciente no válido' });
    }
    const patientObjectId = new mongoose.Types.ObjectId(patient_id);

    // 2. Obtener fecha actual
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // 3. Día de la semana
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[today.getUTCDay()];

    // 4. Consulta CORRECTA usando el ObjectId convertido
    const weeklyPlan = await WeeklyPlan.findOne({
      "patient_id": patientObjectId  // Usamos el ObjectId convertido
    }).sort({ week_start: -1 }).lean();

    console.log('Resultado de búsqueda:', weeklyPlan); // Debug

    if (!weeklyPlan) {
      return res.status(404).json({ 
        message: 'No se encontró ningún plan nutricional.',
        debug: {
          patientIdUsed: patientObjectId,
          today: today.toISOString()
        }
      });
    }

    // 5. Filtrar comidas del día actual
    const dailyMeals = weeklyPlan.meals.filter(meal => meal.day === dayOfWeek);

    // 6. Respuesta
    return res.json({
      date: today.toISOString().split('T')[0],
      day: dayOfWeek,
      nutritionalValues: {
        calories: weeklyPlan.dailyCalories,
        protein: weeklyPlan.protein,
        fat: weeklyPlan.fat,
        carbs: weeklyPlan.carbs
      },
      meals: dailyMeals
    });

  } catch (err) {
    console.error('Error en /dailyplan:', err);
    return res.status(500).json({ 
      error: 'Error al obtener el plan diario'
    });
  }
});

// 🚀 Arranque del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
