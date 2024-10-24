import React, { useMemo, useState } from 'react';
import { NavLink as RouterLink, matchPath, useLocation } from 'react-router-dom';
import { alpha, useTheme, styled } from '@mui/material/styles';
import { Box, List, Collapse, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import { ISidebarItem } from 'layouts/DashboardLayout/DashboardLayout.model';
import { IconExpandLess, IconExpandMore } from './appIcons';

const StyledListItemButton = styled((props: any) => <ListItemButton disableGutters {...props} />)(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: 'relative',
  textTransform: 'capitalize',
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.text.secondary,
  '&:before': {
    top: 0,
    right: 0,
    width: 3,
    bottom: 0,
    content: "''",
    display: 'none',
    position: 'absolute',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// ----------------------------------------------------------------------

interface INavItemProps {
  item: ISidebarItem;
  active: (path: string) => boolean;
}

const NavItem: React.FC<INavItemProps> = ({ item, active }) => {
  const theme = useTheme();
  const isActiveRoot = active(item.path);
  const activeSub: ISidebarItem | undefined = useMemo(
    () => item.children?.find((cp: ISidebarItem) => active(cp.path)),
    [item.children]
  );
  const hasActiveSub = useMemo(() => Boolean(activeSub), [activeSub]);
  const { title, path, icon, info, children } = item;
  const [open, setOpen] = useState(isActiveRoot || hasActiveSub);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const activeRootStyle = {
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:before': { display: 'block' },
  };

  const activeSubStyle = {
    color: 'text.primary',
    fontWeight: 'fontWeightMedium',
  };

  if (children) {
    return (
      <>
        <StyledListItemButton
          onClick={handleOpen}
          sx={{
            ...((isActiveRoot || hasActiveSub) && activeRootStyle),
          }}
        >
          <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
          <ListItemText disableTypography primary={title} />
          {info && info}
          <span>{open ? <IconExpandLess /> : <IconExpandMore />}</span>
        </StyledListItemButton>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((item: ISidebarItem) => {
              const { title, path } = item;
              // const isActiveSub = active(path);
              const isActiveSub = activeSub?.path === path;

              return (
                <StyledListItemButton
                  key={title}
                  component={RouterLink}
                  to={path}
                  sx={{
                    ...(isActiveSub && activeSubStyle),
                  }}
                >
                  <ListItemIconStyle>
                    <Box
                      component="span"
                      sx={{
                        width: 4,
                        height: 4,
                        display: 'flex',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'text.disabled',
                        transition: (theme) => theme.transitions.create('transform'),
                        ...(isActiveSub && {
                          transform: 'scale(2)',
                          bgcolor: 'primary.main',
                        }),
                      }}
                    />
                  </ListItemIconStyle>
                  <ListItemText disableTypography primary={title} />
                </StyledListItemButton>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <StyledListItemButton
      component={RouterLink}
      to={path}
      sx={{
        ...(isActiveRoot && activeRootStyle),
      }}
    >
      <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={title} />
      {info && info}
    </StyledListItemButton>
  );
};

interface INavSectionProps {
  navConfig: ISidebarItem[];
}

const NavSection: React.FC<INavSectionProps> = ({ navConfig, ...other }) => {
  const { pathname } = useLocation();

  const match = (path: string) => (path ? !!matchPath(path, { path: pathname, exact: true }) : false);

  return (
    <Box {...other}>
      <List disablePadding>
        {navConfig.map((item) => (
          <NavItem key={item.title} item={item} active={match} />
        ))}
      </List>
    </Box>
  );
};
export default NavSection;
