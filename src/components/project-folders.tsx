
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Plus } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface ProjectFolder {
  id: string;
  name: string;
  createdAt: Date;
}

interface ProjectFoldersProps {
  folders: ProjectFolder[];
  onCreateFolder: (name: string) => void;
  onSelectFolder: (id: string) => void;
  selectedFolder?: string;
}

export function ProjectFolders({
  folders,
  onCreateFolder,
  onSelectFolder,
  selectedFolder,
}: ProjectFoldersProps) {
  const [newFolderName, setNewFolderName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
      setNewFolderName("");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={selectedFolder === folder.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onSelectFolder(folder.id)}
          >
            <Folder className="w-4 h-4 mr-2" />
            {folder.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
