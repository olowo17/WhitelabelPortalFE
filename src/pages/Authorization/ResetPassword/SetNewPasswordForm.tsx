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
import { validateCallback, validatePassword } from 'utils/validation';
import { VisibilityIcon, VisibilityOffIcon } from 'components/appIcons';

const schema = yup.object().shape({
  password: validatePassword('password'),
});

export default function SetNewPasswordForm() {
  const history = useHistory();
  const { showToast } = useToast();
  const { setNewPassword } = useAuthService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { resetToken } = localStorage;

  const { values, updateValue, errors, setErrors } = useFormValues(
    {
      password: '',
    },
    schema
  );

  const { t } = useTranslation(['resetPassword', 'labels']);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateCallback(values, schema, setErrors)) {
      setIsSubmitting(false);
      return;
    }
    setNewPassword({ ...values, token: resetToken })
      .then((data) => {
        localStorage.removeItem('resetToken');
        history.push(routePaths.login);
        showToast({ message: data.description, type: 'success' });
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
          type={showPassword ? 'text' : 'password'}
          name="password"
          label={t(`labels:password`)}
          onChange={updateValue}
          onBlur={updateValue as any}
          error={Boolean(errors?.password)}
          helperText={errors?.password}
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
        <Link
          component={RouterLink}
          variant="subtitle2"
          to={routePaths.login}
          onClick={() => localStorage.removeItem('resetToken')}
        >
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
        {t('resetPassword:setNew')}
      </LoadingButton>
    </form>
  );
}
