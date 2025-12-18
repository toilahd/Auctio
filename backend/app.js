import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getLogger } from "./config/logger.js";
import { initializeSocket } from "./config/socket.js";
import { testDatabase } from "./config/prisma.js";
import biddingRoutes from './routes/biddingRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

// Routes
import authRouter from "./routes/auth.routes.js"
import docsRouter from "./routes/docs.routes.js"

dotenv.config()
const app = express();
const httpServer = createServer(app);
const appLogger = getLogger('App');

// Test database connection
testDatabase();
// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(docsRouter);
app.use(authRouter);

const startServer = async () => {
    try {
        app.listen(port, () => {
            appLogger.info(`Server is running on port ${port}`);
        });

// Initialize Socket.IO
const io = initializeSocket(httpServer);
app.set('io', io); // Make io accessible in routes

// Routes
app.use('/api/bids', biddingRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    appLogger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    appLogger.info(`Server is running on port ${PORT}`);
});

export default app;

startServer();
