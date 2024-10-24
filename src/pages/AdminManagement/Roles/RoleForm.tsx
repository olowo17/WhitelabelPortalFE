import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import useToast from 'hooks/useToast';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import { IApiError } from 'models';
import { IInstitution } from 'pages/AdminManagement/Institutions/Institutions.model';
import { IUser } from 'pages/Authorization/Login/login.model';
import { ICountry } from '../Countries/Countries.model';
import { getCountries } from '../Countries/Countries.service';
import { getInstitutions } from '../Institutions/Institutions.service';
import { createRole, updateRole } from './Roles.service';
import { ICreateRoleSearch, IRole } from './Roles.model';

const schema = yup.object().shape({
  name: requiredOnly('name'),
  description: requiredOnly('description'),
});

interface IRoleFormProps {
  closeForm: () => void;
  role?: IRole;
  searchRoles: (pageNumber?: number) => void;
  isISWUser: boolean;
  authUser: IUser;
}

const RoleForm: React.FC<IRoleFormProps> = ({ role, closeForm, searchRoles, isISWUser, authUser }) => {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const { values, updateValue, errors, touched } = useFormValues<ICreateRoleSearch>(
    {
      description: role?.description || '',
      name: role?.name || '',
      country_id: '',
      institutionCode: isISWUser ? '' : authUser.institution.code,
    },
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = role ? t('labels:edit') : t('labels:create');

  useEffect(() => {
    if (!isISWUser) return;

    getCountries()
      .then((countriesData) => setCountries(countriesData.countries))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [isISWUser]);

  useEffect(() => {
    if (!isISWUser) return;

    getInstitutions({ country_id: values.country_id, pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [values.country_id, isISWUser]);

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      const { institutionCode, ...pureValues } = values;
      const createValues = { ...pureValues, institutionCode };
      setSubmitting(true);
      (role ? updateRole({ ...pureValues, roleId: role.roleID }) : createRole(createValues))
        .then((res) => {
          searchRoles();
          showToast({ message: res.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, role, closeForm]
  );

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
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

          <Grid item xs={12} md={3}>
            <TextField
              name="description"
              label={t('labels:description')}
              value={values.description}
              onChange={handleChange}
              error={Boolean(touched.description && errors?.description)}
              helperText={touched.description && errors?.description}
              fullWidth
            />
          </Grid>

          {isISWUser && !role && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="rf-search-country-label">{t('labels:country')}</InputLabel>
                <Select
                  name="country_id"
                  labelId="rf-search-country-label"
                  label={t('labels:country')}
                  value={values.country_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {countries.map((ctry) => (
                    <MenuItem key={ctry.id} value={ctry.id}>
                      {ctry.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {isISWUser && !role && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="rf-search-role-label">{t('labels:institution')}</InputLabel>
                <Select
                  name="institutionCode"
                  labelId="rf-search-role-label"
                  label={t('labels:institution')}
                  value={values.institutionCode}
                  onChange={handleChange}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  <MenuItem value="">All</MenuItem>
                  {institutions.map((inst) => (
                    <MenuItem key={inst.code} value={inst.code}>
                      {inst.name}
                    </MenuItem>
                  ))}
                </Select>
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

export default RoleForm;
