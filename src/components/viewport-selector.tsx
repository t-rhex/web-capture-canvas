
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export type Viewport = "desktop" | "tablet" | "mobile";

interface ViewportOption {
  id: Viewport;
  label: string;
  icon: typeof Monitor | typeof Tablet | typeof Smartphone;
  width: number;
  height: number;
}

const viewportOptions: ViewportOption[] = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1920, height: 1080 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768, height: 1024 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 375, height: 667 },
];

export function ViewportSelector({
  selected,
  onSelect,
}: {
  selected: Viewport[];
  onSelect: (viewport: Viewport) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {viewportOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selected.includes(option.id);
        return (
          <Button
            key={option.id}
            variant={isSelected ? "default" : "outline"}
            className="flex items-center space-x-2 transition-all duration-200"
            onClick={() => onSelect(option.id)}
          >
            <Icon className="w-5 h-5" />
            <span>{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
