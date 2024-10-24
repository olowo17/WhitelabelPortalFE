import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import AuthLayout from 'layouts/AuthLayout';
import ChangePasswordForm from './ChangePasswordForm';

const ChangePassword = () => {
  const { t } = useTranslation(['changePassword']);
  return (
    <AuthLayout title="ChangePassword | Interswitch">
      <Stack sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          {t(`changePassword:title`)}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t(`changePassword:enterDetails`)}</Typography>
      </Stack>
      <ChangePasswordForm />
    </AuthLayout>
  );
};

export default ChangePassword;
