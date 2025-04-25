import React from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigationManager } from '../../navigation';
import { RoutesValueEnum } from "../../enums";
import { useOfflineSync } from '../../systemAvailability/useOfflineSync';
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';

interface HeaderProps {
  headerValue: string
}
const Header: React.FunctionComponent<HeaderProps> = ({ headerValue }) => {
  const { goTo } = useNavigationManager();

  const isOnline = useOfflineSync();

  const handleHomeClick = () => {
    goTo(RoutesValueEnum.Home);
  };

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
          <IconButton color="inherit">
            <PersonIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;