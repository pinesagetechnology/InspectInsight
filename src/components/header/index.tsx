import React from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from "../../enums";
import { useOfflineSync } from '../../systemAvailability/useOfflineSync';
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import LogoutIcon from '@mui/icons-material/Logout';
import * as actions from "../../store/Common/actions";
import { useDispatch, useSelector } from 'react-redux';
import { getEmail, getUserId } from '../../store/Auth/selectors';
import { useAuth } from '../../context';
import { PayloadAction } from '@reduxjs/toolkit';

interface HeaderProps {
  headerValue: string
}
const Header: React.FunctionComponent<HeaderProps> = ({ headerValue }) => {
  const { goTo } = useNavigationManager();
  const dispatch = useDispatch();
  const { logout } = useAuth();

  const logedInEmail = useSelector(getEmail);
  const userId = useSelector(getUserId);

  const isOnline = useOfflineSync();

  const handleHomeClick = () => {
    goTo(RoutesValueEnum.Home);
  };

  const handleLogoutClick = () => {
    dispatch({
      type: actions.SHOW_LOADING_OVERLAY,
    } as PayloadAction);
    
    logout();
  }
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
            <IconButton color="inherit" onClick={handleLogoutClick}>
              <LogoutIcon />
            </IconButton>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;