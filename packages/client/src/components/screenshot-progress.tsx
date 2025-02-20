import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

interface ScreenshotProgressProps {
  status: 'starting' | 'processing' | 'completed' | 'error';
  progress: number;
  currentUrl?: string;
  completed?: number;
  total?: number;
  error?: string;
  className?: string;
}

export function ScreenshotProgress({
  status,
  progress,
  currentUrl,
  completed,
  total,
  error,
  className,
}: ScreenshotProgressProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: 'Initializing', status: 'pending' },
    { label: 'Loading page', status: 'pending' },
    { label: 'Processing', status: 'pending' },
    { label: 'Capturing', status: 'pending' },
  ]);

  useEffect(() => {
    switch (status) {
      case 'starting':
        setSteps([
          { label: 'Initializing', status: 'processing' },
          { label: 'Loading page', status: 'pending' },
          { label: 'Processing', status: 'pending' },
          { label: 'Capturing', status: 'pending' },
        ]);
        break;
      case 'processing':
        setSteps([
          { label: 'Initializing', status: 'completed' },
          { label: 'Loading page', status: 'processing', message: currentUrl },
          { label: 'Processing', status: 'pending' },
          { label: 'Capturing', status: 'pending' },
        ]);
        break;
      case 'completed':
        setSteps([
          { label: 'Initializing', status: 'completed' },
          { label: 'Loading page', status: 'completed' },
          { label: 'Processing', status: 'completed' },
          { label: 'Capturing', status: 'completed' },
        ]);
        break;
      case 'error':
        setSteps((prev) =>
          prev.map((step) =>
            step.status === 'processing' ? { ...step, status: 'error', message: error } : step
          )
        );
        break;
    }
  }, [status, currentUrl, error]);

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Screenshot Progress
          {total && (
            <span className="text-sm font-normal text-muted-foreground">
              {completed} of {total} completed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2" />

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              {step.status === 'processing' ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : step.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : step.status === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2" />
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'processing' && 'text-blue-500',
                      step.status === 'completed' && 'text-green-500',
                      step.status === 'error' && 'text-red-500'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.status === 'processing' && (
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  )}
                </div>
                {step.message && <p className="text-xs text-muted-foreground">{step.message}</p>}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
