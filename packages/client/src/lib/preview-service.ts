interface PreviewOptions {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
}

const PREVIEW_CACHE = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function generatePreview(url: string, options: PreviewOptions): Promise<string> {
  const cacheKey = `${url}-${options.width}-${options.height}`;
  const cached = PREVIEW_CACHE.get(cacheKey);

  // Return cached preview if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  const params = new URLSearchParams({
    url: url,
    viewport_width: options.width.toString(),
    viewport_height: options.height.toString(),
    device_scale_factor: (options.deviceScaleFactor || 1).toString(),
    format: 'png',
    cache_ttl: '300', // Cache for 5 minutes
    delay: '1000', // Wait 1 second for dynamic content
    block_ads: 'true',
    block_cookie_banners: 'true',
    block_trackers: 'true',
    hide_cookie_banners: 'true',
    hide_popups: 'true',
  });

  // Use screenshotone.com for preview generation
  const apiUrl = `https://api.screenshotone.com/take?${params.toString()}&access_key=YOUR_API_KEY`;

  try {
    // Just validate the URL exists without actually fetching the image
    const response = await fetch(apiUrl, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error('Failed to generate preview');
    }

    // Cache the successful result
    PREVIEW_CACHE.set(cacheKey, {
      url: apiUrl,
      timestamp: Date.now(),
    });

    return apiUrl;
  } catch (error) {
    console.error('Preview generation failed:', error);
    throw error;
  }
}

export async function validateUrl(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }

    // Optional: Add additional validation like checking if the domain is reachable
    const response = await fetch(urlObj.origin, {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
}
