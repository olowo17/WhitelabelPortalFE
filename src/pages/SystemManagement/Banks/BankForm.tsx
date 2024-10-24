import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { requiredOnly } from 'utils/validation';
import { IBank } from './Banks.model';
import { createBank, updateBank } from './Banks.service';

const schema = yup.object().shape({
  name: requiredOnly('name'),
  code: requiredOnly('code'),
});

interface IBankFormProps {
  closeForm: () => void;
  bank?: IBank;
}

const BankForm: React.FC<IBankFormProps> = (props) => {
  const { bank, closeForm } = props;
  const { values, updateValue, errors, touched } = useFormValues(
    {
      name: bank?.name || '',
      code: bank?.code || '',
    },
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = bank ? t('labels:update') : t('labels:create');
  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (bank ? updateBank({ ...values, bankID: bank.bankID }) : createBank(values))
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, bank, closeForm]
  );

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
};

export default BankForm;
