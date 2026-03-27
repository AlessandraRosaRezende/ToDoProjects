import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects';
import commentsRouter from './routes/comments';
import peopleRouter from './routes/people';
import projectLogsRouter from './routes/projectLogs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/people', peopleRouter);
app.use('/api/project-logs', projectLogsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});