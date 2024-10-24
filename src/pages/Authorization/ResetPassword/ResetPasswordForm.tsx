import React, { SyntheticEvent, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as yup from 'yup';
import { Link, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { useFormValues } from 'hooks/useFormValues';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import routePaths from 'routes/routePaths';
import { validateEmail, validateCallback } from 'utils/validation';

const schema = yup.object().shape({
  email: validateEmail(),
});

export default function ResetPasswordForm() {
  const { showToast } = useToast();
  const { resetPassword } = useAuthService();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, updateValue, errors, setErrors } = useFormValues(
    {
      email: '',
    },
    schema
  );

  const { t } = useTranslation(['resetPassword', 'labels']);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateCallback(values, schema, setErrors)) {
      setIsSubmitting(false);
      return;
    }
    resetPassword(values)
      .then((data) => {
        showToast({ message: `${data.description}. Please check your email `, type: 'success', hideAfter: 10000 });
      })
      .catch((err) => {
        showToast({ message: err?.description, type: 'error' });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <Stack>
        <TextField
          fullWidth
          autoComplete="username"
          type="email"
          name="email"
          label={t(`labels:emailAddress`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(errors?.email)}
          helperText={errors?.email}
        />
      </Stack>

      <Stack alignItems="center" justifyContent="center" sx={{ my: 2 }}>
        <Link component={RouterLink} variant="subtitle2" to={routePaths.login}>
          {t('resetPassword:backToLogin')}
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        disabled={Boolean(errors)}
      >
        {t('resetPassword:title')}
      </LoadingButton>
    </form>
  );
}
