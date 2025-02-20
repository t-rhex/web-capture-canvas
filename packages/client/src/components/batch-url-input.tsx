
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BatchUrlInputProps {
  onSubmit: (urls: string[]) => void;
}

export function BatchUrlInput({ onSubmit }: BatchUrlInputProps) {
  const [urls, setUrls] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (!urlList.length) {
      toast({
        title: "Please enter at least one URL",
        variant: "destructive",
      });
      return;
    }

    const invalidUrls = urlList.filter((url) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length) {
      toast({
        title: "Invalid URLs detected",
        description: `Please check: ${invalidUrls.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    onSubmit(urlList);
    setUrls("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder="Enter multiple URLs (one per line)"
        className="min-h-[100px] bg-background/50 border-white/10"
      />
      <Button type="submit" className="w-full">Process Batch</Button>
    </form>
  );
}
