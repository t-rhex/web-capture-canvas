import express from 'express';
import cors from 'cors';
import screenshotRoutes from './routes/screenshot.routes';
import schedulingRoutes from './scheduling/routes';
import { ScreenshotService } from './services/screenshot.service';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/screenshots', screenshotRoutes);
app.use('/api/scheduling', schedulingRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Graceful shutdown
const screenshotService = ScreenshotService.getInstance();
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  await screenshotService.cleanup();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
