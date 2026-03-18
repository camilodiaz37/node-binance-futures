import 'dotenv/config';
import express from 'express';
import { getAccountBalance } from './binance';

const app = express();
const PORT = 3002;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Servidor Express con TypeScript funcionando en puerto 3002' });
});

app.get('/balance', async (req, res) => {
  try {
    const balance = await getAccountBalance();
    res.json(balance);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});