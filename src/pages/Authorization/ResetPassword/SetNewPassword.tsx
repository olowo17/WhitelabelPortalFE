import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import AuthLayout from 'layouts/AuthLayout';
import SetNewPasswordForm from './SetNewPasswordForm';

const Login = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout title="Set New Password | Interswitch">
      <Stack sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          {t('resetPassword:setNew')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t('resetPassword:enterDetails')}</Typography>
      </Stack>
      <SetNewPasswordForm />
    </AuthLayout>
  );
};

export default Login;
