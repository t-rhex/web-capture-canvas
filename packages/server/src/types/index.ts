export interface ScreenshotOptions {
  url: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
  };
  fullPage?: boolean;
  delay?: number;
  hideAds?: boolean;
  hideCookieBanners?: boolean;
}

export interface ScreenshotResult {
  imageData: string;
  timestamp: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
} 