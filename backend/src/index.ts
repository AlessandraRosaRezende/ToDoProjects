import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects';
import commentsRouter from './routes/comments';
import peopleRouter from './routes/people';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/people', peopleRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});