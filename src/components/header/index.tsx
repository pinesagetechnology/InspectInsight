import React, { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from "../../enums";
import { useOfflineSync } from '../../systemAvailability/useOfflineSync';
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import LogoutIcon from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import * as actions from "../../store/Common/actions";
import { useDispatch, useSelector } from 'react-redux';
import { getEmail, getUserId } from '../../store/Auth/selectors';
import { useAuth } from '../../context';
import { PayloadAction } from '@reduxjs/toolkit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppSettingsComponent from '../settings';
import { useAIAssistant } from '../../customHook/useAIAssistant';

interface HeaderProps {
  headerValue: string
}

const Header: React.FunctionComponent<HeaderProps> = ({ headerValue }) => {
  const { goTo } = useNavigationManager();
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [dialogOpen, setDialogOpen] = useState(false);

  const logedInEmail = useSelector(getEmail);
  const userId = useSelector(getUserId);

  const isOnline = useOfflineSync();

  const {
    // State
    webGPUSupported,
    config,
    setConfig,
    // Actions
    downloadModel,
    switchModel,
    handleGuidelinesUpload,
    // Getters
    getState,
  } = useAIAssistant();

  const handleHomeClick = () => {
    goTo(RoutesValueEnum.Home);
  };

  const handleLogoutClick = () => {
    dispatch({
      type: actions.SHOW_LOADING_OVERLAY,
    } as PayloadAction);

    logout();

    setAnchorEl(null);
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenSetting = () => {
    setAnchorEl(null);
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const state = getState();

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button onClick={handleHomeClick} color="inherit">
            <Typography variant="h6">
              {headerValue}
            </Typography>
          </Button>
        </Box>
        <Stack direction={'row'} spacing={2}>
          {
            isOnline ?
              <SignalWifiStatusbar4BarIcon sx={{ alignSelf: 'center', color: 'success.main' }} />
              :
              <SignalWifiOffIcon sx={{ alignSelf: 'center', color: 'text.secondary' }} />
          }
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          {userId && (
            <React.Fragment>
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={menuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32 }}><AccountCircleIcon /></Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleOpenSetting}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </React.Fragment>
          )}
        </Stack>
      </Toolbar>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth={'lg'}
      >
        <AppSettingsComponent handleDialogClose={handleDialogClose}
          config={config}
          setConfig={setConfig}
          availableModels={state.availableModels}
          currentModel={state.currentModel}
          isModelReady={state.isReady}
          webGPUSupported={webGPUSupported}
          onDownloadModel={downloadModel}
          onSwitchModel={switchModel}
          onGuidelinesUpload={handleGuidelinesUpload}
        />
      </Dialog>


    </AppBar>
  );
};

export default Header;