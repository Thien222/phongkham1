import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import patientsRouter from './routes/patients.js';
import refractionsRouter from './routes/refractions.js';
import productsRouter from './routes/products.js';
import invoicesRouter from './routes/invoices.js';
import examinationsRouter from './routes/examinations.js';
import statsRouter from './routes/stats.js';
import vouchersRouter from './routes/vouchers.js';
import { backupDatabase } from './scripts/backup.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for signatures
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'server', time: new Date().toISOString() });
});

app.use('/api/patients', patientsRouter);
app.use('/api/refractions', refractionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/examinations', examinationsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/vouchers', vouchersRouter);

async function start() {
  try {
    if (mongoUri && mongoUri.trim().length > 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } else {
      console.log('MongoDB disabled (no MONGO_URI). Using SQLite via Prisma only.');
    }
    
    const server = app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      console.log('');
      
      // Backup lần đầu khi khởi động
      console.log('🔄 Backup database lần đầu...');
      backupDatabase();
      
      // Setup auto backup - Cứ 4 giờ backup 1 lần
      const BACKUP_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
      setInterval(() => {
        console.log('\n🔄 Auto backup database...');
        backupDatabase();
      }, BACKUP_INTERVAL);
      
      console.log(`⏰ Auto backup: Cứ 4 giờ backup 1 lần`);
      console.log('');
    });
    
    // Backup khi tắt server
    process.on('SIGINT', async () => {
      console.log('\n🔄 Backup database trước khi tắt server...');
      await backupDatabase();
      
      console.log('Shutting down...');
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      server.close(() => process.exit(0));
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🔄 Backup database trước khi tắt server...');
      await backupDatabase();
      
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

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, message: err?.message ?? 'Internal Server Error' });
});

start();


