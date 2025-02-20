import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Download,
  Monitor,
  Share2,
  Smartphone,
  Tablet,
  Trash2,
  FolderOpen,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Screenshot } from '@/lib/screenshot';
import { ScreenshotModal } from './screenshot-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectFolder } from '@/components/project-folders';

const viewportIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

// Example screenshots to demonstrate the app's capabilities
const exampleScreenshots: Screenshot[] = [
  {
    url: 'https://example.com',
    viewport: {
      width: 1920,
      height: 1080,
    },
    timestamp: new Date().toISOString(),
    imageData: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  },
  {
    url: 'https://example.com',
    viewport: {
      width: 768,
      height: 1024,
    },
    timestamp: new Date().toISOString(),
    imageData: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
  },
  {
    url: 'https://example.com',
    viewport: {
      width: 375,
      height: 667,
    },
    timestamp: new Date().toISOString(),
    imageData: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  },
];

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  onMoveToFolder?: (screenshotIds: string[], targetFolderId: string) => void;
  folders?: ProjectFolder[];
}

interface PreviewCardProps {
  url: string;
  viewportType: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}

function PreviewCard({ url, viewportType, width, height }: PreviewCardProps) {
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const ViewportIcon = viewportIcons[viewportType];

  useEffect(() => {
    if (!url) return;

    const generatePreview = async () => {
      setLoading(true);
      try {
        // Here you would typically call your backend API to generate a live preview
        // For now, we'll simulate it with a timeout
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setPreviewUrl(
          `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&viewport_width=${width}&viewport_height=${height}&access_key=YOUR_API_KEY`
        );
      } catch (error) {
        console.error('Preview generation failed:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [url, width, height]);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300">
      <div className="relative z-10">
        <div
          className={cn(
            'aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-b from-black/5 to-black/0',
            viewportType === 'mobile' && 'aspect-[9/16] max-w-[240px] mx-auto',
            viewportType === 'tablet' && 'aspect-[4/3] max-w-[400px] mx-auto'
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 z-10 pointer-events-none" />

          {/* Device Frame */}
          <div
            className={cn(
              'absolute inset-0 z-20 pointer-events-none',
              viewportType === 'mobile' &&
                'rounded-[2rem] ring-2 ring-white/20 before:absolute before:top-8 before:right-0 before:w-0.5 before:h-12 before:bg-white/20 after:absolute after:top-4 before:rounded-full after:left-1/2 after:-translate-x-1/2 after:top-2 after:h-1 after:w-8 after:rounded-full after:bg-white/20',
              viewportType === 'tablet' &&
                'rounded-[1.5rem] ring-2 ring-white/20 before:absolute before:top-8 before:right-0 before:w-0.5 before:h-12 before:bg-white/20 after:absolute after:left-1/2 after:-translate-x-1/2 after:top-2 after:h-1 after:w-12 after:rounded-full after:bg-white/20'
            )}
          />

          <div className={cn('relative w-full h-full', viewportType !== 'desktop' && 'p-2')}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={`Preview of ${url}`}
                className={cn(
                  'w-full h-full object-cover shadow-xl rounded-lg',
                  viewportType === 'mobile' && 'rounded-[1.5rem]',
                  viewportType === 'tablet' && 'rounded-[1rem]'
                )}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-card">
                <Eye className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ViewportIcon
                  className={cn(
                    'w-4 h-4',
                    viewportType === 'mobile' && 'rotate-0',
                    viewportType === 'tablet' && 'rotate-90'
                  )}
                />
                <span className="text-sm font-medium">
                  {viewportType.charAt(0).toUpperCase() + viewportType.slice(1)} Preview
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {width} × {height}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function ScreenshotGallery({
  screenshots,
  onMoveToFolder,
  folders,
}: ScreenshotGalleryProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Ensure screenshots is an array and filter out any invalid entries
  const validScreenshots = (screenshots || []).filter(
    (screenshot) =>
      screenshot && screenshot.viewport && typeof screenshot.viewport.width === 'number'
  );

  const allScreenshots = validScreenshots.length ? validScreenshots : exampleScreenshots;

  const handleMoveToFolder = (screenshot: Screenshot, folderId: string) => {
    onMoveToFolder?.([screenshot.id], folderId);
    toast({
      title: 'Screenshot moved',
      description: `Screenshot has been moved to the selected folder.`,
    });
  };

  const getViewportType = (viewport: { width: number } | undefined) => {
    if (!viewport) return 'desktop';
    if (viewport.width >= 1024) return 'desktop';
    if (viewport.width >= 768) return 'tablet';
    return 'mobile';
  };

  const handleDownload = (screenshot: Screenshot) => {
    try {
      // Create a link element
      const link = document.createElement('a');

      // Convert base64 to blob URL if it's a base64 string
      const imageUrl = screenshot.imageData.startsWith('data:')
        ? screenshot.imageData
        : `data:image/png;base64,${screenshot.imageData}`;

      // Set download attributes
      link.href = imageUrl;
      link.download = `screenshot-${screenshot.url.replace(/[^a-z0-9]/gi, '-')}-${
        screenshot.viewport.width
      }x${screenshot.viewport.height}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Screenshot downloaded',
        description: 'The screenshot has been saved to your downloads folder.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the screenshot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (screenshot: Screenshot) => {
    try {
      if (navigator.share) {
        const blob = await fetch(screenshot.imageData).then((r) => r.blob());
        await navigator.share({
          title: `Screenshot of ${screenshot.url}`,
          text: `Screenshot taken on ${new Date(screenshot.timestamp).toLocaleString()}`,
          files: [new File([blob], 'screenshot.png', { type: 'image/png' })],
        });
      } else {
        await navigator.clipboard.writeText(screenshot.imageData);
        toast({
          title: 'Link copied',
          description: 'Screenshot URL has been copied to your clipboard.',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Share failed',
        description: 'Failed to share the screenshot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (screenshot: Screenshot) => {
    // TODO: Implement delete functionality
    toast({
      title: 'Screenshot deleted',
      description: 'The screenshot has been removed from your gallery.',
    });
  };

  return (
    <div className="space-y-6 w-full max-w-7xl animate-fadeIn">
      {/* Preview Section */}
      {showPreview && previewUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Live Preview</h3>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
              Hide Preview
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PreviewCard url={previewUrl} viewportType="desktop" width={1920} height={1080} />
            <PreviewCard url={previewUrl} viewportType="tablet" width={768} height={1024} />
            <PreviewCard url={previewUrl} viewportType="mobile" width={375} height={667} />
          </div>
        </div>
      )}

      {screenshots.length === 0 && (
        <div className="text-center space-y-4">
          <div className="p-8 border-2 border-dashed rounded-lg bg-card/50">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Ready to Capture</h3>
              <p className="text-sm text-muted-foreground">
                Enter a URL above to generate your own screenshots. Here's a preview of how they'll
                look:
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Example Screenshots:</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allScreenshots.map((screenshot, index) => {
          const viewportType = getViewportType(screenshot.viewport);
          const ViewportIcon = viewportIcons[viewportType];
          const colors = screenshot.colors || {
            primary: 'rgb(15, 23, 42)',
            secondary: 'rgb(30, 41, 59)',
            accent: 'rgb(56, 189, 248)',
          };

          return (
            <Card
              key={index}
              className={cn(
                'group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer',
                viewportType === 'mobile' && 'lg:col-span-1',
                viewportType === 'tablet' && 'lg:col-span-1',
                viewportType === 'desktop' && 'lg:col-span-1'
              )}
              onClick={() => {
                setSelectedScreenshot(screenshot);
                setModalOpen(true);
              }}
              style={{
                background: `linear-gradient(135deg, ${colors.primary}dd, ${colors.secondary}dd)`,
                boxShadow: `0 8px 32px -4px ${colors.accent}33`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}bb, ${colors.secondary}bb)`,
                }}
              />

              <div className="relative z-10">
                <div
                  className={cn(
                    'aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-b from-black/5 to-black/0',
                    viewportType === 'mobile' && 'aspect-[9/16] max-w-[240px] mx-auto',
                    viewportType === 'tablet' && 'aspect-[4/3] max-w-[400px] mx-auto'
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 z-10 pointer-events-none" />

                  {/* Device Frame */}
                  <div
                    className={cn(
                      'absolute inset-0 z-20 pointer-events-none',
                      viewportType === 'mobile' &&
                        'rounded-[2rem] ring-2 ring-white/20 before:absolute before:top-8 before:right-0 before:w-0.5 before:h-12 before:bg-white/20 after:absolute after:top-4 before:rounded-full after:left-1/2 after:-translate-x-1/2 after:top-2 after:h-1 after:w-8 after:rounded-full after:bg-white/20',
                      viewportType === 'tablet' &&
                        'rounded-[1.5rem] ring-2 ring-white/20 before:absolute before:top-8 before:right-0 before:w-0.5 before:h-12 before:bg-white/20 after:absolute after:left-1/2 after:-translate-x-1/2 after:top-2 after:h-1 after:w-12 after:rounded-full after:bg-white/20'
                    )}
                  />

                  <div
                    className={cn('relative w-full h-full', viewportType !== 'desktop' && 'p-2')}
                  >
                    <img
                      src={screenshot.imageData}
                      alt={`Screenshot of ${screenshot.url}`}
                      className={cn(
                        'w-full h-full object-cover transform transition-all duration-300 group-hover:scale-105 shadow-xl rounded-lg',
                        viewportType === 'mobile' && 'rounded-[1.5rem]',
                        viewportType === 'tablet' && 'rounded-[1rem]'
                      )}
                      style={{
                        perspective: '1000px',
                        transform: 'rotateX(2deg)',
                        transformStyle: 'preserve-3d',
                      }}
                    />
                  </div>
                </div>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ViewportIcon
                          className={cn(
                            'w-4 h-4',
                            viewportType === 'mobile' && 'rotate-0',
                            viewportType === 'tablet' && 'rotate-90'
                          )}
                          style={{ color: colors.accent }}
                        />
                        <span className="text-sm font-medium" style={{ color: colors.accent }}>
                          {viewportType.charAt(0).toUpperCase() + viewportType.slice(1)}
                        </span>
                      </div>
                      <span className="text-xs text-white/60">
                        {new Date(screenshot.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-white/80">
                      <span className="truncate">{screenshot.url}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-white/60">
                        {screenshot.viewport.width} × {screenshot.viewport.height}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(screenshot);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(screenshot);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(screenshot);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {folders && folders.length > 0 && onMoveToFolder && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                              >
                                <FolderOpen className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {folders.map((folder) => (
                                <DropdownMenuItem
                                  key={folder.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToFolder(screenshot, folder.id);
                                  }}
                                >
                                  Move to {folder.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      <ScreenshotModal
        screenshot={selectedScreenshot}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDownload={() => selectedScreenshot && handleDownload(selectedScreenshot)}
      />
    </div>
  );
}
