import React, { forwardRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box } from '@mui/material';

interface IPageProps {
  title: string;
  children: React.ReactNode;
}

const Page = forwardRef(({ children, title = '', ...other }: IPageProps, ref) => (
  <Box ref={ref} {...other}>
    <Helmet>
      <title>{title}</title>
    </Helmet>
    {children}
  </Box>
));

Page.displayName = 'Page';

export default Page;
