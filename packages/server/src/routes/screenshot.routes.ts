import { Router, Request, Response } from 'express';
import { ScreenshotService } from '../services/screenshot.service';
import { ScreenshotOptions } from '../types';

const router = Router();
const screenshotService = ScreenshotService.getInstance();

// Store active captures
const activeCaptures = new Map<
  string,
  {
    res?: Response;
    status: string;
    progress: number;
    options: ScreenshotOptions;
  }
>();

router.post('/capture', async (req: Request, res: Response) => {
  try {
    const options: ScreenshotOptions = req.body;
    console.log('Received capture request:', options);

    // Validate required fields
    if (!options.url || !options.viewport || !options.viewport.width || !options.viewport.height) {
      return res.status(400).json({
        error: 'Missing required fields: url and viewport dimensions are required',
      });
    }

    // Generate a unique ID for this capture
    const captureId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated captureId:', captureId);

    // Store the capture details without starting the capture
    activeCaptures.set(captureId, {
      status: 'starting',
      progress: 0,
      options,
    });

    // Only return the capture ID
    return res.status(200).json({
      captureId,
      status: 'initiated',
    });
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return res.status(500).json({
      error: 'Failed to initiate screenshot capture',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/progress/:captureId', async (req: Request, res: Response) => {
  const { captureId } = req.params;
  const capture = activeCaptures.get(captureId);

  if (!capture) {
    return res.status(404).json({ error: 'Capture not found' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Update the capture with the SSE response object
  capture.res = res;

  // Send initial progress
  res.write(`data: ${JSON.stringify({ status: 'starting', progress: 0 })}\n\n`);

  try {
    // Start the actual screenshot capture
    const result = await screenshotService.takeScreenshot(capture.options, res);

    // Send final result
    res.write(
      `data: ${JSON.stringify({
        status: 'completed',
        progress: 100,
        result,
      })}\n\n`
    );

    // Clean up
    activeCaptures.delete(captureId);
    res.end();
  } catch (error) {
    // Send error
    res.write(
      `data: ${JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })}\n\n`
    );

    // Clean up
    activeCaptures.delete(captureId);
    res.end();
  }

  // Clean up when client disconnects
  req.on('close', () => {
    activeCaptures.delete(captureId);
  });
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { urls, viewport, settings } = req.body;

    if (!Array.isArray(urls) || urls.length === 0 || !viewport) {
      return res.status(400).json({
        error: 'Invalid request: urls array and viewport are required',
      });
    }

    // Generate a unique batch ID
    const batchId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store the batch details
    activeCaptures.set(batchId, {
      status: 'starting',
      progress: 0,
      options: {
        urls,
        viewport,
        ...settings,
      },
    });

    // Return the batch ID immediately
    return res.status(200).json({
      batchId,
      status: 'initiated',
    });
  } catch (error) {
    console.error('Batch screenshot error:', error);
    return res.status(500).json({
      error: 'Failed to initiate batch screenshots',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/progress/batch/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const batch = activeCaptures.get(batchId);

  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Update the batch with the SSE response object
  batch.res = res;

  // Send initial progress
  res.write(`data: ${JSON.stringify({ status: 'starting', progress: 0 })}\n\n`);

  try {
    // Process screenshots in sequence
    const results = [];
    const urls = (batch.options as any).urls;
    const viewport = (batch.options as any).viewport;
    const settings = (batch.options as any).settings;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const progress = Math.round((i / urls.length) * 100);

      res.write(
        `data: ${JSON.stringify({
          status: 'processing',
          progress,
          currentUrl: url,
          completed: i,
          total: urls.length,
        })}\n\n`
      );

      try {
        const result = await screenshotService.takeScreenshot({
          url,
          viewport,
          ...settings,
        });
        results.push(result);
      } catch (error) {
        console.error(`Error capturing screenshot for ${url}:`, error);
        results.push({
          error: error instanceof Error ? error.message : 'Unknown error',
          url,
        });
      }
    }

    // Send completion event
    res.write(
      `data: ${JSON.stringify({
        status: 'completed',
        progress: 100,
        results,
      })}\n\n`
    );

    // Clean up
    activeCaptures.delete(batchId);
    res.end();
  } catch (error) {
    console.error('Batch processing error:', error);

    // Send error
    res.write(
      `data: ${JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })}\n\n`
    );

    // Clean up
    activeCaptures.delete(batchId);
    res.end();
  }

  // Clean up when client disconnects
  req.on('close', () => {
    activeCaptures.delete(batchId);
  });
});

export default router;
