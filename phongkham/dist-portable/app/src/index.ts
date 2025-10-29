import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import patientsRouter from './routes/patients.js';
import refractionsRouter from './routes/refractions.js';
import productsRouter from './routes/products.js';
import invoicesRouter from './routes/invoices.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGO_URI; // optional; default off

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'server', time: new Date().toISOString() });
});

app.use('/api/patients', patientsRouter);
app.use('/api/refractions', refractionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, message: err?.message ?? 'Internal Server Error' });
});

async function start() {
  try {
    if (mongoUri && mongoUri.trim().length > 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } else {
      console.log('MongoDB disabled (no MONGO_URI). Using SQLite via Prisma only.');
    }
    // Use native timeouts to avoid unhandled promise rejections during shutdown
    const server = app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();



