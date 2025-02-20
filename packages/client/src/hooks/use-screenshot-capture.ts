import { useState, useCallback } from 'react';
import {
  Screenshot,
  Viewport,
  CaptureSettings,
  captureScreenshot,
  captureBatchScreenshots,
} from '@/lib/screenshot';

interface CaptureState {
  status: 'idle' | 'starting' | 'processing' | 'completed' | 'error';
  progress: number;
  currentUrl?: string;
  completed?: number;
  total?: number;
  error?: string;
  results: Screenshot[];
}

export function useScreenshotCapture() {
  const [state, setState] = useState<CaptureState>({
    status: 'idle',
    progress: 0,
    results: [],
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      results: [],
    });
  }, []);

  const capture = useCallback(
    async (url: string, viewport: Viewport, settings: CaptureSettings) => {
      setIsDialogOpen(true);
      setState((prev) => ({ ...prev, status: 'starting', progress: 0 }));

      try {
        const result = await captureScreenshot(url, viewport, settings, {
          onProgress: (progress) => {
            setState((prev) => ({
              ...prev,
              ...progress,
              results: progress.results || (progress.result ? [progress.result] : prev.results),
            }));
          },
        });

        setState((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          results: Array.isArray(result) ? result : [result],
        }));

        return Array.isArray(result) ? result : [result];
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
        throw error;
      }
    },
    []
  );

  const captureBatch = useCallback(
    async (urls: string[], viewport: Viewport, settings: CaptureSettings) => {
      setIsDialogOpen(true);
      setState((prev) => ({ ...prev, status: 'starting', progress: 0 }));

      try {
        const results = await captureBatchScreenshots(urls, viewport, settings, {
          onProgress: (progress) => {
            setState((prev) => ({
              ...prev,
              ...progress,
              results: progress.results || prev.results,
            }));
          },
        });

        setState((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          results,
        }));

        return results;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    isDialogOpen,
    setIsDialogOpen,
    capture,
    captureBatch,
    reset,
    setState,
  };
}
