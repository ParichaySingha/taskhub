import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import routes from "./routes/index.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make io available globally
app.set('io', io);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(morgan("dev"));
//database connection
mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error(err.stack);
    process.exit(1);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
    res.status(200).json({ message: "My Task Manager API" });
});

//http://localhost:5000/api-v1/auth
app.use("/api-v1", routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

//not found route
app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join workspace room
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
    console.log(`User joined workspace ${workspaceId}`);
  });

  // Leave workspace room
  socket.on('leave-workspace', (workspaceId) => {
    socket.leave(`workspace-${workspaceId}`);
    console.log(`User left workspace ${workspaceId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});