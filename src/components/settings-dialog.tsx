
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CaptureSettings {
  delay: number;
  fullPage: boolean;
  hideAds: boolean;
  hideCookieBanners: boolean;
}

interface SettingsDialogProps {
  settings: CaptureSettings;
  onSettingsChange: (settings: CaptureSettings) => void;
}

export function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Screenshot Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Capture Delay (seconds)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={settings.delay}
              onChange={(e) =>
                onSettingsChange({ ...settings, delay: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Capture Full Page</Label>
              <Switch
                checked={settings.fullPage}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, fullPage: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Hide Ads</Label>
              <Switch
                checked={settings.hideAds}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, hideAds: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Hide Cookie Banners</Label>
              <Switch
                checked={settings.hideCookieBanners}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, hideCookieBanners: checked })
                }
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
