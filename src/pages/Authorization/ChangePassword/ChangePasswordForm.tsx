import React, { SyntheticEvent, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { IconButton, InputAdornment, Link, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { useFormValues } from 'hooks/useFormValues';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import routePaths from 'routes/routePaths';
import { validateCallback, validatePassword, validatePassMatch, validateNewPassword } from 'utils/validation';
import { VisibilityIcon, VisibilityOffIcon } from 'components/appIcons';

const schema = yup.object().shape({
  currentPassword: validatePassword('currentPassword'),
  newPassword: validatePassword('newPassword'),
  confirmPassword: validatePassMatch('confirmPassword'),
});

const firstLoginSchema = yup.object().shape({
  currentPassword: validatePassword('currentPassword'),
  newPassword: validateNewPassword('newPassword'),
  confirmPassword: validatePassMatch('confirmPassword'),
});

export default function ChangePasswordForm() {
  const history = useHistory();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword } = useAuthService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authUserMenu } = useAuthService();
  const isDashboardAllowed = authUserMenu.some((menuItem) => menuItem.routerLink === routePaths.dashboard);
  const storedFirstLogin = localStorage.getItem('firstLogin');
  const isFirstLogin = storedFirstLogin ? JSON.parse(storedFirstLogin) : false;
  const validationSchema = isFirstLogin ? firstLoginSchema : schema;

  const { values, updateValue, errors, setErrors, touched } = useFormValues(
    {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema
  );

  const { t } = useTranslation(['changePassword', 'labels']);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateCallback(values, validationSchema, setErrors)) {
      setIsSubmitting(false);
      return;
    }
    changePassword({ currentPassword: values.currentPassword, proposedPassword: values.newPassword })
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
        localStorage.setItem('firstLogin', 'false');
        history.push(isDashboardAllowed ? routePaths.dashboard : routePaths.profile);
      })
      .catch((err) => {
        showToast({ message: err?.description, type: 'error' });
      })
      .finally(() => setIsSubmitting(false));
  };
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          name="currentPassword"
          label={t(`labels:currentPassword`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(touched.currentPassword && errors?.currentPassword)}
          helperText={touched.currentPassword && errors?.currentPassword}
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
        <TextField
          fullWidth
          type={showNewPassword ? 'text' : 'password'}
          name="newPassword"
          label={t(`labels:newPassword`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(touched.newPassword && errors?.newPassword)}
          helperText={touched.newPassword && errors?.newPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowNewPassword} edge="end">
                  {showNewPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          label={t(`labels:confirmPassword`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(touched.confirmPassword && errors?.confirmPassword)}
          helperText={touched.confirmPassword && errors?.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowConfirmPassword} edge="end">
                  {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack alignItems="center" justifyContent="center" sx={{ my: 2 }}>
        {!isFirstLogin && (
          <Link component={RouterLink} variant="subtitle2" to={routePaths.login}>
            {isDashboardAllowed ? t(`changePassword:backToDashboard`) : t(`changePassword:backToProfile`)}
          </Link>
        )}
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        disabled={Boolean(errors)}
      >
        {t(`changePassword:title`)}
      </LoadingButton>
    </form>
  );
}
