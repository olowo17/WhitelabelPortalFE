import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import InterswitchLogo from 'assets/images/interswitch-logo.svg';

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  left: 0,
  lineHeight: 0,
  width: '100%',
  position: 'absolute',
  padding: theme.spacing(3, 3, 0),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5, 5, 0),
  },
}));

export default function LogoOnlyLayout({ children }: any) {
  return (
    <>
      <HeaderStyle>
        <RouterLink to="/">
          <Box component="img" src={InterswitchLogo} sx={{ height: 40 }} />
        </RouterLink>
      </HeaderStyle>
      {children}
    </>
  );
}
