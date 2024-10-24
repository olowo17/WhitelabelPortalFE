import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, TextField } from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { requiredOnly } from 'utils/validation';
import { ICountry, ICreateCountryBody } from './Countries.model';
import { updateCountry, createCountry } from './Countries.service';

interface ICountryFormProps {
  closeForm: () => void;
  editedCountry?: ICountry;
}

const schema = yup.object().shape({
  name: requiredOnly('name'),
  code: requiredOnly('code'),
});

const CountryForm = ({ editedCountry, closeForm }: ICountryFormProps) => {
  const { values, updateValue, errors, touched } = useFormValues<ICreateCountryBody>(
    {
      name: editedCountry?.name || '',
      code: editedCountry?.code || '',
    },
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = editedCountry ? t('labels:edit') : t('labels:create');
  // const actionCountryStr = editedCountry ? t('labels:editCountry') : t('labels:createCountry');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (editedCountry ? updateCountry({ ...values, id: editedCountry.id }) : createCountry({ ...values }))
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

  const boxContent = (
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
              label={t('labels:code')}
              value={values.code}
              onChange={handleChange}
              error={Boolean(touched.code && errors?.code)}
              helperText={touched.code && errors?.code}
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

  return <Box>{boxContent}</Box>;
};

export default CountryForm;
