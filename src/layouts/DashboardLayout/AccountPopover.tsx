import React, { useRef, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography, IconButton } from '@mui/material';
import MenuPopover from 'components/MenuPopover';
import useAuthService from 'hooks/useAuthService';
import routePaths from 'routes/routePaths';
import { AccountCircleIcon, HomeIcon, PersonIcon, SettingsIcon } from 'components/appIcons';

const MENU_OPTIONS = [
  {
    label: 'Dashboard',
    icon: <HomeIcon />,
    linkTo: routePaths.dashboard,
  },
  {
    label: 'Profile',
    icon: <PersonIcon />,
    linkTo: routePaths.profile,
  },
  {
    label: 'Change password',
    icon: <SettingsIcon />,
    linkTo: routePaths.changePassword,
  },
];

const AccountPopover = () => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const { logout, authUser, authUserMenu } = useAuthService();
  const isDashboardAllowed = authUserMenu.some((menuItem) => menuItem.routerLink === routePaths.dashboard);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => logout().then(() => history.push(routePaths.login));

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.3),
            },
          }),
        }}
      >
        {/* <img src={GRAPHQL_HOST + authUser.institution.logo} alt="photoURL" style={{ width: 44, padding: 2 }} /> */}
        <AccountCircleIcon />
      </IconButton>

      <MenuPopover open={open} onClose={handleClose} anchorEl={anchorRef.current} sx={{ width: 220 }}>
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {authUser.firstName + ' ' + authUser.lastName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {authUser.roles[0].name}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {MENU_OPTIONS.map((option) => {
          if (option.linkTo === routePaths.dashboard && !isDashboardAllowed) {
            return;
          }
          return (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={handleClose}
              sx={{ typography: 'body2', py: 1, px: 2.5 }}
            >
              <Box
                component="span"
                sx={{
                  mr: 2,
                  width: 24,
                  height: 24,
                }}
              >
                {option.icon}
              </Box>

              {option.label}
            </MenuItem>
          );
        })}

        <Box sx={{ p: 2, pt: 1.5 }}>
          <Button fullWidth color="inherit" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
};

export default AccountPopover;
