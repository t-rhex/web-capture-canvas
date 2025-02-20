import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewportPreviewProps {
  width: number;
  height: number;
  type: 'desktop' | 'tablet' | 'mobile';
  isSelected?: boolean;
  onClick?: () => void;
}

export function ViewportPreview({
  width,
  height,
  type,
  isSelected,
  onClick,
}: ViewportPreviewProps) {
  const Icon = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  }[type];

  const scale = type === 'desktop' ? 0.15 : type === 'tablet' ? 0.2 : 0.25;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <div
      className={cn(
        'relative group cursor-pointer p-4 rounded-lg border bg-card transition-all duration-200',
        isSelected && 'border-primary ring-2 ring-primary ring-offset-2',
        !isSelected && 'hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center space-y-2">
        <div
          className="relative border border-border rounded-lg overflow-hidden bg-muted"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <Icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground opacity-25" />
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
          <div className="text-xs text-muted-foreground">
            {width} × {height}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/10" />
    </div>
  );
}
