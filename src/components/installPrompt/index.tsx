// src/components/installPrompt/index.tsx
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Paper,
  Typography,
  Box
} from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CloseIcon from '@mui/icons-material/Close';

// Define BeforeInstallPromptEvent interface for TypeScript
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Create distinct storage keys for different prompts
const INSTALL_PROMPT_SHOWN_KEY = 'pwa-install-prompt-shown';
const INSTALL_MINI_PROMPT_DISMISSED_KEY = 'pwa-install-mini-prompt-dismissed';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showMiniPrompt, setShowMiniPrompt] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Check for iOS standalone mode
    const isIOSStandalone = (window.navigator as any).standalone === true;

    const isAppInstalled = isStandalone || isIOSStandalone;

    // If installed, don't show any prompts
    if (isAppInstalled) {
      return;
    }

    // Handler for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();

      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Get last prompt time from localStorage
      const lastPromptTime = localStorage.getItem(INSTALL_PROMPT_SHOWN_KEY);
      const miniPromptDismissed = localStorage.getItem(INSTALL_MINI_PROMPT_DISMISSED_KEY);

      // Check if we should show the full dialog (every 7 days max)
      if (!lastPromptTime || (Date.now() - Number(lastPromptTime)) > 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          setShowDialog(true);
          localStorage.setItem(INSTALL_PROMPT_SHOWN_KEY, Date.now().toString());
        }, 5000); // Wait 5 seconds after page load
      }
      // Show mini prompt if full dialog isn't shown and mini prompt wasn't dismissed recently
      else if (!miniPromptDismissed || (Date.now() - Number(miniPromptDismissed)) > 3 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          setShowMiniPrompt(true);
        }, 5000);
      }
    };

    // Handler for appinstalled event
    const handleAppInstalled = () => {
      setShowSnackbar(true);
      setDeferredPrompt(null);
      setShowDialog(false);
      setShowMiniPrompt(false);
      console.log('App was installed');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    // Reset the deferred prompt variable
    setDeferredPrompt(null);

    // Close dialog
    setShowDialog(false);
    setShowMiniPrompt(false);

    // Log result
    console.log('User ' + (choiceResult.outcome === 'accepted' ? 'accepted' : 'dismissed') + ' the install prompt');
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  // Handle mini prompt dismiss
  const handleDismissMiniPrompt = () => {
    setShowMiniPrompt(false);
    localStorage.setItem(INSTALL_MINI_PROMPT_DISMISSED_KEY, Date.now().toString());
  };

  return (
    <>
      {/* Full installation dialog */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        aria-labelledby="install-dialog-title"
        aria-describedby="install-dialog-description"
      >
        <DialogTitle id="install-dialog-title">
          Install Structure Inspection App
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="install-dialog-description">
            Install this app on your device to:
            <ul>
              <li>Work offline in the field</li>
              <li>Access inspections faster</li>
              <li>Get a fullscreen experience</li>
              <li>Improve performance</li>
            </ul>
            Would you like to install this app now? It won't take up much space.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Not Now
          </Button>
          <Button onClick={handleInstallClick} color="primary" variant="contained" startIcon={<InstallMobileIcon />}>
            Install App
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success">
          App installed successfully!
        </Alert>
      </Snackbar>

      {/* Mini installation prompt */}
      {showMiniPrompt && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            padding: 2,
            zIndex: 1000,
            maxWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            backgroundColor: theme => theme.palette.primary.light,
            color: 'white',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">
              Install App
            </Typography>
            <Button
              onClick={handleDismissMiniPrompt}
              color="inherit"
              size="small"
              sx={{ minWidth: 'auto', padding: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>

          <Typography variant="body2">
            Install the app for better offline experience and faster access
          </Typography>

          <Button
            onClick={handleInstallClick}
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<InstallMobileIcon />}
            sx={{ alignSelf: 'flex-start', mt: 1 }}
          >
            Install Now
          </Button>
        </Paper>
      )}
    </>
  );
};

export default InstallPrompt;