import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useAuthService from 'hooks/useAuthService';
import { requiredOnly } from 'utils/validation';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { ICountry } from 'pages/AdminManagement/Countries/Countries.model';
import { IInstitution } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { createBranch, updateBranch } from './Branches.service';
import { IBranch } from './Branches.model';

interface IBranchForm {
  closeForm: () => void;
  editBranch: IBranch | undefined;
  countries: ICountry[];
}

const schema = yup.object().shape({
  name: requiredOnly('name'),
  code: requiredOnly('branchCode'),
  country_id: requiredOnly('country'),
  institutionCode: requiredOnly('institution'),
});

const BranchForm = ({ editBranch, countries, closeForm }: IBranchForm) => {
  const { values, updateValue, errors, touched } = useFormValues(
    {
      name: editBranch?.name || '',
      code: editBranch?.code || '',
      country_id: '',
      institutionCode: '',
      // country_id: editBranch?.institution?.country_id || '',
      // institution_id: editBranch?.institution_id || '',
    },
    schema
  );
  const { showToast } = useToast();
  const { isISWUser } = useAuthService();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const { t } = useTranslation(['labels']);
  const actionStr = editBranch ? t('labels:edit') : t('labels:create');
  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { country_id, ...updatedValues } = values;

      setSubmitting(true);
      (editBranch ? updateBranch({ ...updatedValues, id: editBranch.id }) : createBranch(updatedValues))
        .then((data) => {
          // if (!data.success) return Promise.reject(data);

          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, editBranch, closeForm]
  );

  useEffect(() => {
    if (!isISWUser) return;

    getInstitutions({ country_id: values.country_id, pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [values.country_id, isISWUser]);

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
              label={t('labels:branchCode')}
              value={values.code}
              onChange={handleChange}
              error={Boolean(touched.code && errors?.code)}
              helperText={touched.code && errors?.code}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="branch-form-country-label">{t('labels:country')}</InputLabel>
              <Select
                name="country_id"
                labelId="branch-form-country-label"
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
          {isISWUser && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="branch-form-institution_id-label">{t('labels:institution')}</InputLabel>
                <Select
                  name="institutionCode"
                  labelId="branch-form-institution_id-label"
                  label={t('labels:institution')}
                  value={values.institutionCode}
                  onChange={handleChange}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  error={Boolean(touched.institutionCode && errors?.institutionCode)}
                >
                  <MenuItem value="">- Select -</MenuItem>
                  {institutions.map((inst) => (
                    <MenuItem key={inst.code} value={inst.code}>
                      {inst.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error={Boolean(errors?.institutionCode)}>
                  {touched.institutionCode && errors?.institutionCode}
                </FormHelperText>
              </FormControl>
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
};

export default BranchForm;
