import { Router, Request, Response } from 'express';
import { SchedulerService } from './scheduler-service';
import { ScheduledTask } from './types';

const router = Router();
const schedulerService = new SchedulerService({
  enabled: true,
  maxConcurrent: 5,
  retryAttempts: 3,
  retryDelay: 5000,
});

// Create a new scheduled task
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const taskData = req.body as Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
    const task = await schedulerService.scheduleTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
    res.status(400).json({ error: errorMessage });
  }
});

// Get all scheduled tasks
router.get('/tasks', (_req: Request, res: Response) => {
  const tasks = schedulerService.getAllTasks();
  res.json(tasks);
});

// Get a specific task
router.get('/tasks/:taskId', (req: Request, res: Response) => {
  const task = schedulerService.getTask(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Pause a task
router.post('/tasks/:taskId/pause', (req: Request, res: Response) => {
  const success = schedulerService.pauseTask(req.params.taskId);
  if (!success) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task paused successfully' });
});

// Resume a task
router.post('/tasks/:taskId/resume', (req: Request, res: Response) => {
  const success = schedulerService.resumeTask(req.params.taskId);
  if (!success) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task resumed successfully' });
});

// Delete a task
router.delete('/tasks/:taskId', (req: Request, res: Response) => {
  const success = schedulerService.deleteTask(req.params.taskId);
  if (!success) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task deleted successfully' });
});

export default router;
