import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { ScreenshotOptions as AppScreenshotOptions, ScreenshotResult } from '../types';
import { Response } from 'express';
import type { ScreenshotOptions } from 'puppeteer';

export class ScreenshotService {
  private static instance: ScreenshotService;
  private browser: Browser | null = null;

  private constructor() {}

  static getInstance(): ScreenshotService {
    if (!ScreenshotService.instance) {
      ScreenshotService.instance = new ScreenshotService();
    }
    return ScreenshotService.instance;
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  private emitProgress(res: Response | undefined, data: any) {
    if (res && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  private async extractColors(
    page: Page
  ): Promise<{ primary: string; secondary: string; accent: string }> {
    return await page.evaluate(() => {
      const getComputedStyleValue = (element: Element, property: string) => {
        const style = window.getComputedStyle(element);
        return style.getPropertyValue(property);
      };

      // Get background colors from various elements
      const elements = Array.from(document.querySelectorAll('body, header, main, nav, div'));
      const colors = elements
        .map((el) => {
          const bgColor = getComputedStyleValue(el, 'background-color');
          const color = getComputedStyleValue(el, 'color');
          return [bgColor, color];
        })
        .flat()
        .filter((color) => color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && color !== '');

      // Convert colors to RGB arrays for processing
      const rgbColors = colors
        .map((color) => {
          const match = color.match(/\d+/g);
          return match ? match.map(Number) : null;
        })
        .filter(Boolean) as number[][];

      // Get unique colors
      const uniqueColors = Array.from(new Set(rgbColors.map((rgb) => rgb.join(',')))).map((str) =>
        str.split(',').map(Number)
      );

      // Sort by brightness (luminance)
      const sortedColors = uniqueColors.sort((a, b) => {
        const luminanceA = 0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2];
        const luminanceB = 0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2];
        return luminanceB - luminanceA;
      });

      // Select colors based on position in sorted array
      const primary = sortedColors[0] || [15, 23, 42]; // Default dark blue
      const secondary = sortedColors[Math.floor(sortedColors.length / 2)] || [30, 41, 59]; // Default darker blue
      const accent = sortedColors[sortedColors.length - 1] || [56, 189, 248]; // Default light blue

      return {
        primary: `rgb(${primary.join(',')})`,
        secondary: `rgb(${secondary.join(',')})`,
        accent: `rgb(${accent.join(',')})`,
      };
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async takeScreenshot(
    options: AppScreenshotOptions,
    res?: Response
  ): Promise<ScreenshotResult | ScreenshotResult[]> {
    await this.initBrowser();
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page: Page = await this.browser.newPage();

    try {
      // Starting
      this.emitProgress(res, {
        status: 'processing',
        progress: 10,
        message: `Starting screenshot capture for ${options.url}`,
      });

      // Handle authentication if provided
      if (options.authentication?.loginUrl) {
        this.emitProgress(res, {
          status: 'processing',
          progress: 15,
          message: 'Handling authentication...',
        });

        await page.goto(options.authentication.loginUrl, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });

        if (options.authentication.username && options.authentication.password) {
          // Fill in login form
          await page.evaluate((auth) => {
            // Common selectors for username/email fields
            const usernameSelectors = [
              'input[type="email"]',
              'input[type="text"]',
              'input[name="email"]',
              'input[name="username"]',
              '#email',
              '#username',
            ];
            // Common selectors for password fields
            const passwordSelectors = [
              'input[type="password"]',
              'input[name="password"]',
              '#password',
            ];

            // Find and fill username field
            if (auth.username) {
              for (const selector of usernameSelectors) {
                const usernameField = document.querySelector(selector) as HTMLInputElement | null;
                if (usernameField) {
                  usernameField.value = auth.username;
                  break;
                }
              }
            }

            // Find and fill password field
            if (auth.password) {
              for (const selector of passwordSelectors) {
                const passwordField = document.querySelector(selector) as HTMLInputElement | null;
                if (passwordField) {
                  passwordField.value = auth.password;
                  break;
                }
              }
            }
          }, options.authentication);

          // Click login button or submit form
          if (options.authentication.loginSelector) {
            await page.click(options.authentication.loginSelector);
          } else {
            await page.evaluate(() => {
              const form = document.querySelector('form');
              if (form) {
                form.submit();
              }
            });
          }

          // Wait for navigation
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
      }

      // Set viewport
      this.emitProgress(res, {
        status: 'processing',
        progress: 20,
        message: 'Setting viewport...',
      });

      await page.setViewport({
        width: options.viewport.width,
        height: options.viewport.height,
        deviceScaleFactor: options.viewport.deviceScaleFactor || 1,
        isMobile: options.viewport.isMobile || false,
      });

      // Add blocking rules for ads and cookie banners if requested
      if (options.hideAds || options.hideCookieBanners) {
        this.emitProgress(res, {
          status: 'processing',
          progress: 30,
          message: 'Setting up content blocking...',
        });

        await page.setRequestInterception(true);
        page.on('request', (request) => {
          const url = request.url().toLowerCase();
          const shouldBlock =
            (options.hideAds && (url.includes('ad') || url.includes('analytics'))) ||
            (options.hideCookieBanners && url.includes('cookie'));

          if (shouldBlock) {
            void request.abort();
          } else {
            void request.continue();
          }
        });
      }

      // Navigate to URL
      this.emitProgress(res, {
        status: 'processing',
        progress: 40,
        message: 'Loading page...',
      });

      await page.goto(options.url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Wait for specific element if requested
      if (options.waitForSelector) {
        this.emitProgress(res, {
          status: 'processing',
          progress: 50,
          message: `Waiting for element "${options.waitForSelector}"...`,
        });
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }

      // Handle pre-capture interactions
      if (options.beforeCapture) {
        this.emitProgress(res, {
          status: 'processing',
          progress: 60,
          message: 'Performing interactions...',
        });

        // Handle clicks
        if (options.beforeCapture.click?.length) {
          for (const selector of options.beforeCapture.click) {
            try {
              await page.click(selector);
              // Small delay between clicks
              await this.delay(100);
            } catch (error) {
              console.warn(`Failed to click element "${selector}":`, error);
            }
          }
        }

        // Handle hovers
        if (options.beforeCapture.hover?.length) {
          for (const selector of options.beforeCapture.hover) {
            try {
              await page.hover(selector);
              // Small delay between hovers
              await this.delay(100);
            } catch (error) {
              console.warn(`Failed to hover over element "${selector}":`, error);
            }
          }
        }

        // Wait after interactions if specified
        if (options.beforeCapture.wait) {
          await this.delay(options.beforeCapture.wait);
        }
      }

      // Apply delay if specified
      const delayMs = (options.delay ?? 0) * 1000;
      if (delayMs > 0) {
        this.emitProgress(res, {
          status: 'processing',
          progress: 70,
          message: `Waiting for ${options.delay} seconds...`,
        });

        await this.delay(delayMs);
      }

      // Extract colors from the page
      this.emitProgress(res, {
        status: 'processing',
        progress: 80,
        message: 'Extracting website colors...',
      });

      const colors = await this.extractColors(page);

      // Scroll to element if requested
      if (options.scrollToElement && options.selector) {
        await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, options.selector);
        // Wait for scroll animation
        await this.delay(500);
      }

      // Take screenshot
      this.emitProgress(res, {
        status: 'processing',
        progress: 90,
        message: 'Capturing screenshot...',
      });

      let screenshots: string[] = [];
      if (options.selector) {
        // Capture specific element
        const element = await page.$(options.selector);
        if (!element) {
          throw new Error(`Element not found: ${options.selector}`);
        }
        const elementScreenshotOptions: ScreenshotOptions = {
          encoding: 'base64',
        };
        const shot = await element.screenshot(elementScreenshotOptions);
        screenshots.push(Buffer.isBuffer(shot) ? shot.toString('base64') : shot);
      } else if (options.fullPage) {
        // Get the full height of the page
        const pageHeight = await page.evaluate(() => {
          return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.body.clientHeight,
            document.documentElement.clientHeight
          );
        });

        // Calculate number of screenshots needed
        const viewportHeight = options.viewport.height;
        const numScreenshots = Math.ceil(pageHeight / viewportHeight);

        // Take screenshots for each section
        for (let i = 0; i < numScreenshots; i++) {
          // Scroll to the appropriate position
          await page.evaluate((scrollTo) => {
            window.scrollTo(0, scrollTo);
          }, i * viewportHeight);

          // Wait for any animations or lazy loading
          await this.delay(500);

          // Take the screenshot
          const screenshotOptions: ScreenshotOptions = {
            encoding: 'base64',
            fullPage: false,
            captureBeyondViewport: false,
          };
          const shot = await page.screenshot(screenshotOptions);
          screenshots.push(Buffer.isBuffer(shot) ? shot.toString('base64') : shot);
        }
      } else {
        // Regular viewport screenshot
        const screenshotOptions: ScreenshotOptions = {
          encoding: 'base64',
          fullPage: false,
          captureBeyondViewport: false,
        };
        const shot = await page.screenshot(screenshotOptions);
        screenshots.push(Buffer.isBuffer(shot) ? shot.toString('base64') : shot);
      }

      if (!screenshots.length) {
        throw new Error('Failed to capture screenshot');
      }

      // Create results for each screenshot
      const results: ScreenshotResult[] = screenshots.map((screenshot, index) => ({
        imageData: `data:image/png;base64,${screenshot}`,
        timestamp: new Date().toISOString(),
        url: options.url,
        viewport: {
          width: options.viewport.width,
          height: options.viewport.height,
        },
        colors: colors,
        section: index + 1,
        totalSections: screenshots.length,
      }));

      // If we have multiple screenshots, return them all
      if (results.length > 1) {
        if (res) {
          this.emitProgress(res, {
            status: 'completed',
            progress: 100,
            message: 'Screenshots captured successfully!',
            results: results,
          });
        }
        return results; // Return all results for multiple screenshots
      }

      // Single screenshot case
      const result = results[0];
      if (res) {
        this.emitProgress(res, {
          status: 'completed',
          progress: 100,
          message: 'Screenshot captured successfully!',
          result,
        });
      }

      return result;
    } catch (error) {
      if (res) {
        this.emitProgress(res, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
