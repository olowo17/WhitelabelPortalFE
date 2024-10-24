import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import AuthLayout from 'layouts/AuthLayout';
import LoginForm from './LoginForm';

const Login = () => {
  const { t } = useTranslation(['login']);
  return (
    <AuthLayout title="Login | Interswitch">
      <Stack sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          {t('login:title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t('login:enterDetails')}</Typography>
      </Stack>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
