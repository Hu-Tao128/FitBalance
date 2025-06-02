import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('No se encontró MONGODB_URI en el archivo .env');
}

// ✅ Esquema y modelo para usar la colección "Patients"
interface IPatient {
  nombre: string;
  correo: string;
  usuario: string;
  password: string;
  edad?: number;
  sexo?: string;
  altura_cm?: number;
  peso_kg?: number;
  objetivo?: string;
  ultima_consulta?: string;
}

// Actualiza el esquema de Patient
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

// ✅ Conexión a MongoDB
mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// ✅ Ruta GET /usuarios — obtener todos los pacientes
app.get('/usuarios', async (req: Request, res: Response) => {
    try {
        const usuarios = await Patient.find();
        res.json(usuarios);
    } catch (err) {
        console.error('❌ Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ✅ Ruta POST /usuarios — crear nuevo paciente
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

// ✅ Ruta POST /login — validar credenciales del paciente
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { usuario, password } = req.body;

    console.log('📥 Datos recibidos en /login:', { usuario, password });

    if (!usuario || !password) {
        res.status(400).json({ mensaje: 'Faltan campos: usuario y/o contraseña' });
        return;
    }

    try {
        const paciente = await Patient.findOne({ usuario, password });

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
            correo: paciente.correo
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
});

// ✅ Nuevo endpoint para obtener detalles de receta
app.get('/api/recipes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`, {
        params: {
          includeNutrition: true,
          apiKey: process.env.SPOONACULAR_APIKEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

// ✅ Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
