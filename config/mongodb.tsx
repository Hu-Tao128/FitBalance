const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://oscarblaugrana:dcBVGQu9dgoWjt9K@fitbalance.4vcdip8.mongodb.net/test?retryWrites=true&w=majority";

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db('test');
    const collection = db.collection('devices');

    console.log('Conexión exitosa a MongoDB');

    // Aquí puedes usar collection.find(), insertOne(), etc.

    await client.close(); // no olvides cerrar
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
  }
}

connectToDatabase();
