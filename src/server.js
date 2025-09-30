import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import usersRouter from './routes/users.js';

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express Backend API' });
});

// Routes
app.use('/api/users', usersRouter);

// Import error middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();