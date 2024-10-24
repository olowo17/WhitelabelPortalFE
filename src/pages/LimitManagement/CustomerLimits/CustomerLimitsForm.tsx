import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import useToast from 'hooks/useToast';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import { IApiError } from 'models';
import { ICustomerInfo, ICustomerLimit, IUpdateCustomerLimit } from './CustomerLimits.model';
import { updateCustomerLimit } from './CustomerLimits.service';

const schema = yup.object().shape({
  name: requiredOnly('name'),
  amount: requiredOnly('amount'),
});

interface ICustomerLimitsFormProps {
  closeForm: () => void;
  customer?: ICustomerInfo;
  limit?: ICustomerLimit;
}

const CustomerLimitsForm = ({ customer, limit, closeForm }: ICustomerLimitsFormProps) => {
  const { values, updateValue, errors, touched } = useFormValues<IUpdateCustomerLimit>(
    {
      name: limit?.name || '',
      amount: limit?.amount || 0,
    },
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      updateCustomerLimit(values, customer?.customerID || 0)
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

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              name="name"
              label={t('labels:limitType')}
              value={values.name}
              onChange={handleChange}
              error={Boolean(touched.name && errors?.name)}
              helperText={touched.name && errors?.name}
              fullWidth
              disabled
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              name="amount"
              label={t('labels:dailyCumulativeTransactionLimit')}
              value={values.amount}
              onChange={handleChange}
              error={Boolean(touched.amount && errors?.amount)}
              helperText={touched.amount && errors?.amount}
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
          Save
        </LoadingButton>
      </form>
    </Box>
  );
};

export default CustomerLimitsForm;
