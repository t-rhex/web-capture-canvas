import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Save,
  Star,
  Plus,
  History,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePreview, validateUrl } from '@/lib/preview-service';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UrlPreviewProps {
  url: string;
  onUrlChange?: (url: string) => void;
}

interface UrlTemplate {
  id: string;
  name: string;
  url: string;
  variables: { name: string; description: string }[];
}

const defaultTemplates: UrlTemplate[] = [
  {
    id: 'product',
    name: 'Product Page',
    url: 'https://example.com/products/{productId}',
    variables: [{ name: 'productId', description: 'The ID of the product' }],
  },
  {
    id: 'blog',
    name: 'Blog Post',
    url: 'https://example.com/blog/{slug}',
    variables: [{ name: 'slug', description: 'The URL slug of the blog post' }],
  },
];

export function UrlPreview({ url, onUrlChange }: UrlPreviewProps) {
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [templates, setTemplates] = useState<UrlTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<UrlTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedUrl = useDebounce(url, 500);

  const handleSaveToRecent = () => {
    if (url && !recentUrls.includes(url)) {
      setRecentUrls([url, ...recentUrls.slice(0, 9)]);
    }
  };

  const handleSaveTemplate = () => {
    if (!url) return;

    const newTemplate: UrlTemplate = {
      id: crypto.randomUUID(),
      name: 'Custom Template',
      url,
      variables: [],
    };

    setTemplates([newTemplate, ...templates]);
  };

  const handleSelectTemplate = (template: UrlTemplate) => {
    setSelectedTemplate(template);
    setTemplateVariables({});
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    let finalUrl = selectedTemplate.url;
    for (const variable of selectedTemplate.variables) {
      finalUrl = finalUrl.replace(
        `{${variable.name}}`,
        templateVariables[variable.name] || `{${variable.name}}`
      );
    }

    onUrlChange?.(finalUrl);
    handleSaveToRecent();
  };

  useEffect(() => {
    if (!debouncedUrl) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const generateUrlPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!(await validateUrl(debouncedUrl))) {
          setError('Please enter a valid URL');
          return;
        }

        const preview = await generatePreview(debouncedUrl, {
          width: 1280,
          height: 800,
          deviceScaleFactor: window.devicePixelRatio || 1,
        });

        setPreviewUrl(preview);
      } catch (err) {
        console.error('Preview generation failed:', err);
        setError('Failed to generate preview. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generateUrlPreview();
  }, [debouncedUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>URL Templates</DropdownMenuLabel>
            {templates.map((template) => (
              <DropdownMenuItem key={template.id} onClick={() => handleSelectTemplate(template)}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {template.name}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSaveTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Save Current URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              Recent
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Recent URLs</DropdownMenuLabel>
            {recentUrls.map((recentUrl, index) => (
              <DropdownMenuItem key={index} onClick={() => onUrlChange?.(recentUrl)}>
                <div className="flex items-center gap-2 truncate">
                  <History className="w-4 h-4 shrink-0" />
                  <span className="truncate">{recentUrl}</span>
                </div>
              </DropdownMenuItem>
            ))}
            {recentUrls.length === 0 && (
              <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                No recent URLs
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={handleSaveToRecent}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {selectedTemplate && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <h4 className="font-medium">{selectedTemplate.name}</h4>
            </div>
            <Badge variant="secondary">{selectedTemplate.variables.length} variables</Badge>
          </div>

          {selectedTemplate.variables.map((variable) => (
            <div key={variable.name} className="space-y-2">
              <label className="text-sm font-medium">{variable.name}</label>
              <Input
                placeholder={variable.description}
                value={templateVariables[variable.name] || ''}
                onChange={(e) =>
                  setTemplateVariables({
                    ...templateVariables,
                    [variable.name]: e.target.value,
                  })
                }
              />
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate}>
              Apply Template
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden bg-card/50">
        <CardContent className="p-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none z-10" />

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !previewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                <Eye className="w-6 h-6 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="URL Preview"
                className={cn(
                  'w-full h-full object-cover transition-all duration-300',
                  loading && 'opacity-50'
                )}
                onError={() => setError('Failed to load preview image')}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
