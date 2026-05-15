import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";

import betRouter from "./routes/betRoutes.js";
import userRouter from "./routes/authRoutes.js";
import roundRouter from "./routes/roundRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import { initGame } from "./services/gameEngine.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

//  Allowed origins (single source of truth)
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.6:5173",
];

//  Connect DB safely
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("MongoDB connected");

    //  Socket.IO setup
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    //  Track REAL users (Not just sockets)
    const onlineUsers = new Set();

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      //  Frontend should send userId after login
      socket.on("user:join", (userId) => {
        if (userId) {
          socket.userId = userId;
          onlineUsers.add(userId);

          io.emit("players:online", onlineUsers.size);
        }
      });

      socket.emit("connection:success", {
        message: "Socket connected successfully",
        socketId: socket.id,
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        if (socket.userId) {
          onlineUsers.delete(socket.userId);
          io.emit("players:online", onlineUsers.size);
        }
      });
    });

    //  Middlewares
    app.use(helmet());
    app.use(express.json());

    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      }),
    );

    //  Routes
    app.use("/api/bet", betRouter);
    app.use("/api/user", userRouter);
    app.use("/api/round", roundRouter);

    //  Error middleware (Detecting Error Globally in App)
    app.use(errorHandler);

    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);

      //  Start game loop AFTER server + socket ready
      initGame(io);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

//  Start everything
startServer();
