import React, { ReactNode } from 'react';
import { Card, Box, Container, MenuItem, Select, SelectChangeEvent, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Page from 'components/Page';
import { MHidden } from 'components/@material-extend';

import InterswitchLogo from 'assets/images/interswitch-logo.svg';
import IllustrationLogin from 'assets/images/illustration_login.png';

const RootPage = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  position: 'absolute',
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    justifyContent: 'space-between',
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

type TAuthLayout = {
  title: string;
  children: ReactNode;
};

const AuthLayout = ({ title, children }: TAuthLayout) => {
  const { i18n } = useTranslation();

  const onChangeLanguage = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <RootPage title={title}>
      <HeaderStyle>
        <Box component="img" src={InterswitchLogo} sx={{ width: 240, mx: 4, my: 2 }} />
        <Select
          name="select-language"
          value={i18n.language}
          onChange={onChangeLanguage}
          variant="standard"
          disableUnderline
          sx={{
            mx: 2,
            color: '#949FAC',
          }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="fr">Français</MenuItem>
        </Select>
      </HeaderStyle>

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Hi, Welcome Back
          </Typography>
          <img src={IllustrationLogin} alt="login" />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>{children}</ContentStyle>
      </Container>
    </RootPage>
  );
};

export default AuthLayout;
