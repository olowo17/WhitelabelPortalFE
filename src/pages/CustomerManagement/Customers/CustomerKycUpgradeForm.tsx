import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { ICustomer, IKycUpgradeBody } from './Customers.model';
import { kycUpgrade } from './Customers.service';

interface IKycUpgradeForm {
  editedCustomer: ICustomer;
  closeForm: () => void;
}

const schema = yup.object().shape({
  canTransact: yup.boolean(),
  kycLevel: yup.number().required('kycLevel'),
});

const CustomerKycUpgradeForm = ({ editedCustomer, closeForm }: IKycUpgradeForm) => {
  const { values, updateValue, errors } = useFormValues<IKycUpgradeBody>(
    {
      customerNumber: editedCustomer?.customerNumber,
      canTransact: editedCustomer?.transactional || false,
      kycLevel: editedCustomer?.kycLevel || 1,
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
      kycUpgrade(values)
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, editedCustomer, closeForm]
  );

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox
                  name="canTransact"
                  checked={values.canTransact}
                  onChange={handleChange}
                  disabled={submitting}
                />
              }
              label={<Typography variant="h6">{t('labels:canTransact')}</Typography>}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="cs-kyc-level-label">{t('labels:kycLevel')}</InputLabel>
              <Select
                name="kycLevel"
                labelId="cs-kyc-level-label"
                label={t('labels:kycLevel')}
                value={values.kycLevel}
                onChange={handleChange}
                disabled={submitting}
              >
                {['0', 1, 2, 3].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <LoadingButton
          type="submit"
          variant="contained"
          sx={{ marginTop: 2 }}
          loading={submitting}
          disabled={Boolean(errors)}
        >
          {t('labels:edit')}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default CustomerKycUpgradeForm;
