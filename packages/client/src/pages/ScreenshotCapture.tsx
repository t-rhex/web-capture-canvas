import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

interface ViewportSettings {
  width: number;
  height: number;
}

interface CaptureSettings {
  fullPage: boolean;
  hideAds: boolean;
  hideCookieBanners: boolean;
  delay: number;
}

export default function ScreenshotCapture() {
  const [url, setUrl] = useState('');
  const [settings, setSettings] = useState<CaptureSettings>({
    fullPage: true,
    hideAds: true,
    hideCookieBanners: true,
    delay: 1000,
  });
  const [viewport, setViewport] = useState<ViewportSettings>({
    width: 1920,
    height: 1080,
  });

  const handleCapture = async () => {
    // Implement screenshot capture logic here
    console.log('Capturing screenshot with settings:', {
      url,
      settings,
      viewport,
    });
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Screenshot Capture
        </Typography>

        <Grid container spacing={3}>
          {/* URL Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </Grid>

          {/* Viewport Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Viewport Settings
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Width"
              value={viewport.width}
              onChange={(e) => setViewport({ ...viewport, width: parseInt(e.target.value) })}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Height"
              value={viewport.height}
              onChange={(e) => setViewport({ ...viewport, height: parseInt(e.target.value) })}
              required
            />
          </Grid>

          {/* Capture Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Capture Settings
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Delay (ms)"
              value={settings.delay}
              onChange={(e) => setSettings({ ...settings, delay: parseInt(e.target.value) })}
              helperText="Wait time before capture"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.fullPage}
                  onChange={(e) => setSettings({ ...settings, fullPage: e.target.checked })}
                />
              }
              label="Capture Full Page"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.hideAds}
                  onChange={(e) => setSettings({ ...settings, hideAds: e.target.checked })}
                />
              }
              label="Hide Advertisements"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.hideCookieBanners}
                  onChange={(e) =>
                    setSettings({ ...settings, hideCookieBanners: e.target.checked })
                  }
                />
              }
              label="Hide Cookie Banners"
            />
          </Grid>

          {/* Capture Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PhotoCamera />}
                onClick={handleCapture}
                disabled={!url}
              >
                Capture Screenshot
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
