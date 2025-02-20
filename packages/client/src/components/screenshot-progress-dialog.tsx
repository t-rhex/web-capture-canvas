import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScreenshotProgress } from './screenshot-progress';
import { X } from 'lucide-react';

interface ScreenshotProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'starting' | 'processing' | 'completed' | 'error';
  progress: number;
  currentUrl?: string;
  completed?: number;
  total?: number;
  error?: string;
  onCancel?: () => void;
}

export function ScreenshotProgressDialog({
  open,
  onOpenChange,
  status,
  progress,
  currentUrl,
  completed,
  total,
  error,
  onCancel,
}: ScreenshotProgressDialogProps) {
  const canClose = status === 'completed' || status === 'error';

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Capturing Screenshots</DialogTitle>
          <DialogDescription>
            {status === 'starting' && 'Preparing to capture screenshots...'}
            {status === 'processing' && 'Capturing screenshots in progress...'}
            {status === 'completed' && 'All screenshots have been captured!'}
            {status === 'error' && 'An error occurred while capturing screenshots.'}
          </DialogDescription>
        </DialogHeader>

        <ScreenshotProgress
          status={status}
          progress={progress}
          currentUrl={currentUrl}
          completed={completed}
          total={total}
          error={error}
        />

        <div className="flex justify-end gap-4">
          {status !== 'completed' && (
            <Button variant="outline" onClick={onCancel} disabled={!onCancel || status === 'error'}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          {canClose && (
            <Button variant="default" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
