
import { Card } from "@/components/ui/card";
import { Download, Monitor, Share2, Smartphone, Tablet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Viewport } from "./viewport-selector";

interface Screenshot {
  url: string;
  viewport: Viewport;
  timestamp: string;
  imageUrl?: string;
}

const viewportIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

// Example screenshots to demonstrate the app's capabilities
const exampleScreenshots: Screenshot[] = [
  {
    url: "https://example.com",
    viewport: "desktop",
    timestamp: "Just now",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  },
  {
    url: "https://example.com",
    viewport: "tablet",
    timestamp: "Just now",
    imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
  },
  {
    url: "https://example.com",
    viewport: "mobile",
    timestamp: "Just now",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
];

export function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  const allScreenshots = screenshots.length ? screenshots : exampleScreenshots;

  return (
    <div className="space-y-6 w-full max-w-7xl animate-fadeIn">
      {screenshots.length === 0 && (
        <div className="text-center text-muted-foreground">
          ↑ Enter a URL above to generate your own screenshots. Here's how they'll look:
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allScreenshots.map((screenshot, index) => {
          const IconComponent = viewportIcons[screenshot.viewport];
          return (
            <Card
              key={`${screenshot.url}-${index}`}
              className="overflow-hidden group hover:ring-2 ring-primary/20 transition-all duration-200"
            >
              <div className="aspect-video relative bg-muted">
                {screenshot.imageUrl ? (
                  <img
                    src={screenshot.imageUrl}
                    alt={`Screenshot of ${screenshot.url} on ${screenshot.viewport}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="space-y-2 text-center">
                      <div className="animate-pulse">Processing...</div>
                      <div className="text-xs">This usually takes a few seconds</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <IconComponent className="w-4 h-4" />
                    <span className="capitalize">{screenshot.viewport}</span>
                  </div>
                  <time className="text-sm text-muted-foreground">{screenshot.timestamp}</time>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
