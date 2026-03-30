import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import programRoutes from './routes/programs';
import customerRoutes from './routes/customers';
import stampRoutes from './routes/stamps';
import analyticsRoutes from './routes/analytics';
import cardRoutes from './routes/cards';
import enrollRoutes from './routes/enroll';
import { AppError } from './types';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
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
app.use('/api/enroll', enrollRoutes);

// #15: Global error handler — catches unhandled errors, no stack trace leak
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Stamply backend running on http://localhost:${PORT}`);
});

export default app;
