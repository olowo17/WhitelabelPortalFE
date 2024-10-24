import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import AuthLayout from 'layouts/AuthLayout';
import ResetPasswordForm from './ResetPasswordForm';

const Login = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout title="ResetPassword | Interswitch">
      <Stack sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          {t('resetPassword:title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t('resetPassword:enterDetails')}</Typography>
      </Stack>
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default Login;
