import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', message: 'EcoAlert API running' });
});

app.listen(PORT, () => {
  console.log(`🌿 EcoAlert backend running on port ${PORT}`);
});
