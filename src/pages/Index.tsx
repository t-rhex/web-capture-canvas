
import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { BatchUrlInput } from "@/components/batch-url-input";
import { ViewportSelector, type Viewport } from "@/components/viewport-selector";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsDialog } from "@/components/settings-dialog";

interface CaptureSettings {
  delay: number;
  fullPage: boolean;
  hideAds: boolean;
  hideCookieBanners: boolean;
}

export default function Index() {
  const [selectedViewports, setSelectedViewports] = useState<Viewport[]>(["desktop"]);
  const [screenshots, setScreenshots] = useState<
    Array<{ url: string; viewport: Viewport; timestamp: string; imageUrl?: string }>
  >([]);
  const [settings, setSettings] = useState<CaptureSettings>({
    delay: 0,
    fullPage: false,
    hideAds: true,
    hideCookieBanners: true,
  });

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

  const handleBatchUrlSubmit = (urls: string[]) => {
    const newScreenshots = urls.flatMap((url) =>
      selectedViewports.map((viewport) => ({
        url,
        viewport,
        timestamp: new Date().toLocaleTimeString(),
      }))
    );
    setScreenshots((prev) => [...newScreenshots, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b border-white/10 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-6 h-6" />
            <span className="font-semibold">Screenshot Generator</span>
          </div>
          <SettingsDialog settings={settings} onSettingsChange={setSettings} />
        </div>
      </header>

      <main className="container pt-24 pb-12 flex flex-col items-center space-y-8">
        <div className="text-center space-y-4 animate-fadeIn">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            Website Screenshot Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Capture beautiful screenshots of any website in multiple device sizes.
            Perfect for your portfolio and documentation.
          </p>
        </div>

        <Card className="w-full max-w-3xl p-6 animate-slideUp glass-card">
          <CardContent className="space-y-6">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single URL</TabsTrigger>
                <TabsTrigger value="batch">Batch Process</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <div className="space-y-4 pt-4">
                  <label className="text-sm font-medium">Website URL</label>
                  <UrlInput onSubmit={handleUrlSubmit} />
                </div>
              </TabsContent>
              <TabsContent value="batch">
                <div className="space-y-4 pt-4">
                  <label className="text-sm font-medium">Multiple URLs</label>
                  <BatchUrlInput onSubmit={handleBatchUrlSubmit} />
                </div>
              </TabsContent>
            </Tabs>

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
