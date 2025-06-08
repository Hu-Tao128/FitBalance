import axios from "axios";
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import OAuth from 'oauth-1.0a';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI as string;

// Configuración de FatSecret
const FATSECRET_CONSUMER_KEY = process.env.FATSECRET_CONSUMER_KEY as string;
const FATSECRET_CONSUMER_SECRET = process.env.FATSECRET_CONSUMER_SECRET as string;

if (!MONGODB_URI) {
  throw new Error('No se encontró MONGODB_URI en el archivo .env');
}

if (!FATSECRET_CONSUMER_KEY || !FATSECRET_CONSUMER_SECRET) {
  console.warn('FatSecret API keys no encontradas');
}

const fatSecretOAuth = new OAuth({
  consumer: {
    key: FATSECRET_CONSUMER_KEY,
    secret: FATSECRET_CONSUMER_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString: string, key: string) => {
    return crypto
      .createHmac('sha1', key)
      .update(baseString)
      .digest('base64');
  }
});

// Esquema y modelo para pacientes
interface IPatient {
  nombre: string;
  correo: string;
  email: string;
  usuario: string;
  password: string;
  edad?: number;
  sexo?: string;
  altura_cm?: number;
  peso_kg?: number;
  objetivo?: string;
  ultima_consulta?: string;
}

const Patient = mongoose.model<IPatient>(
  'Patient',
  new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    edad: { type: Number },
    sexo: { type: String },
    altura_cm: { type: Number },
    peso_kg: { type: Number },
    objetivo: { type: String },
    ultima_consulta: { type: String }
  }, { collection: 'Patients' })
);

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Funciones para FatSecret
async function searchFatSecretByUPC(upc: string, region: string = 'mx') {
  const url = 'https://platform.fatsecret.com/rest/server.api';
  const method = 'POST';
  const data = {
    method: 'food.find_id_for_upc',
    upc,
    region,
    format: 'json'
  };

  const requestData = { url, method, data };
  const headers = {
    ...fatSecretOAuth.toHeader(fatSecretOAuth.authorize(requestData)),
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  try {
    const response = await axios.post(url, new URLSearchParams(data), { headers });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error en FatSecret (UPC):', error.response?.data || error.message);
    throw error;
  }
}

async function getFatSecretFoodDetails(foodId: string) {
  const url = 'https://platform.fatsecret.com/rest/server.api';
  const method = 'POST';
  const data = {
    method: 'food.get',
    food_id: foodId,
    format: 'json'
  };

  const requestData = { url, method, data };
  const headers = {
    ...fatSecretOAuth.toHeader(fatSecretOAuth.authorize(requestData)),
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const response = await axios.post(url, new URLSearchParams(data), { headers });
  return response.data;
}

async function searchFatSecretByText(query: string) {
  const url = 'https://platform.fatsecret.com/rest/server.api';
  const method = 'POST';
  const data = {
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: '10'
  };

  const requestData = { url, method, data };
  const headers = {
    ...fatSecretOAuth.toHeader(fatSecretOAuth.authorize(requestData)),
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const response = await axios.post(url, new URLSearchParams(data), { headers });
  return response.data;
}

// Rutas
app.get('/usuarios', async (req: Request, res: Response) => {
  try {
    const usuarios = await Patient.find();
    res.json(usuarios);
  } catch (err) {
    console.error('❌ Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/usuarios', async (req: Request, res: Response) => {
  try {
    const nuevoUsuario = new Patient(req.body);
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error('❌ Error al guardar usuario:', err);
    res.status(500).json({ error: 'Error al guardar usuario' });
  }
});

app.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { usuario, password } = req.body;

  console.log('📥 Datos recibidos en /login:', { usuario, password });

  if (!usuario || !password) {
    res.status(400).json({ mensaje: 'Faltan campos: usuario y/o contraseña' });
    return;
  }

  try {
    const paciente = await Patient.findOne({ usuario, password }).select('-password');

    if (!paciente) {
      console.log('❌ No se encontró paciente con esas credenciales');
      res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      return;
    }

    console.log('✅ Login exitoso para:', paciente.usuario);
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      id: paciente._id,
      usuario: paciente.usuario,
      nombre: paciente.nombre,
      correo: paciente.correo || paciente.email
    });
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


//-----------------------FOOD------------------------

// ✅ Agrega este modelo en tu backend (en el mismo archivo o modularizado)
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

app.get('/api/food', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    console.error('❌ Error al obtener alimentos:', err);
    res.status(500).json({ error: 'Error al obtener alimentos' });
  }
});

