import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Folder,
  Plus,
  Search,
  Clock,
  Info,
  ArrowUpDown,
  GripVertical,
  Palette,
  MoreHorizontal,
  Edit2,
  Trash,
  Grid,
  List,
  Calendar,
  Hash,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectFolder {
  id: string;
  name: string;
  createdAt: Date;
  description?: string;
  color?: string;
  parentId?: string;
  lastModified: Date;
  children?: ProjectFolder[];
  screenshotIds: string[];
}

interface ProjectFoldersProps {
  folders: ProjectFolder[];
  onCreateFolder: (name: string, parentId?: string) => void;
  onSelectFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveFolder: (id: string, newParentId: string) => void;
  onUpdateFolder: (id: string, updates: Partial<ProjectFolder>) => void;
  selectedFolder?: string;
}

const FOLDER_COLORS = [
  { name: 'Default', value: undefined },
  { name: 'Red', value: 'red-500' },
  { name: 'Green', value: 'green-500' },
  { name: 'Blue', value: 'blue-500' },
  { name: 'Yellow', value: 'yellow-500' },
  { name: 'Purple', value: 'purple-500' },
  { name: 'Pink', value: 'pink-500' },
  { name: 'Orange', value: 'orange-500' },
];

interface FolderMetadataDialogProps {
  folder: ProjectFolder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<ProjectFolder>) => void;
}

function FolderMetadataDialog({ folder, open, onOpenChange, onUpdate }: FolderMetadataDialogProps) {
  const [description, setDescription] = useState(folder.description || '');
  const [color, setColor] = useState(folder.color);

  const handleSave = () => {
    onUpdate({
      description: description || undefined,
      color: color,
      lastModified: new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Folder Details</DialogTitle>
          <DialogDescription>Information about {folder.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Created</Label>
            <p className="text-sm text-muted-foreground">
              {folder.createdAt.toLocaleDateString()} {folder.createdAt.toLocaleTimeString()}
            </p>
          </div>
          <div>
            <Label>Last Modified</Label>
            <p className="text-sm text-muted-foreground">
              {folder.lastModified.toLocaleDateString()} {folder.lastModified.toLocaleTimeString()}
            </p>
          </div>
          <div>
            <Label>Screenshots</Label>
            <p className="text-sm text-muted-foreground">{folder.screenshotIds.length} items</p>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((folderColor) => (
                <Button
                  key={folderColor.name}
                  variant={color === folderColor.value ? 'default' : 'outline'}
                  className={cn(
                    'h-8 w-full truncate px-2',
                    folderColor.value &&
                      `hover:text-${folderColor.value} hover:border-${folderColor.value}`
                  )}
                  onClick={() => setColor(folderColor.value)}
                >
                  <div className="flex items-center space-x-2">
                    {folderColor.value && (
                      <div className={cn('w-3 h-3 rounded-full', `bg-${folderColor.value}`)} />
                    )}
                    <span className="truncate">{folderColor.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectFolders({
  folders,
  onCreateFolder,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  onUpdateFolder,
  selectedFolder,
}: ProjectFoldersProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'modified'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFolderForMetadata, setSelectedFolderForMetadata] = useState<ProjectFolder | null>(
    null
  );
  const [draggedFolder, setDraggedFolder] = useState<ProjectFolder | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const folder = folders.find((f) => f.id === event.active.id);
    if (folder) {
      setDraggedFolder(folder);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onMoveFolder(active.id as string, over.id as string);
    }
    setDraggedFolder(null);
  };

  const filteredFolders = useMemo(() => {
    let result = folders;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (folder) =>
          folder.name.toLowerCase().includes(query) ||
          folder.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'name':
          return order * a.name.localeCompare(b.name);
        case 'date':
          return order * (a.createdAt.getTime() - b.createdAt.getTime());
        case 'modified':
          return order * (a.lastModified.getTime() - b.lastModified.getTime());
        case 'size':
          return order * (a.screenshotIds.length - b.screenshotIds.length);
        default:
          return 0;
      }
    });

    return result;
  }, [folders, searchQuery, sortBy, sortOrder]);

  const handleSubmit = (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName, parentId);
      setNewFolderName('');
    }
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      onRenameFolder(id, editingName);
      setEditingFolderId(null);
      setEditingName('');
    }
  };

  const renderFolder = (folder: ProjectFolder, level: number = 0) => {
    const isEditing = editingFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id} className="space-y-1" style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRename(folder.id);
              }}
              className="flex-1 flex gap-2"
            >
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                autoFocus
              />
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingFolderId(null)}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex items-center w-full">
              <Button
                variant={selectedFolder === folder.id ? 'default' : 'outline'}
                className={cn(
                  'w-full justify-start group relative h-9',
                  folder.color && `border-${folder.color} hover:border-${folder.color}`
                )}
                onClick={() => onSelectFolder(folder.id)}
              >
                <GripVertical className="w-4 h-4 absolute left-2 opacity-0 group-hover:opacity-50 cursor-move" />
                <Folder
                  className={cn('w-4 h-4 ml-6 mr-2', folder.color && `text-${folder.color}`)}
                />
                <span className="flex-1 truncate text-sm">{folder.name}</span>
                <div className="flex items-center gap-1.5">
                  {folder.description && (
                    <Badge variant="outline" className="h-5 px-1.5">
                      <Info className="w-3 h-3" />
                    </Badge>
                  )}
                  {folder.screenshotIds.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {folder.screenshotIds.length}
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFolderForMetadata(folder);
                        }}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Color & Info
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolderId(folder.id);
                          setEditingName(folder.name);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Button>
            </div>
          )}
        </div>
        {hasChildren && (
          <div className="pl-4">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {folders.length === 0 ? (
          <div className="text-center p-4 space-y-4 border-2 border-dashed rounded-lg">
            <div className="text-muted-foreground">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Create a folder to organize your screenshots</p>
            </div>
            <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
              <Input
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
                <Input
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
              {!selectedFolder && (
                <div className="text-xs text-muted-foreground px-2">
                  Select a folder to save your screenshots
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    <Hash className="w-4 h-4 mr-2" />
                    Name {sortBy === 'name' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Creation Date {sortBy === 'date' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('modified')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Last Modified {sortBy === 'modified' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>
                    <Hash className="w-4 h-4 mr-2" />
                    Screenshot Count {sortBy === 'size' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </Button>
            </div>

            <div className="relative">
              <SortableContext
                items={filteredFolders.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={cn(
                    'space-y-2',
                    viewMode === 'grid' && 'grid grid-cols-2 gap-2 space-y-0'
                  )}
                >
                  {filteredFolders.map((folder) => (
                    <div key={folder.id} className="relative group">
                      {selectedFolder === folder.id && (
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full" />
                      )}
                      {viewMode === 'list' ? (
                        renderFolder(folder)
                      ) : (
                        <Button
                          variant={selectedFolder === folder.id ? 'default' : 'outline'}
                          className={cn(
                            'w-full h-auto aspect-square flex-col justify-center items-center gap-2 p-4',
                            folder.color && `border-${folder.color} hover:border-${folder.color}`
                          )}
                          onClick={() => onSelectFolder(folder.id)}
                        >
                          <Folder
                            className={cn('w-8 h-8', folder.color && `text-${folder.color}`)}
                          />
                          <span className="text-sm font-medium truncate">{folder.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            {folder.description && (
                              <Badge variant="outline" className="h-5 px-1.5">
                                <Info className="w-3 h-3" />
                              </Badge>
                            )}
                            {folder.screenshotIds.length > 0 && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {folder.screenshotIds.length}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>

              {filteredFolders.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  No folders match your search
                </div>
              )}
            </div>
          </>
        )}

        <DragOverlay>
          {draggedFolder && (
            <div className="bg-background border rounded-lg p-2 shadow-lg">
              <Folder className="w-4 h-4 mr-2 inline-block" />
              {draggedFolder.name}
            </div>
          )}
        </DragOverlay>
      </div>

      {selectedFolderForMetadata && (
        <FolderMetadataDialog
          folder={selectedFolderForMetadata}
          open={!!selectedFolderForMetadata}
          onOpenChange={(open) => !open && setSelectedFolderForMetadata(null)}
          onUpdate={(updates) => {
            onUpdateFolder(selectedFolderForMetadata.id, updates);
            setSelectedFolderForMetadata(null);
          }}
        />
      )}
    </DndContext>
  );
}
