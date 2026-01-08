// Load environment variables before other imports
import dotenv from 'dotenv';
dotenv.config();

// Core dependencies
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import agentRoutes from './routes/agentRoutes';
import bookingRoutes from './routes/bookingRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Initialize Express application
const app: Application = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voice-agent';

// MIDDLEWARE

// CORS configuration - supports multiple frontend ports
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  process.env.FRONTEND_URL, // Production Vercel URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/agent', agentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected successfully');
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error.message);
    process.exit(1);
  }
};

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Error:', err);
});

// ============================================
// SERVER STARTUP WITH PORT CONFLICT HANDLING
// ============================================

const MAX_PORT_RETRIES = 5;

const startServer = async (portToTry: number = PORT, retryCount: number = 0): Promise<void> => {
  try {
    // Verify critical environment variables
    if (retryCount === 0) {
      console.log('[Config] Weather API Key:', process.env.OPENWEATHER_API_KEY ? 'Present' : 'Missing');

      // Connect to database
      await connectDB();
    }

    // Start HTTP server with error handling
    app.listen(portToTry)
      .on('listening', () => {
        console.log('============================================');
        console.log(`[Server] ✓ Successfully started on port ${portToTry}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[Server] API: http://localhost:${portToTry}`);
        console.log(`[Server] Health: http://localhost:${portToTry}/health`);
        console.log(`[Server] Admin Auth: http://localhost:${portToTry}/api/admin/auth/login`);
        console.log('============================================');
      })
      .on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          if (retryCount < MAX_PORT_RETRIES) {
            const nextPort = portToTry + 1;
            console.log(`[Server] ⚠️  Port ${portToTry} is in use, trying port ${nextPort}...`);
            startServer(nextPort, retryCount + 1);
          } else {
            console.error(`[Server] ❌ Failed to find available port after trying ${MAX_PORT_RETRIES + 1} ports`);
            console.error('[Server] Run this command to free up ports:');
            console.error('  Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }');
            process.exit(1);
          }
        } else {
          console.error('[Server] Startup error:', err);
          process.exit(1);
        }
      });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const shutdown = async () => {
  console.log('\n[Server] Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('[Server] Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

// Start the server
startServer();

export default app;
