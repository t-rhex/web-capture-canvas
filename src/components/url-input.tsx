
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "lucide-react";

export function UrlInput({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
      onSubmit(url);
    } catch {
      toast({
        title: "Please enter a valid URL",
        description: "Example: https://example.com",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Link size={20} />
          </div>
          <Input
            type="url"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-12 transition-all duration-200 border-2 hover:border-primary/50 focus:border-primary"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-8">
          Capture
        </Button>
      </div>
    </form>
  );
}
