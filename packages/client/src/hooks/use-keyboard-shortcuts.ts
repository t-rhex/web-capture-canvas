import { useEffect, useCallback } from 'react';

interface ShortcutHandler {
  key: string;
  callback: () => void;
  description: string;
  group: 'General' | 'Capture' | 'Navigation' | 'Organization';
}

interface ShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutHandler[],
  options: ShortcutOptions = { preventDefault: true }
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Get the pressed key combination
      const key = [
        event.metaKey ? '⌘' : '',
        event.shiftKey ? '⇧' : '',
        event.altKey ? '⌥' : '',
        event.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => s.key.toLowerCase() === key);

      if (shortcut) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        if (options.stopPropagation) {
          event.stopPropagation();
        }
        shortcut.callback();
      }
    },
    [shortcuts, options]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Return all shortcuts for documentation
  return shortcuts;
}

// Helper to format shortcut keys for display
export function formatShortcut(key: string): string {
  return key
    .split('+')
    .map((k) => k.trim())
    .join(' + ');
}
