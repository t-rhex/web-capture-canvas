
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Monitor, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Viewport } from "./viewport-selector";

interface CustomViewportProps {
  onAdd: (name: string, width: number, height: number) => void;
}

export function CustomViewport({ onAdd }: CustomViewportProps) {
  const [name, setName] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && width && height) {
      onAdd(name, Number(width), Number(height));
      setName("");
      setWidth("");
      setHeight("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Name</Label>
          <Input
            placeholder="e.g., iPad Pro"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label>Width (px)</Label>
          <Input
            type="number"
            placeholder="Width"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </div>
        <div>
          <Label>Height (px)</Label>
          <Input
            type="number"
            placeholder="Height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Custom Size
      </Button>
    </form>
  );
}
