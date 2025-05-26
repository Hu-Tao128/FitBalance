import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('No se encontró MONGODB_URI en el archivo .env');
}

// Definir el esquema de Usuario
interface IUsuario {
    nombre: string;
    correo: string;
}

// Crear el modelo de Usuario
const Usuario = mongoose.model<IUsuario>('Usuario', new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true }
}));

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err: unknown) => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req: Request, res: Response) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (err: unknown) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Ruta para agregar un nuevo usuario
app.post('/usuarios', async (req: Request, res: Response) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (err: unknown) {
        console.error('Error al guardar usuario:', err);
        res.status(500).json({ error: 'Error al guardar usuario' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
