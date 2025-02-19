
import { Card } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { Viewport } from "./viewport-selector";

interface Screenshot {
  url: string;
  viewport: Viewport;
  timestamp: string;
}

const viewportIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  if (!screenshots.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl animate-fadeIn">
      {screenshots.map((screenshot, index) => {
        const Icon = viewportIcons[screenshot.viewport];
        return (
          <Card
            key={`${screenshot.url}-${index}`}
            className="overflow-hidden group hover:ring-2 ring-primary/20 transition-all duration-200"
          >
            <div className="aspect-video relative bg-muted animate-pulse">
              {/* Screenshot would be displayed here */}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Processing...
              </div>
            </div>
            <div className="p-4 flex items-center justify-between border-t">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon size={16} />
                <span className="capitalize">{screenshot.viewport}</span>
              </div>
              <time className="text-sm text-muted-foreground">{screenshot.timestamp}</time>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
