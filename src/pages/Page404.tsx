import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, Container } from '@mui/material';
import Page from 'components/Page';
import illustration404 from 'assets/images/illustration_404.svg';

const RootPage = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

export default function Page404() {
  return (
    <RootPage title="404 Page Not Found | Interswitch">
      <Container>
        <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
          <Typography variant="h3" paragraph>
            Sorry, page not found!
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your
            spelling.
          </Typography>

          <Box component="img" src={illustration404} sx={{ height: 260, mx: 'auto', my: { xs: 5, sm: 10 } }} />

          <div>
            <Button to="/" size="large" variant="contained" component={RouterLink}>
              Go to Home
            </Button>
          </div>
        </Box>
      </Container>
    </RootPage>
  );
}
