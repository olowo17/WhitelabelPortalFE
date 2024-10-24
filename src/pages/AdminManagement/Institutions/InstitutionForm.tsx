import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { ICountry } from 'pages/AdminManagement/Countries/Countries.model';
import { readFileAsBase64, trimName } from 'utils/utils';
import { createInstitution, updateInstitution } from './Institutions.service';
import { ICreateInstitutionBody, IInstitution } from './Institutions.model';

interface IInstitutionFormProps {
  closeForm: () => void;
  countries: ICountry[];
  editedInstitution?: IInstitution;
}

const schema = yup.object().shape({
  country_id: requiredOnly('country'),
  name: requiredOnly('name'),
  code: requiredOnly('code'),
  bankCode: requiredOnly('bankCode'),
  accentColor: requiredOnly('accentColor'),
  logo: requiredOnly('logo'),
  configFile: requiredOnly('configFile'),
  currentAppVersion: requiredOnly('configFile'),
});

const InstitutionForm = ({ countries, editedInstitution, closeForm }: IInstitutionFormProps) => {
  const { values, updateValue, errors, touched, updateValueByName } = useFormValues<ICreateInstitutionBody>(
    {
      country_id: editedInstitution?.country.id || '',
      name: editedInstitution?.name || '',
      code: editedInstitution?.code || '',
      bankCode: editedInstitution?.bankCode || '',
      accentColor: editedInstitution?.accentColor || '',
      logo: editedInstitution?.logo || '',
      configFile: '',
      currentAppVersion: editedInstitution?.currentAppVersion || '',
      forceUpdate: true,
      countryId: editedInstitution?.country.id || '',
      usekyc: false,
    },
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileReader = new FileReader();
  const { t } = useTranslation(['labels']);
  const actionStr = editedInstitution ? t('labels:edit') : t('labels:create');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (errors) return;
      setSubmitting(true);
      (editedInstitution
        ? updateInstitution({ ...values, id: editedInstitution.id, logo: ' ' })
        : createInstitution({ ...values, countryId: values.country_id, logo: ' ' })
      )
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, closeForm]
  );

  const changeSelectedImage = useCallback((event) => {
    const [file = null] = event.target.files || [];

    readFileAsBase64(file, { allowedMimes: ['image/jpeg', 'image/png'], maxSize: 0.5 })
      .then((base64String) => {
        if (!base64String) {
          throw new Error('Could not read image!');
        }

        // remove data:image/jpeg;base64, from image string
        const parts = base64String.split(',');
        updateValueByName('logo', parts[parts.length - 1]);
      })
      .catch((err) => {
        showToast({ message: err, type: 'error' });
        updateValueByName('logo', '');
      });
  }, []);

  const changeSelectedFile = useCallback((event) => {
    const [file = null] = event.target.files || [];
    setFileName(trimName(event.target.files[0].name));
    if (file) {
      fileReader.onloadend = (event) => {
        if (event.target) updateValueByName('configFile', event.target.result);
      };
      fileReader.readAsText(file);
    }
  }, []);

  const boxContent = (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="institution-form-role_id-label">{t('labels:country')}</InputLabel>
              <Select
                name="country_id"
                labelId="institution-form-role_id-label"
                label={t('labels:country')}
                value={values.country_id}
                onChange={handleChange}
                error={Boolean(touched.country_id && errors?.country_id)}
              >
                <MenuItem value="">- Select -</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText error={Boolean(errors?.country_id)}>
                {touched.country_id && errors?.country_id}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="name"
              label={t('labels:name')}
              value={values.name}
              onChange={handleChange}
              error={Boolean(touched.name && errors?.name)}
              helperText={touched.name && errors?.name}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="code"
              label={t('labels:code')}
              value={values.code}
              onChange={handleChange}
              error={Boolean(touched.code && errors?.code)}
              helperText={touched.code && errors?.code}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="bankCode"
              label={t('labels:bankCode')}
              value={values.bankCode}
              onChange={handleChange}
              error={Boolean(touched.bankCode && errors?.bankCode)}
              helperText={touched.bankCode && errors?.bankCode}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              name="accentColor"
              label={t('labels:accentColor')}
              value={values.accentColor}
              type="color"
              onChange={handleChange}
              error={Boolean(touched.accentColor && errors?.accentColor)}
              helperText={touched.accentColor && errors?.accentColor}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="currentAppVersion"
              label={t('labels:currentAppVersion')}
              value={values.currentAppVersion}
              onChange={handleChange}
              error={Boolean(touched.currentAppVersion && errors?.currentAppVersion)}
              helperText={touched.currentAppVersion && errors?.currentAppVersion}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Button variant="text" component="label" fullWidth size="large">
                    Upload Logo
                    <input type="file" name="imageSelector" onChange={changeSelectedImage} hidden accept="image/*" />
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  {values.logo && (
                    <Avatar
                      src={'data:image/jpeg;base64,' + values.logo}
                      variant="rounded"
                      imgProps={{ style: { objectFit: 'contain' } }}
                    />
                  )}
                </Grid>
              </Grid>
              <FormHelperText error={Boolean(errors?.logo)}>{touched.logo && errors?.logo}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <Grid container spacing={2}>
                <Grid item xs={8} md={4}>
                  <Button variant="text" component="label" fullWidth size="large">
                    Upload Config File
                    <input type="file" name="fileSelector" onChange={changeSelectedFile} hidden accept=".csv" />
                  </Button>
                </Grid>
                <Grid item xs={4} md={8} alignSelf="center">
                  {values.configFile && <Box>{fileName}</Box>}
                </Grid>
              </Grid>
              <FormHelperText error={Boolean(errors?.configFile)}>
                {touched.configFile && errors?.configFile}
              </FormHelperText>
            </FormControl>
          </Grid>
          {!editedInstitution && (
            <Grid item xs={12} md={8}>
              <Grid container>
                <Grid item>
                  <Checkbox name="usekyc" onChange={handleChange} />
                </Grid>
                <Grid item alignSelf="center">
                  <Typography>Use KYC Levels</Typography>
                </Grid>
              </Grid>
            </Grid>
          )}
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

  return <Box>{boxContent}</Box>;
};

export default InstitutionForm;
