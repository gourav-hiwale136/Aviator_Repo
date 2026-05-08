import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import betRouter from "./routes/betRoutes.js";
import userRouter from "./routes/authRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import { initGame } from "./services/gameInstance.js";
import roundRouter from "./routes/roundRoutes.js";

dotenv.config();

const app = express();
connectDB(process.env.MONGO_URL);
const server = http.createServer(app);

// ✅ Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.6:5173",
      "http://localhost:3000",
      "http://localhost:8080",
    ],
    credentials: true,
  },
});

// ✅ Track online Users
let onlineUsers = new Set();

//Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  onlineUsers.add(socket.id);
  io.emit("players:online", onlineUsers.size);

  
  socket.emit("connection:success", {
    message: "Socket connected successfully",
    socketId: socket.id,
  });

  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    onlineUsers.delete(socket.id);

    //Update count
    io.emit("players:online", onlineUsers.size);
  });
});

//CORS for API
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "http://localhost:5173",
        "http://192.168.0.6:5173",
        "http://localhost:8000",
        "http://localhost:8080",
      ];

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());


app.use("/api/bet", betRouter);
app.use("/api/user", userRouter);
app.use("/api/round", roundRouter);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  initGame(io);
});