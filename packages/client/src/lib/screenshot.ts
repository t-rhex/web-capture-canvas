const API_BASE_URL = 'http://localhost:5001/api/screenshots';

export interface Viewport {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
}

export interface CaptureSettings {
  delay: number;
  fullPage: boolean;
  hideAds: boolean;
  hideCookieBanners: boolean;
  // Advanced capture options
  selector?: string; // CSS selector for capturing specific elements
  waitForSelector?: string; // Wait for a specific element to be present
  scrollToElement?: boolean; // Whether to scroll to the element before capture
  hoverSelector?: string; // Selector for element to hover before capture
  authentication?: {
    username?: string;
    password?: string;
    loginUrl?: string;
    loginSelector?: string; // Selector for login button/form
  };
  // Interaction options
  beforeCapture?: {
    click?: string[]; // Selectors to click before capture
    hover?: string[]; // Selectors to hover over before capture
    wait?: number; // Additional wait time after interactions
  };
}

export interface Screenshot {
  id: string;
  imageData: string;
  timestamp: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface ProgressCallback {
  onProgress: (progress: {
    status: 'starting' | 'processing' | 'completed' | 'error';
    progress: number;
    currentUrl?: string;
    completed?: number;
    total?: number;
    result?: Screenshot;
    results?: Screenshot[];
    error?: string;
  }) => void;
}

export const captureScreenshot = async (
  url: string,
  viewport: Viewport,
  settings: CaptureSettings,
  { onProgress }: ProgressCallback
): Promise<Screenshot> => {
  return new Promise((resolve, reject) => {
    // First, send the POST request to initiate the capture
    fetch(`${API_BASE_URL}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        viewport,
        ...settings,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to initiate screenshot capture');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Capture initiated:', data);
        if (!data || typeof data.captureId !== 'string') {
          throw new Error('Invalid response: No capture ID received from server');
        }

        // After successful POST, create EventSource for progress updates
        const eventSource = new EventSource(`${API_BASE_URL}/progress/${data.captureId}`);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onProgress(data);

            if (data.status === 'completed' && data.result) {
              eventSource.close();
              resolve(data.result);
            } else if (data.status === 'error') {
              eventSource.close();
              reject(new Error(data.error || 'Screenshot capture failed'));
            }
          } catch (error) {
            eventSource.close();
            reject(new Error('Failed to process progress update'));
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          eventSource.close();
          reject(new Error('Failed to connect to screenshot service'));
        };
      })
      .catch((error) => {
        console.error('Screenshot capture error:', error);
        reject(error);
      });
  });
};

export const captureBatchScreenshots = async (
  urls: string[],
  viewport: Viewport,
  settings: CaptureSettings,
  { onProgress }: ProgressCallback
): Promise<Screenshot[]> => {
  return new Promise((resolve, reject) => {
    // First, send the POST request to initiate the batch capture
    fetch(`${API_BASE_URL}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls,
        viewport,
        settings,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.batchId) {
          throw new Error('No batch ID received from server');
        }

        // After successful POST, create EventSource for progress updates
        const eventSource = new EventSource(`${API_BASE_URL}/progress/batch/${data.batchId}`);

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          onProgress(data);

          if (data.status === 'completed' && Array.isArray(data.results)) {
            eventSource.close();
            resolve(data.results);
          } else if (data.status === 'error') {
            eventSource.close();
            reject(new Error(data.error));
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          reject(new Error('Failed to connect to screenshot service'));
        };
      })
      .catch((error) => {
        reject(error);
      });
  });
};
