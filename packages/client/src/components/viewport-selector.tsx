import { ViewportPreview } from '@/components/viewport-preview';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

interface ViewportSelectorProps {
  selected: Viewport[];
  onSelect: (viewport: Viewport) => void;
}

const viewportOptions = [
  {
    id: 'desktop' as const,
    width: 1920,
    height: 1080,
  },
  {
    id: 'tablet' as const,
    width: 768,
    height: 1024,
  },
  {
    id: 'mobile' as const,
    width: 375,
    height: 667,
  },
];

export function ViewportSelector({ selected, onSelect }: ViewportSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {viewportOptions.map((viewport) => (
        <ViewportPreview
          key={viewport.id}
          type={viewport.id}
          width={viewport.width}
          height={viewport.height}
          isSelected={selected.includes(viewport.id)}
          onClick={() => onSelect(viewport.id)}
        />
      ))}
    </div>
  );
}
