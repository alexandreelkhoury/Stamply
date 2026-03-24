import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import programRoutes from './routes/programs';
import customerRoutes from './routes/customers';
import stampRoutes from './routes/stamps';
import analyticsRoutes from './routes/analytics';
import cardRoutes from './routes/cards';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stamps', stampRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cards', cardRoutes);

app.listen(PORT, () => {
  console.log(`Stamply backend running on http://localhost:${PORT}`);
});

export default app;
