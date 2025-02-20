export interface Viewport {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
}

export interface ScreenshotOptions {
  url: string;
  viewport: Viewport;
  delay?: number;
  fullPage?: boolean;
  hideAds?: boolean;
  hideCookieBanners?: boolean;
  // Advanced capture options
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
  // Interaction options
  beforeCapture?: {
    click?: string[];
    hover?: string[];
    wait?: number;
  };
}

export interface ScreenshotResult {
  imageData: string;
  timestamp: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  section?: number;
  totalSections?: number;
}

export interface BatchScreenshotOptions extends Omit<ScreenshotOptions, 'url'> {
  urls: string[];
}
