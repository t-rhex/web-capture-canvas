import { CaptureSettings, Viewport } from '../types';

export interface ScheduledTask {
  id: string;
  url: string;
  schedule: string; // cron expression
  viewport: Viewport;
  settings: CaptureSettings;
  notifications: NotificationSettings;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  webhook?: {
    url: string;
    headers?: Record<string, string>;
  };
  email?: {
    to: string[];
    subject?: string;
    template?: string;
  };
}

export interface SchedulerConfig {
  enabled: boolean;
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number; // in milliseconds
}

export interface NotificationEvent {
  type: 'success' | 'error' | 'progress';
  taskId: string;
  url: string;
  timestamp: Date;
  data: any;
  error?: string;
}
