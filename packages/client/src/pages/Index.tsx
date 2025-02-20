import { useState } from 'react';
import { UrlInput } from '@/components/url-input';
import { BatchUrlInput } from '@/components/batch-url-input';
import { ViewportSelector, type Viewport } from '@/components/viewport-selector';
import { ScreenshotGallery } from '@/components/screenshot-gallery';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsDialog } from '@/components/settings-dialog';
import { CustomViewport } from '@/components/custom-viewport';
import { ProjectFolders } from '@/components/project-folders';
import { useScreenshotCapture } from '@/hooks/use-screenshot-capture';
import { ScreenshotProgressDialog } from '@/components/screenshot-progress-dialog';
import { CaptureSettings } from '@/lib/screenshot';
import { toast } from '@/components/ui/use-toast';
import {
  Folder,
  Monitor,
  Settings,
  Layers,
  Share2,
  Keyboard,
  Zap,
  Clock,
  Search,
  Layout,
  Command,
  ArrowLeft,
  HelpCircle,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ShortcutsDialog } from '@/components/shortcuts-dialog';
import { SizeGuide } from '@/components/size-guide';

const viewportOptions = [
  {
    id: 'desktop',
    label: 'Desktop',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
  },
  {
    id: 'tablet',
    label: 'Tablet',
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    isMobile: false,
  },
  { id: 'mobile', label: 'Mobile', width: 375, height: 667, deviceScaleFactor: 2, isMobile: true },
] as const;

interface ProjectFolder {
  id: string;
  name: string;
  createdAt: Date;
  description?: string;
  parentId?: string;
  lastModified: Date;
  children?: ProjectFolder[];
  screenshotIds: string[];
}

export default function Index() {
  const [selectedViewports, setSelectedViewports] = useState<Viewport[]>(['desktop']);
  const [settings, setSettings] = useState<CaptureSettings>({
    delay: 0,
    fullPage: false,
    hideAds: true,
    hideCookieBanners: true,
  });
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [showTutorial, setShowTutorial] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const {
    status,
    progress,
    currentUrl,
    completed,
    total,
    error,
    results,
    isDialogOpen,
    setIsDialogOpen,
    capture,
    captureBatch,
    reset,
    setState,
  } = useScreenshotCapture();

  const shortcuts = useKeyboardShortcuts([
    {
      key: '⌘+shift+n',
      callback: () => {
        if (!showApp) return;
        const input = document.querySelector<HTMLInputElement>(
          'input[placeholder="New folder name"]'
        );
        if (input) {
          input.focus();
          if (!input.value.trim()) {
            handleCreateFolder('New Folder');
          }
        }
      },
      description: 'Create a new folder',
      group: 'Organization',
    },
    {
      key: '⌘+shift+f',
      callback: () => {
        if (!showApp) return;
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder="Search folders..."]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Search folders and screenshots',
      group: 'Navigation',
    },
    {
      key: '⌘+k',
      callback: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts',
      group: 'General',
    },
    {
      key: '⌘+shift+,',
      callback: () => {
        const settingsButton = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Settings"]'
        );
        if (settingsButton) {
          settingsButton.click();
        }
      },
      description: 'Open settings',
      group: 'General',
    },
    {
      key: '⌘+enter',
      callback: () => {
        if (!showApp || !selectedFolder) return;
        const submitButton = document.querySelector<HTMLButtonElement>(
          'form button[type="submit"]'
        );
        if (submitButton) {
          submitButton.click();
        }
      },
      description: 'Start capture',
      group: 'Capture',
    },
    {
      key: '⌘+shift+d',
      callback: () => {
        if (!showApp || !selectedFolder) return;
        setSelectedViewports(['desktop', 'tablet', 'mobile']);
      },
      description: 'Select all devices',
      group: 'Capture',
    },
    {
      key: 'escape',
      callback: () => {
        setShowShortcuts(false);
        setShowTutorial(false);
        setIsDialogOpen(false);
      },
      description: 'Close any open dialog',
      group: 'Navigation',
    },
    {
      key: '⌘+/',
      callback: () => setShowTutorial(true),
      description: 'Show tutorial',
      group: 'General',
    },
    {
      key: '⌘+shift+b',
      callback: () => {
        if (!showApp || !selectedFolder) return;
        const batchTab = document.querySelector<HTMLButtonElement>('button[value="batch"]');
        if (batchTab) {
          batchTab.click();
        }
      },
      description: 'Switch to batch mode',
      group: 'Capture',
    },
  ]);

  const handleCreateFolder = (name: string, parentId?: string) => {
    const newFolder: ProjectFolder = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
      lastModified: new Date(),
      screenshotIds: [],
      parentId,
    };

    if (!parentId) {
      setFolders([...folders, newFolder]);
    } else {
      setFolders(
        updateFolderTree(folders, parentId, (folder) => ({
          ...folder,
          children: [...(folder.children || []), newFolder],
          lastModified: new Date(),
        }))
      );
    }
  };

  const handleRenameFolder = (id: string, newName: string) => {
    setFolders(
      updateFolderTree(folders, id, (folder) => ({
        ...folder,
        name: newName,
        lastModified: new Date(),
      }))
    );
  };

  const handleDeleteFolder = (id: string) => {
    const deleteFolder = (folders: ProjectFolder[]): ProjectFolder[] => {
      return folders.filter((folder) => {
        if (folder.id === id) {
          return false;
        }
        if (folder.children) {
          folder.children = deleteFolder(folder.children);
        }
        return true;
      });
    };

    setFolders(deleteFolder(folders));
    if (selectedFolder === id) {
      setSelectedFolder(undefined);
    }
  };

  const handleMoveFolder = (id: string, newParentId: string) => {
    let folderToMove: ProjectFolder | null = null;

    // Remove folder from its current location
    setFolders((prevFolders) => {
      const removeFolder = (folders: ProjectFolder[]): ProjectFolder[] => {
        return folders.filter((folder) => {
          if (folder.id === id) {
            folderToMove = { ...folder, parentId: newParentId };
            return false;
          }
          if (folder.children) {
            folder.children = removeFolder(folder.children);
          }
          return true;
        });
      };
      return removeFolder(prevFolders);
    });

    // Add folder to new location
    if (folderToMove) {
      setFolders((prevFolders) =>
        updateFolderTree(prevFolders, newParentId, (folder) => ({
          ...folder,
          children: [...(folder.children || []), folderToMove!],
          lastModified: new Date(),
        }))
      );
    }
  };

  const updateFolderTree = (
    folders: ProjectFolder[],
    targetId: string,
    updateFn: (folder: ProjectFolder) => ProjectFolder
  ): ProjectFolder[] => {
    return folders.map((folder) => {
      if (folder.id === targetId) {
        return updateFn(folder);
      }
      if (folder.children) {
        return {
          ...folder,
          children: updateFolderTree(folder.children, targetId, updateFn),
        };
      }
      return folder;
    });
  };

  const handleViewportSelect = (viewport: Viewport) => {
    setSelectedViewports((prev) =>
      prev.includes(viewport) ? prev.filter((v) => v !== viewport) : [...prev, viewport]
    );
  };

  const handleCustomViewportAdd = (name: string, width: number, height: number) => {
    // Here you would add custom viewport logic
    console.log('Custom viewport:', { name, width, height });
  };

  const handleUrlSubmit = async (baseUrl: string, additionalUrls: string[]) => {
    if (!selectedFolder) {
      toast({
        title: 'No folder selected',
        description: 'Please select or create a folder first to save your screenshots.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const urls = [baseUrl, ...additionalUrls].filter(Boolean);
      let allResults: Screenshot[] = [];

      for (const url of urls) {
        for (const viewport of selectedViewports) {
          const viewportConfig =
            viewportOptions.find((v) => v.id === viewport) || viewportOptions[0];

          const result = await capture(
            url,
            {
              width: viewportConfig.width,
              height: viewportConfig.height,
              deviceScaleFactor: viewportConfig.deviceScaleFactor,
              isMobile: viewportConfig.isMobile,
            },
            settings
          );

          // Handle both single result and array of results
          const screenshots = Array.isArray(result) ? result : [result];

          // Add IDs to screenshots if they don't have them
          const screenshotsWithIds = screenshots.map((screenshot) => ({
            ...screenshot,
            id: screenshot.id || crypto.randomUUID(),
          }));

          allResults = [...allResults, ...screenshotsWithIds];
        }
      }

      // Add screenshots to the selected folder
      const screenshotIds = allResults.map((s) => s.id);
      setFolders(
        updateFolderTree(folders, selectedFolder, (folder) => ({
          ...folder,
          screenshotIds: [...folder.screenshotIds, ...screenshotIds],
          lastModified: new Date(),
        }))
      );

      // Update the state with all results
      setState((prev) => ({
        ...prev,
        results: [...prev.results, ...allResults],
      }));

      toast({
        title: 'Screenshots captured',
        description: `${allResults.length} screenshots have been saved to the selected folder.`,
      });
    } catch (error) {
      console.error('Failed to capture screenshots:', error);
      toast({
        title: 'Capture failed',
        description: 'Failed to capture screenshots. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBatchUrlSubmit = async (urls: string[]) => {
    if (!selectedFolder) {
      toast({
        title: 'No folder selected',
        description: 'Please select or create a folder first to save your screenshots.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let allResults: Screenshot[] = [];

      for (const viewport of selectedViewports) {
        const viewportConfig = viewportOptions.find((v) => v.id === viewport) || viewportOptions[0];

        const results = await captureBatch(
          urls,
          {
            width: viewportConfig.width,
            height: viewportConfig.height,
            deviceScaleFactor: viewportConfig.deviceScaleFactor,
            isMobile: viewportConfig.isMobile,
          },
          settings
        );

        // Add IDs to screenshots if they don't have them
        const screenshotsWithIds = results.map((screenshot) => ({
          ...screenshot,
          id: screenshot.id || crypto.randomUUID(),
        }));

        allResults = [...allResults, ...screenshotsWithIds];
      }

      // Add screenshots to the selected folder
      const screenshotIds = allResults.map((s) => s.id);
      setFolders(
        updateFolderTree(folders, selectedFolder, (folder) => ({
          ...folder,
          screenshotIds: [...folder.screenshotIds, ...screenshotIds],
          lastModified: new Date(),
        }))
      );

      // Update the state with all results
      setState((prev) => ({
        ...prev,
        results: [...prev.results, ...allResults],
      }));

      toast({
        title: 'Screenshots captured',
        description: `${allResults.length} screenshots have been saved to the selected folder.`,
      });
    } catch (error) {
      console.error('Failed to capture batch screenshots:', error);
      toast({
        title: 'Capture failed',
        description: 'Failed to capture screenshots. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMoveScreenshotsToFolder = (screenshotIds: string[], targetFolderId: string) => {
    // Remove screenshots from their current folders
    const updatedFolders = folders.map((folder) => ({
      ...folder,
      screenshotIds: folder.screenshotIds.filter((id) => !screenshotIds.includes(id)),
    }));

    // Add screenshots to the target folder
    setFolders(
      updateFolderTree(updatedFolders, targetFolderId, (folder) => ({
        ...folder,
        screenshotIds: [...folder.screenshotIds, ...screenshotIds],
        lastModified: new Date(),
      }))
    );
  };

  const getScreenshotsForFolder = (folderId: string): Screenshot[] => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return [];

    return results.filter((screenshot) => folder.screenshotIds.includes(screenshot.id));
  };

  const handleUpdateFolder = (id: string, updates: Partial<ProjectFolder>) => {
    setFolders(
      updateFolderTree(folders, id, (folder) => ({
        ...folder,
        ...updates,
      }))
    );
  };

  const featureCards = [
    {
      icon: Folder,
      title: 'Smart Organization',
      description:
        'Create folders with custom colors and descriptions. Drag and drop to organize your screenshots.',
      shortcut: '⌘ + ⇧ + N',
    },
    {
      icon: Monitor,
      title: 'Multi-Device Capture',
      description:
        'Capture screenshots in multiple device sizes simultaneously. Desktop, tablet, and mobile support.',
      shortcut: '⌘ + ⇧ + D',
    },
    {
      icon: Layers,
      title: 'Batch Processing',
      description:
        'Process multiple URLs at once. Perfect for capturing entire websites or multiple pages.',
      shortcut: '⌘ + ⇧ + B',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description:
        'Share screenshots instantly or export them in various formats. One-click copying to clipboard.',
      shortcut: '⌘ + ⇧ + S',
    },
    {
      icon: Search,
      title: 'Smart Search',
      description:
        'Search through your screenshots by URL, date, or folder. Filter and sort with ease.',
      shortcut: '⌘ + ⇧ + F',
    },
    {
      icon: Settings,
      title: 'Advanced Controls',
      description:
        'Customize capture settings, delay timers, and handle cookie banners automatically.',
      shortcut: '⌘ + ⇧ + ,',
    },
  ];

  const headerContent = (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => setShowShortcuts(true)}
            >
              <Command className="w-4 h-4 mr-2" />
              Shortcuts
              <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘ K
              </kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View keyboard shortcuts (⌘ K)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SettingsDialog settings={settings} onSettingsChange={setSettings} />
    </div>
  );

  const shortcutsDialog = (
    <ShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} shortcuts={shortcuts} />
  );

  if (showApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 animate-fadeIn">
        <header className="border-b border-white/10 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowApp(false)}>
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-6 h-6" />
                <span className="font-semibold">Screenshot Generator</span>
              </div>
            </div>
            {headerContent}
          </div>
        </header>

        <div className="container fixed top-16 left-0 right-0 z-40 py-2 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowTutorial(true)}
              >
                <HelpCircle className="w-4 h-4" />
                Quick Start Guide
              </Button>
              <div className="h-4 w-px bg-border" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedViewports(['desktop', 'tablet', 'mobile'])}
                    >
                      <Monitor className="w-4 h-4" />
                      <span className="ml-2 hidden sm:inline">All Devices</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Capture all device sizes (⌘ + ⇧ + D)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const batchTab =
                          document.querySelector<HTMLButtonElement>('button[value="batch"]');
                        if (batchTab) batchTab.click();
                      }}
                    >
                      <Layers className="w-4 h-4" />
                      <span className="ml-2 hidden sm:inline">Batch Mode</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Switch to batch mode (⌘ + ⇧ + B)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">
                {selectedFolder
                  ? `Selected Folder: ${folders.find((f) => f.id === selectedFolder)?.name}`
                  : 'No folder selected'}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(
                    'input[placeholder="New folder name"]'
                  );
                  if (input) {
                    input.focus();
                    if (!input.value.trim()) {
                      handleCreateFolder('New Folder');
                    }
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                New Folder
              </Button>
            </div>
          </div>
        </div>

        <main className="container pt-40 pb-12">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <Card className="h-fit animate-slideRight">
                <CardContent className="p-4">
                  <ProjectFolders
                    folders={folders}
                    onCreateFolder={handleCreateFolder}
                    onSelectFolder={setSelectedFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                    onMoveFolder={handleMoveFolder}
                    onUpdateFolder={handleUpdateFolder}
                    selectedFolder={selectedFolder}
                  />
                </CardContent>
              </Card>

              {/* Mini Tutorial */}
              <Card className="h-fit animate-slideRight border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Command className="w-4 h-4" />
                      Quick Shortcuts
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Show All Shortcuts</span>
                        <kbd className="px-2 py-0.5 rounded bg-muted text-xs">⌘ + K</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">New Folder</span>
                        <kbd className="px-2 py-0.5 rounded bg-muted text-xs">⌘ + ⇧ + N</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Search Folders</span>
                        <kbd className="px-2 py-0.5 rounded bg-muted text-xs">⌘ + ⇧ + F</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Start Capture</span>
                        <kbd className="px-2 py-0.5 rounded bg-muted text-xs">⌘ + Enter</kbd>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Batch Mode</span>
                        <kbd className="px-2 py-0.5 rounded bg-muted text-xs">⌘ + ⇧ + B</kbd>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              {/* Welcome Message */}
              {folders.length === 0 && (
                <Card className="animate-slideDown">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold">Welcome to Screenshot Generator</h2>
                        <p className="text-sm text-muted-foreground">
                          Let's get you started with your first screenshot. Follow these steps:
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              1
                            </div>
                            <span>Create a folder</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              2
                            </div>
                            <span>Enter URL</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              3
                            </div>
                            <span>Choose devices</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* URL Input and Device Selection */}
              <Card className="animate-slideLeft">
                <CardContent className="p-6 space-y-6">
                  {!selectedFolder ? (
                    <div className="text-center p-6 border-2 border-dashed rounded-lg space-y-3">
                      <Folder className="w-8 h-8 mx-auto text-muted-foreground" />
                      <div className="max-w-sm mx-auto space-y-2">
                        <h3 className="font-medium">Get Started</h3>
                        <p className="text-sm text-muted-foreground">
                          Create or select a folder to start capturing screenshots. You can:
                        </p>
                        <ul className="text-sm text-muted-foreground text-left list-disc list-inside space-y-1">
                          <li>Organize screenshots in folders</li>
                          <li>Capture in multiple device sizes</li>
                          <li>Add descriptions and colors</li>
                          <li>Search and filter your captures</li>
                          <li>Drag and drop to rearrange</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        <SizeGuide />
                        <div className="pt-4 border-t">
                          <label className="text-sm font-medium">Custom Size</label>
                          <CustomViewport onAdd={handleCustomViewportAdd} />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Screenshot Gallery */}
              <ScreenshotGallery
                screenshots={selectedFolder ? getScreenshotsForFolder(selectedFolder) : []}
                onMoveToFolder={handleMoveScreenshotsToFolder}
                folders={folders}
              />
            </div>
          </div>
        </main>

        <ScreenshotProgressDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          status={status}
          progress={progress}
          currentUrl={currentUrl}
          completed={completed}
          total={total}
          error={error}
          onCancel={reset}
        />
        {shortcutsDialog}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b border-white/10 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-6 h-6" />
            <span className="font-semibold">Screenshot Generator</span>
          </div>
          {headerContent}
        </div>
      </header>

      <div className="container fixed top-16 left-0 right-0 z-40 py-2 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowTutorial(true)}
            >
              <HelpCircle className="w-4 h-4" />
              Quick Start Guide
            </Button>
            <div className="h-4 w-px bg-border" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedViewports(['desktop', 'tablet', 'mobile'])}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">All Devices</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Capture all device sizes (⌘ + ⇧ + D)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const batchTab =
                        document.querySelector<HTMLButtonElement>('button[value="batch"]');
                      if (batchTab) batchTab.click();
                    }}
                  >
                    <Layers className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Batch Mode</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch to batch mode (⌘ + ⇧ + B)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">
              {selectedFolder
                ? `Selected Folder: ${folders.find((f) => f.id === selectedFolder)?.name}`
                : 'No folder selected'}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>(
                  'input[placeholder="New folder name"]'
                );
                if (input) {
                  input.focus();
                  if (!input.value.trim()) {
                    handleCreateFolder('New Folder');
                  }
                }
              }}
            >
              <Plus className="w-4 h-4" />
              New Folder
            </Button>
          </div>
        </div>
      </div>

      <main className="container pt-32 pb-12">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-32">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              New
            </span>
            <span className="text-sm text-muted-foreground">
              Now with batch processing and custom viewports
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Website Screenshot Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Capture, organize, and manage website screenshots with powerful features. Perfect for
            designers, developers, and content creators.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2" onClick={() => setShowApp(true)}>
              <Zap className="w-4 h-4" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => setShowTutorial(true)}
            >
              <Keyboard className="w-4 h-4" />
              View Tutorial
            </Button>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-16">
          {featureCards.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-3 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <kbd className="hidden group-hover:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {feature.shortcut}
                </kbd>
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Layout className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Quick Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                <p className="text-sm text-muted-foreground">Use delay timer for dynamic content</p>
              </div>
              <div className="flex items-start gap-2">
                <Command className="w-4 h-4 text-muted-foreground mt-1" />
                <p className="text-sm text-muted-foreground">Press ⌘ + K to open quick actions</p>
              </div>
              <div className="flex items-start gap-2">
                <Search className="w-4 h-4 text-muted-foreground mt-1" />
                <p className="text-sm text-muted-foreground">Search folders as you type</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Welcome to Screenshot Generator</h2>
              <p className="text-muted-foreground">Let's get you started with the basics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Create a Folder</h3>
                <p className="text-sm text-muted-foreground">
                  Start by creating a folder to organize your screenshots
                </p>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘ + ⇧ + N
                </kbd>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">2. Enter URLs</h3>
                <p className="text-sm text-muted-foreground">
                  Add single or multiple URLs to capture
                </p>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘ + U
                </kbd>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">3. Choose Devices</h3>
                <p className="text-sm text-muted-foreground">
                  Select which device sizes to capture
                </p>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘ + D
                </kbd>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">4. Capture</h3>
                <p className="text-sm text-muted-foreground">Start the capture process</p>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘ + Enter
                </kbd>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full" onClick={() => setShowTutorial(false)}>
                Got it, let's start
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {shortcutsDialog}
    </div>
  );
}
