import { io } from "socket.io-client";

console.log("🔥 socket.js LOADED");

export const socket = io("http://localhost:8000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});