import React, { ReactNode, useEffect, useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Drawer } from '@mui/material';
import Scrollbar from 'components/Scrollbar';
import NavSection from 'components/NavSection';
import { MHidden } from 'components/@material-extend';
import { PeopleIcon, PersonIcon, SettingsApplicationsIcon, SpeedIcon } from 'components/appIcons';
import useAuthService from 'hooks/useAuthService';
import { disabledRoutes } from 'routes/routes';
import { ISidebarItem } from './DashboardLayout.model';

import InterswitchLogo from 'assets/images/interswitch-logo.svg';

const DRAWER_WIDTH = 280;

const iconsRouteMap: Record<string, ReactNode> = {
  Dashboard: <SpeedIcon />,
  'Admin Management': <PersonIcon />,
  'Customer Management': <PeopleIcon />,
  'System Management': <SettingsApplicationsIcon />,
};

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}));

/* const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[200],
})); */

interface IDashboardSidebarProps {
  isOpenSidebar: boolean;
  onCloseSidebar: () => void;
}

const DashboardSidebar: React.FC<IDashboardSidebarProps> = ({ isOpenSidebar, onCloseSidebar }) => {
  const { pathname } = useLocation();
  const { authUserMenu } = useAuthService();

  const navItems = useMemo(() => {
    const childrenMap: Record<string, ISidebarItem[]> = {};
    const navItems: ISidebarItem[] = [];

    for (const menuItem of authUserMenu) {
      const itemParentID = menuItem.parentID;
      if (!itemParentID || +itemParentID === 0) {
        navItems.push({
          id: menuItem.id,
          title: menuItem.title,
          path: menuItem.routerLink,
          icon: iconsRouteMap[menuItem.title],
        });
      } else if (disabledRoutes.indexOf(menuItem.routerLink) === -1) {
        // remove condition above if backend for it works
        if (!childrenMap[itemParentID]) {
          childrenMap[itemParentID] = [];
        }
        childrenMap[itemParentID].push({ id: menuItem.id, title: menuItem.title, path: menuItem.routerLink });
      }
    }

    return navItems.map((ni) => ({ ...ni, children: childrenMap[ni.id] || ni.children }));
  }, [authUserMenu]);

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': { height: '100%', display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'inline-flex' }}>
          <Box component="img" src={InterswitchLogo} sx={{ height: 40 }} />
        </Box>
      </Box>

      {/*<Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none" component={RouterLink} to="#">
          <AccountStyle>
            <Avatar src={account.photoURL} alt="photoURL" />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {account.displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {account.role}
              </Typography>
            </Box>
          </AccountStyle>
        </Link>
      </Box>*/}

      <NavSection navConfig={navItems} />

      <Box sx={{ flexGrow: 1 }} />

      {/*<Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
        <Stack
          alignItems="center"
          spacing={3}
          sx={{
            p: 2.5,
            pt: 5,
            borderRadius: 2,
            position: 'relative',
            bgcolor: 'grey.200',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography gutterBottom variant="h6">
              Use This?
            </Typography>
          </Box>

          <Button fullWidth href="https://interswitchgroup.com" target="_blank" variant="contained">
            Create Something
          </Button>
        </Stack>
      </Box>*/}
    </Scrollbar>
  );

  return (
    <RootStyle>
      <MHidden width="lgUp">
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>

      <MHidden width="lgDown">
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
            },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>
    </RootStyle>
  );
};

export default DashboardSidebar;
