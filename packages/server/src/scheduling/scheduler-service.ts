import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { ScheduledTask, SchedulerConfig, NotificationEvent } from './types';
import { NotificationService } from './notification-service';

export class SchedulerService {
  private tasks: Map<string, { task: ScheduledTask; cronJob: cron.ScheduledTask }>;
  private notificationService: NotificationService;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig) {
    this.tasks = new Map();
    this.notificationService = new NotificationService();
    this.config = config;
  }

  async scheduleTask(
    task: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<ScheduledTask> {
    // Validate cron expression
    if (!cron.validate(task.schedule)) {
      throw new Error('Invalid cron expression');
    }

    const newTask: ScheduledTask = {
      ...task,
      id: uuidv4(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cronJob = cron.schedule(task.schedule, () => this.executeTask(newTask), {
      scheduled: true,
      timezone: 'UTC',
    });

    this.tasks.set(newTask.id, { task: newTask, cronJob });

    // Calculate next run
    newTask.nextRun = this.calculateNextRun(task.schedule);

    return newTask;
  }

  async executeTask(task: ScheduledTask): Promise<void> {
    try {
      // Notify start
      await this.notifyProgress(task, 'progress', { status: 'starting' });

      // For now, we'll just simulate the screenshot capture
      // TODO: Implement actual screenshot capture
      const result = {
        id: uuidv4(),
        imageData: 'base64-encoded-image-data',
        timestamp: new Date().toISOString(),
        url: task.url,
        viewport: task.viewport,
      };

      // Update task status
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.schedule);
      task.updatedAt = new Date();

      // Notify success
      await this.notifyProgress(task, 'success', { result });
    } catch (error) {
      // Notify error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await this.notifyProgress(task, 'error', { error: errorMessage });

      // Handle retry if configured
      if (this.config.retryAttempts > 0) {
        setTimeout(() => {
          this.executeTask(task);
        }, this.config.retryDelay);
      }
    }
  }

  pauseTask(taskId: string): boolean {
    const taskEntry = this.tasks.get(taskId);
    if (!taskEntry) return false;

    taskEntry.cronJob.stop();
    taskEntry.task.status = 'paused';
    taskEntry.task.updatedAt = new Date();
    return true;
  }

  resumeTask(taskId: string): boolean {
    const taskEntry = this.tasks.get(taskId);
    if (!taskEntry) return false;

    taskEntry.cronJob.start();
    taskEntry.task.status = 'active';
    taskEntry.task.updatedAt = new Date();
    taskEntry.task.nextRun = this.calculateNextRun(taskEntry.task.schedule);
    return true;
  }

  deleteTask(taskId: string): boolean {
    const taskEntry = this.tasks.get(taskId);
    if (!taskEntry) return false;

    taskEntry.cronJob.stop();
    return this.tasks.delete(taskId);
  }

  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId)?.task;
  }

  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values()).map((entry) => entry.task);
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    const parts = schedule.split(' ');
    const [minute, hour, dayOfMonth] = parts;

    // Simple implementation: add one interval based on the most specific time unit
    if (minute !== '*') {
      return new Date(now.getTime() + parseInt(minute) * 60 * 1000);
    } else if (hour !== '*') {
      return new Date(now.getTime() + parseInt(hour) * 60 * 60 * 1000);
    } else if (dayOfMonth !== '*') {
      return new Date(now.getTime() + parseInt(dayOfMonth) * 24 * 60 * 60 * 1000);
    }

    // Default: return next hour
    return new Date(now.getTime() + 60 * 60 * 1000);
  }

  private async notifyProgress(
    task: ScheduledTask,
    type: NotificationEvent['type'],
    data: any
  ): Promise<void> {
    const event: NotificationEvent = {
      type,
      taskId: task.id,
      url: task.url,
      timestamp: new Date(),
      data,
    };

    await this.notificationService.sendNotification(task.notifications, event);
  }
}
