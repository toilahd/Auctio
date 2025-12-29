import express from "express";
import cookie from "cookie-parser";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { getLogger } from "./config/logger.js";
import { initializeSocket } from "./config/socket.js";
import { testDatabase } from "./config/prisma.js";
import biddingRoutes from "./routes/biddingRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
dotenv.config();

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const PORT = process.env.PORT || 3000;

// Routes
import authRouter from "./routes/auth.routes.js";
import docsRouter from "./routes/docs.routes.js";

const app = express();
const httpServer = createServer(app);
const appLogger = getLogger("App");

app.use(express.json());
app.use(cookie());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testDatabase();
// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = initializeSocket(httpServer);
app.set("io", io); // Make io accessible in routes

// Routes
app.use(docsRouter);
app.use(authRouter);
app.use("/api/bids", biddingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  appLogger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
httpServer.listen(PORT, () => {
  appLogger.info(`Server is running on port ${PORT}`);
});

export default app;
