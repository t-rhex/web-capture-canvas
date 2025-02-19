
import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { ViewportSelector, type Viewport } from "@/components/viewport-selector";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { Card, CardContent } from "@/components/ui/card";

export default function Index() {
  const [selectedViewports, setSelectedViewports] = useState<Viewport[]>(["desktop"]);
  const [screenshots, setScreenshots] = useState<
    Array<{ url: string; viewport: Viewport; timestamp: string; imageUrl?: string }>
  >([]);

  const handleViewportSelect = (viewport: Viewport) => {
    setSelectedViewports((prev) =>
      prev.includes(viewport)
        ? prev.filter((v) => v !== viewport)
        : [...prev, viewport]
    );
  };

  const handleUrlSubmit = (url: string) => {
    const newScreenshots = selectedViewports.map((viewport) => ({
      url,
      viewport,
      timestamp: new Date().toLocaleTimeString(),
    }));
    setScreenshots((prev) => [...newScreenshots, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-12 flex flex-col items-center space-y-8">
        <div className="text-center space-y-4 animate-fadeIn">
          <h1 className="text-4xl font-bold tracking-tight">
            Website Screenshot Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Capture beautiful screenshots of any website in multiple device sizes.
            Perfect for your portfolio and documentation.
          </p>
        </div>

        <Card className="w-full max-w-3xl p-6 animate-slideUp">
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">Website URL</label>
              <UrlInput onSubmit={handleUrlSubmit} />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Device Sizes</label>
              <ViewportSelector
                selected={selectedViewports}
                onSelect={handleViewportSelect}
              />
            </div>
          </CardContent>
        </Card>

        <ScreenshotGallery screenshots={screenshots} />
      </main>
    </div>
  );
}
