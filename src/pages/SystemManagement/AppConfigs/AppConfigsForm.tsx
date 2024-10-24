import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, TextField } from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { createConfig, updateConfig } from './AppConfigs.service';
import { ICreateConfig, IConfig, IUpdateConfig } from './AppConfigs.model';

interface IAppConfigForm {
  editedConfig: IConfig | undefined;
  closeForm: () => void;
}

const schema = yup.object().shape({
  application: requiredOnly('application'),
  key: requiredOnly('key'),
  label: requiredOnly('label'),
  profile: requiredOnly('profile'),
  value: requiredOnly('value'),
});

const AppConfigForm = ({ editedConfig, closeForm }: IAppConfigForm) => {
  const { values, updateValue, errors, touched } = useFormValues(
    editedConfig ? ({ ...editedConfig } as IUpdateConfig) : ({} as ICreateConfig),
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = editedConfig ? t('labels:edit') : t('labels:create');

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (editedConfig ? updateConfig(values as IUpdateConfig) : createConfig(values as ICreateConfig))
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, editedConfig, closeForm]
  );

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              name="application"
              label={t('labels:application')}
              value={values.application}
              onChange={handleChange}
              error={Boolean(touched.application && errors?.application)}
              helperText={touched.application && errors?.application}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="key"
              label={t('labels:key')}
              value={values.key}
              onChange={handleChange}
              error={Boolean(touched.key && errors?.key)}
              helperText={touched.key && errors?.key}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="label"
              label={t('labels:label')}
              value={values.label}
              onChange={handleChange}
              error={Boolean(touched.label && errors?.label)}
              helperText={touched.label && errors?.label}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="profile"
              label={t('labels:profile')}
              value={values.profile}
              onChange={handleChange}
              error={Boolean(touched.profile && errors?.profile)}
              helperText={touched.profile && errors?.profile}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="value"
              label={t('labels:value')}
              value={values.value}
              onChange={handleChange}
              error={Boolean(touched.value && errors?.profile)}
              helperText={touched.value && errors?.value}
              fullWidth
            />
          </Grid>
        </Grid>

        <LoadingButton
          type="submit"
          variant="contained"
          sx={{ marginTop: 2 }}
          loading={submitting}
          disabled={Boolean(errors)}
        >
          {actionStr}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default AppConfigForm;
