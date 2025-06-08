import axios from "axios";
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
<<<<<<< Updated upstream
import axios from "axios";
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
=======
>>>>>>> Stashed changes

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
        key: process.env.FATSECRET_CONSUMER_KEY!,
        secret: process.env.FATSECRET_CONSUMER_SECRET!
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
    new mongoose.Schema(
        {
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
        },
        { collection: 'Patients' }
    )
);

// Conexión a MongoDB
mongoose
  .connect(MONGODB_URI)
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
        const response = await axios.post(
            url,
            new URLSearchParams(data),
            { headers }
        );
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

    const response = await axios.post(
        url,
        new URLSearchParams(data),
        { headers }
    );

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

    const response = await axios.post(
        url,
        new URLSearchParams(data),
        { headers }
    );

    return response.data;
}

// Rutas de usuarios
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
    const paciente = await Patient.findOne({
      usuario: usuario,
      password: password
    }).select('-password'); // Excluye la contraseña de la respuesta

    if (!paciente) {
      console.log('❌ No se encontró paciente con esas credenciales');
      res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      return;
    }

<<<<<<< Updated upstream
    try {
        const paciente = await Patient.findOne({
            usuario: usuario,
            password: password
        }).select('-password');

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

app.get('/user/:usuario', async (req, res) => {
    try {
        const paciente = await Patient.findOne({ usuario: req.params.usuario });
        if (!paciente) {
            console.log('Usuario no encontrado');
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(paciente);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
=======
    console.log('✅ Login exitoso para:', paciente.usuario);

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      id: paciente._id,
      usuario: paciente.usuario,
      nombre: paciente.nombre,
      correo: paciente.correo || paciente.email // Maneja ambos casos
    });
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/user/:usuario', async (req, res) => { // Cambiado a :usuario
  try {
    const paciente = await Patient.findOne({ usuario: req.params.usuario }); // Usa Patient
    if (!paciente) {
      console.log('Usuario no encontrado')
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(paciente);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

app.get('/api/recipes/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        query,
        number: 10,
        addRecipeNutrition: true,
        apiKey: process.env.SPOONACULAR_APIKEY
      }
    }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
>>>>>>> Stashed changes
});

// Rutas de recetas (Spoonacular)
app.get('/api/recipes/search', async (req: Request, res: Response) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const response = await axios.get(
            `https://api.spoonacular.com/recipes/complexSearch`, {
                params: {
                    query,
                    number: 10,
                    addRecipeNutrition: true,
                    apiKey: process.env.SPOONACULAR_APIKEY
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Failed to search recipes' });
    }
});

app.get('/api/recipes/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

<<<<<<< Updated upstream
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/information`, {
                params: {
                    includeNutrition: true,
                    apiKey: process.env.SPOONACULAR_APIKEY
                }
            }
        );
=======
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        includeNutrition: true,
        apiKey: process.env.SPOONACULAR_APIKEY
      }
    }
    );
>>>>>>> Stashed changes

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
});

<<<<<<< Updated upstream
app.get('/api/food/upc', async (req: Request, res: Response) => {
    const { upc } = req.query;
=======
app.get('/api/nutritionix/upc', async (req: Request, res: Response) => {
  const { upc } = req.query;
>>>>>>> Stashed changes

  if (!upc) {
    return res.status(400).json({ error: 'Se requiere un parámetro "upc"' });
  }

<<<<<<< Updated upstream
    console.log(`🔍 UPC recibido: ${upc}`);

    // Si Nutritionix no tiene datos, buscamos en FatSecret
    if (FATSECRET_CONSUMER_KEY && FATSECRET_CONSUMER_SECRET) {
        try {
            console.log('🔁 Buscando en FatSecret (MX)...');
            const fatSecretIdResponseMX = await searchFatSecretByUPC(upc as string, 'MX');

            console.log('📦 Respuesta FatSecret MX:', fatSecretIdResponseMX);

            if (fatSecretIdResponseMX?.food_id) {
                console.log('✅ Encontrado en FatSecret MX. Obteniendo detalles...');
                const fatSecretDetails = await getFatSecretFoodDetails(fatSecretIdResponseMX.food_id);
                return res.json({
                    source: 'fatsecret-mx',
                    data: fatSecretDetails
                });
            }

            console.log('❌ No encontrado en FatSecret MX. Probando con US...');

            const fatSecretIdResponseUS = await searchFatSecretByUPC(upc as string, 'US');
            console.log('📦 Respuesta FatSecret US:', fatSecretIdResponseUS);

            if (fatSecretIdResponseUS?.food_id) {
                console.log('✅ Encontrado en FatSecret US. Obteniendo detalles...');
                const fatSecretDetails = await getFatSecretFoodDetails(fatSecretIdResponseUS.food_id);
                return res.json({
                    source: 'fatsecret-us',
                    data: fatSecretDetails
                });
            }

            console.log('❌ No encontrado ni en FatSecret MX ni US.');
        } catch (err: any) {
            console.error('💥 Error al consultar FatSecret:', err.response?.data || err.message);
        }
    } else {
        console.warn('⚠️ Credenciales de FatSecret no definidas');
    }

    return res.status(404).json({
        error: 'Producto no encontrado en ninguna base de datos',
        tried_sources: ['nutritionix', 'fatsecret-mx', 'fatsecret-us']
    });
});


app.post('/api/food/search', async (req: Request, res: Response) => {
    const { query } = req.body;
=======
  try {
    const response = await axios.get('https://trackapi.nutritionix.com/v2/search/item', {
      headers: {
        'x-app-id': process.env.NUTRITIONIX_APP_ID!,
        'x-app-key': process.env.NUTRITIONIX_APP_KEY!,
      },
      params: { upc },
    });

    // Si Nutritionix responde con datos, enviarlos al frontend
    return res.json(response.data);

  } catch (err) {
    const error = err as { response?: { data?: { error?: string } }, message?: string };
    console.error(`❌ Error al consultar UPC: ${error.response?.data?.error || error.message || "Desconocido"}`);
    res.status(500).json({ error: 'Error al consultar UPC en Nutritionix' });

  }
});

app.post('/api/nutritionix/natural', async (req: Request, res: Response) => {
  const { query } = req.body;
>>>>>>> Stashed changes

  if (!query) {
    return res.status(400).json({ error: 'Se requiere un campo "query" en el cuerpo' });
  }

<<<<<<< Updated upstream
    try {
        // Primero intentamos con Nutritionix
        const nutritionixResponse = await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients',
            { query },
            {
                headers: {
                    'x-app-id': process.env.NUTRITIONIX_APP_ID!,
                    'x-app-key': process.env.NUTRITIONIX_APP_KEY!,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (nutritionixResponse.data?.foods?.length > 0) {
            return res.json({
                source: 'nutritionix',
                data: nutritionixResponse.data
            });
        }

        // Si Nutritionix no tiene datos, probamos con FatSecret
        if (FATSECRET_CONSUMER_KEY && FATSECRET_CONSUMER_SECRET) {
            const fatSecretResponse = await searchFatSecretByText(query);

            if (fatSecretResponse?.foods?.food?.length > 0) {
                return res.json({
                    source: 'fatsecret',
                    data: fatSecretResponse
                });
            }
        }

        return res.status(404).json({
            error: 'Alimento no encontrado en ninguna base de datos',
            tried_sources: ['nutritionix', 'fatsecret']
        });

    } catch (error) {
        console.error('Error al consultar alimentos:', error);
        res.status(500).json({ error: 'Error al obtener datos nutricionales' });
    }
=======
  try {
    const response = await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients',
      { query },
      {
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID!,
          'x-app-key': process.env.NUTRITIONIX_APP_KEY!,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error al consultar alimentos naturales:', error);
    res.status(500).json({ error: 'Error al obtener datos nutricionales' });
  }
>>>>>>> Stashed changes
});

// Iniciar el servidor
app.listen(PORT, () => {
<<<<<<< Updated upstream
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
=======
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


// --------------------------COMIDA--------------------------------
// ✅ Agrega este modelo en tu backend (en el mismo archivo o modularizado)
interface Food {
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

const Food = mongoose.model<Food>(
  'Food',
  new mongoose.Schema({}, { strict: false, collection: 'Food' })
);


app.get('/api/foods', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alimentos' });
  }
});
>>>>>>> Stashed changes
