import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { Screenshot } from '@/lib/screenshot';
import { cn } from '@/lib/utils';

interface ScreenshotModalProps {
  screenshot: Screenshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void;
}

export function ScreenshotModal({
  screenshot,
  open,
  onOpenChange,
  onDownload,
}: ScreenshotModalProps) {
  if (!screenshot) return null;

  const colors = screenshot.colors || {
    primary: 'rgb(15, 23, 42)',
    secondary: 'rgb(30, 41, 59)',
    accent: 'rgb(56, 189, 248)',
  };

  const getViewportType = (viewport: { width: number }) => {
    if (viewport.width >= 1024) return 'desktop';
    if (viewport.width >= 768) return 'tablet';
    return 'mobile';
  };

  const viewportType = getViewportType(screenshot.viewport);
  const ViewportIcon =
    viewportType === 'desktop' ? Monitor : viewportType === 'tablet' ? Tablet : Smartphone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-gradient-to-br from-black/95 to-black/98">
        <div className="relative flex flex-col md:flex-row h-[90vh] md:h-[85vh]">
          {/* Image Section */}
          <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colors.accent}22, transparent 60%),
                          radial-gradient(circle at 70% 70%, ${colors.secondary}22, transparent 60%)`,
              }}
            />
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className={cn(
                  'relative max-w-full max-h-full overflow-hidden shadow-2xl',
                  viewportType === 'mobile' && 'w-[300px] aspect-[9/16]',
                  viewportType === 'tablet' && 'w-[600px] aspect-[4/3]',
                  viewportType === 'desktop' && 'w-full aspect-video'
                )}
                style={{
                  perspective: '1000px',
                  transform: 'rotateX(2deg) scale(0.98)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Device Frame */}
                <div
                  className={cn(
                    'absolute inset-0 z-20 pointer-events-none',
                    viewportType === 'mobile' &&
                      'rounded-[2.5rem] ring-2 ring-white/20 before:absolute before:top-12 before:right-0 before:w-0.5 before:h-16 before:bg-white/20 after:absolute after:left-1/2 after:-translate-x-1/2 after:top-4 after:h-1 after:w-12 after:rounded-full after:bg-white/20',
                    viewportType === 'tablet' &&
                      'rounded-[2rem] ring-2 ring-white/20 before:absolute before:top-12 before:right-0 before:w-0.5 before:h-16 before:bg-white/20 after:absolute after:left-1/2 after:-translate-x-1/2 after:top-4 after:h-1 after:w-16 after:rounded-full after:bg-white/20',
                    viewportType === 'desktop' && 'rounded-lg ring-1 ring-white/20'
                  )}
                />

                <div className={cn('relative w-full h-full', viewportType !== 'desktop' && 'p-2')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 z-10 pointer-events-none" />
                  <img
                    src={screenshot.imageData}
                    alt={`Screenshot of ${screenshot.url}`}
                    className={cn(
                      'w-full h-full object-cover rounded-lg',
                      viewportType === 'mobile' && 'rounded-[2rem]',
                      viewportType === 'tablet' && 'rounded-[1.5rem]'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="w-full md:w-80 p-6 flex flex-col border-l border-white/10 bg-black/40 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white/90">
                Website Screenshot
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Captured on {new Date(screenshot.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium text-white/60">Device Type</label>
                <div className="mt-1 flex items-center space-x-2">
                  <ViewportIcon
                    className={cn(
                      'h-4 w-4',
                      viewportType === 'mobile' && 'rotate-0',
                      viewportType === 'tablet' && 'rotate-90'
                    )}
                    style={{ color: colors.accent }}
                  />
                  <span className="text-sm text-white/90">
                    {viewportType.charAt(0).toUpperCase() + viewportType.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/60">URL</label>
                <p className="mt-1 text-sm text-white/90 break-all">{screenshot.url}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-white/60">Viewport Size</label>
                <p className="mt-1 text-sm text-white/90">
                  {screenshot.viewport.width} × {screenshot.viewport.height}
                </p>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={onDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Screenshot
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
