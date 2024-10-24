import React, { SyntheticEvent, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Link, Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { VisibilityIcon, VisibilityOffIcon } from 'components/appIcons';
import { useFormValues } from 'hooks/useFormValues';
import useAuthService from 'hooks/useAuthService';
import routePaths from 'routes/routePaths';
import { requiredOnly, validateEmail } from 'utils/validation';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';

const schema = yup.object().shape({
  email: validateEmail(),
  password: requiredOnly('password'),
});

export default function LoginForm() {
  const history = useHistory();
  const { login } = useAuthService();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, updateValue, errors, touched } = useFormValues(
    {
      email: '',
      password: '',
    },
    schema
  );

  const { t } = useTranslation(['login', 'labels']);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (errors) {
      return;
    }

    setIsSubmitting(true);
    login(values)
      .then((res) => {
        if (res?.data?.token) {
          if (res.data.user?.firstLogin) {
            history.push(routePaths.changePassword);
          } else {
            history.push(routePaths.dashboard);
          }
        } else {
          setIsSubmitting(false);
        }
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
        setIsSubmitting(false);
      });
  };

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          autoComplete="username"
          type="email"
          name="email"
          label={t(`labels:emailAddress`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(touched.email && errors?.email)}
          helperText={touched.email && errors?.email}
        />

        <TextField
          fullWidth
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          label={t(`labels:password`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(touched.password && errors?.password)}
          helperText={touched.password && errors?.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowPassword} edge="end">
                  {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack alignItems="center" justifyContent="center" sx={{ my: 2 }}>
        <Link component={RouterLink} variant="subtitle2" to={routePaths.resetPassword}>
          {t(`login:toResetPassword`)}
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
        {t('login:title')}
      </LoadingButton>
    </form>
  );
}
