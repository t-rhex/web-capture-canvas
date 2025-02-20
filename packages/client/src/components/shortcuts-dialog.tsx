import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Command as CommandIcon } from 'lucide-react';
import { useState } from 'react';
import { formatShortcut } from '@/hooks/use-keyboard-shortcuts';

interface ShortcutItem {
  key: string;
  description: string;
  group: string;
}

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: ShortcutItem[];
}

export function ShortcutsDialog({ open, onOpenChange, shortcuts }: ShortcutsDialogProps) {
  const [search, setSearch] = useState('');

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.description.toLowerCase().includes(search.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(search.toLowerCase())
  );

  const groups = Array.from(new Set(shortcuts.map((s) => s.group)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search shortcuts..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onValueChange={setSearch}
            />
          </div>
          <CommandList>
            <CommandEmpty>No shortcuts found.</CommandEmpty>
            {groups.map((group) => {
              const groupShortcuts = filteredShortcuts.filter((s) => s.group === group);
              if (groupShortcuts.length === 0) return null;

              return (
                <CommandGroup key={group} heading={group}>
                  {groupShortcuts.map((shortcut, index) => (
                    <CommandItem
                      key={index}
                      className="flex items-center justify-between py-3 px-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                          <CommandIcon className="h-4 w-4" />
                        </div>
                        <div className="text-sm">{shortcut.description}</div>
                      </div>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {formatShortcut(shortcut.key)}
                      </kbd>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
