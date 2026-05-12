import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import workspaceRoutes from './routes/workspace.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Socket.io Setup
export const io = new Server(httpServer, {
  cors: {
    origin: (origin: any, callback: any) => callback(null, true),
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_workspace', (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User ${socket.id} joined workspace ${workspaceId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Task Manager API is running...');
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
