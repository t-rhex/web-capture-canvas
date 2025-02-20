import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CaptureSettings {
  delay: number;
  fullPage: boolean;
  hideAds: boolean;
  hideCookieBanners: boolean;
  selector?: string;
  waitForSelector?: string;
  scrollToElement?: boolean;
  hoverSelector?: string;
  authentication?: {
    username?: string;
    password?: string;
    loginUrl?: string;
    loginSelector?: string;
  };
  beforeCapture?: {
    click?: string[];
    hover?: string[];
    wait?: number;
  };
}

interface SettingsDialogProps {
  settings: CaptureSettings;
  onSettingsChange: (settings: CaptureSettings) => void;
}

export function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Capture Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="delay">Capture Delay (seconds)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  className="w-20"
                  value={settings.delay}
                  onChange={(e) => onSettingsChange({ ...settings, delay: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="fullPage">Capture Full Page</Label>
                <Switch
                  id="fullPage"
                  checked={settings.fullPage}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, fullPage: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hideAds">Hide Ads</Label>
                <Switch
                  id="hideAds"
                  checked={settings.hideAds}
                  onCheckedChange={(checked) => onSettingsChange({ ...settings, hideAds: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hideCookieBanners">Hide Cookie Banners</Label>
                <Switch
                  id="hideCookieBanners"
                  checked={settings.hideCookieBanners}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, hideCookieBanners: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selector">Element Selector</Label>
                <Input
                  id="selector"
                  placeholder="#main-content, .hero-section"
                  value={settings.selector || ''}
                  onChange={(e) => onSettingsChange({ ...settings, selector: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  CSS selector for capturing specific elements. Leave empty to capture entire page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waitForSelector">Wait for Element</Label>
                <Input
                  id="waitForSelector"
                  placeholder=".dynamic-content"
                  value={settings.waitForSelector || ''}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, waitForSelector: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Wait for this element to be present before capturing.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="scrollToElement">Scroll to Element</Label>
                  <p className="text-sm text-muted-foreground">
                    Scroll to the selected element before capture.
                  </p>
                </div>
                <Switch
                  id="scrollToElement"
                  checked={settings.scrollToElement || false}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, scrollToElement: checked })
                  }
                />
              </div>

              <Collapsible open={isAuthOpen} onOpenChange={setIsAuthOpen} className="space-y-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex w-full justify-between">
                    <span>Authentication Settings</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginUrl">Login URL</Label>
                    <Input
                      id="loginUrl"
                      placeholder="https://example.com/login"
                      value={settings.authentication?.loginUrl || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          authentication: {
                            ...settings.authentication,
                            loginUrl: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={settings.authentication?.username || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          authentication: {
                            ...settings.authentication,
                            username: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={settings.authentication?.password || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          authentication: {
                            ...settings.authentication,
                            password: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginSelector">Login Button/Form Selector</Label>
                    <Input
                      id="loginSelector"
                      placeholder="#login-form, .submit-button"
                      value={settings.authentication?.loginSelector || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          authentication: {
                            ...settings.authentication,
                            loginSelector: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isInteractionOpen}
                onOpenChange={setIsInteractionOpen}
                className="space-y-2"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex w-full justify-between">
                    <span>Interaction Settings</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clickSelectors">Click Elements</Label>
                    <Textarea
                      id="clickSelectors"
                      placeholder=".cookie-accept
.modal-close
#expand-button"
                      value={settings.beforeCapture?.click?.join('\n') || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          beforeCapture: {
                            ...settings.beforeCapture,
                            click: e.target.value.split('\n').filter(Boolean),
                          },
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Elements to click before capture (one selector per line).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hoverSelectors">Hover Elements</Label>
                    <Textarea
                      id="hoverSelectors"
                      placeholder=".dropdown-menu
.tooltip-trigger"
                      value={settings.beforeCapture?.hover?.join('\n') || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          beforeCapture: {
                            ...settings.beforeCapture,
                            hover: e.target.value.split('\n').filter(Boolean),
                          },
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Elements to hover over before capture (one selector per line).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interactionWait">Wait After Interactions (ms)</Label>
                    <Input
                      id="interactionWait"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="1000"
                      value={settings.beforeCapture?.wait || ''}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          beforeCapture: {
                            ...settings.beforeCapture,
                            wait: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Time to wait after interactions before capturing (in milliseconds).
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
