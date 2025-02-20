import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Minus, ArrowRight, Eye } from 'lucide-react';
import { UrlPreview } from '@/components/url-preview';
import { generatePreview, validateUrl } from '@/lib/preview-service';
import { useDebounce } from '@/hooks/use-debounce';

interface UrlInputProps {
  onSubmit: (baseUrl: string, additionalUrls: string[]) => void;
  onPreviewChange?: (url: string) => void;
}

export function UrlInput({ onSubmit, onPreviewChange }: UrlInputProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [additionalUrls, setAdditionalUrls] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const debouncedUrl = useDebounce(baseUrl, 500);

  useEffect(() => {
    if (!debouncedUrl) {
      onPreviewChange?.('');
      return;
    }

    const generateUrlPreview = async () => {
      try {
        if (!(await validateUrl(debouncedUrl))) {
          return;
        }

        setIsGeneratingPreview(true);
        const previewUrl = await generatePreview(debouncedUrl, {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        });
        onPreviewChange?.(debouncedUrl);
      } catch (error) {
        console.error('Preview generation failed:', error);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    generateUrlPreview();
  }, [debouncedUrl, onPreviewChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate and clean base URL
      const urlObj = new URL(baseUrl);
      const cleanBaseUrl = urlObj.origin + urlObj.pathname.replace(/\/$/, '');

      // Process additional URLs
      const additionalPaths = additionalUrls
        .map((url) => url.trim())
        .filter((url) => url)
        .map((url) => {
          try {
            return new URL(url).href;
          } catch {
            return url.startsWith('/') ? url : `/${url}`;
          }
        });

      // Generate full URLs for additional paths
      const additionalFullUrls = additionalPaths.map((path) => {
        if (path.startsWith('http')) {
          return path;
        }
        return `${urlObj.origin}${path}`;
      });

      // Only include additional URLs if they're different from the base URL
      const uniqueUrls = [cleanBaseUrl, ...additionalFullUrls].filter(
        (url, index, self) => self.indexOf(url) === index
      );

      onSubmit(cleanBaseUrl, uniqueUrls.slice(1));
    } catch (error) {
      console.error('URL parsing error:', error);
      setError('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  const handleAddUrl = () => {
    setAdditionalUrls([...additionalUrls, '']);
  };

  const handleRemoveUrl = (index: number) => {
    setAdditionalUrls(additionalUrls.filter((_, i) => i !== index));
  };

  const handleUrlChange = useCallback((url: string) => {
    setBaseUrl(url);
  }, []);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter website URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="shrink-0">
              Capture
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <UrlPreview url={baseUrl} onUrlChange={handleUrlChange} />

          {additionalUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Additional URL (optional)"
                value={url}
                onChange={(e) => {
                  const newUrls = [...additionalUrls];
                  newUrls[index] = e.target.value;
                  setAdditionalUrls(newUrls);
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveUrl(index)}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="w-full" onClick={handleAddUrl}>
            <Plus className="w-4 h-4 mr-2" />
            Add URL
          </Button>
          {baseUrl && (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => onPreviewChange?.(baseUrl)}
              disabled={isGeneratingPreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
