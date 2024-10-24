import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import useToast from 'hooks/useToast';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly, validateLimit } from 'utils/validation';
import { IApiError } from 'models';
import { IGlobalLimit, IUpdateGlobalLimit } from './GlobalLimits.model';
import { updateGlobalLimit } from './GlobalLimits.service';

interface IGlobalLimitsFormProps {
  closeForm: () => void;
  limit?: IGlobalLimit;
}

const GlobalLimitsForm = ({ limit, closeForm }: IGlobalLimitsFormProps) => {
  const schema = yup.object().shape({
    dailyLimit: limit ? validateLimit('dailyLimit', limit.dailyLimitMax) : requiredOnly('dailyLimit'),
    transactionLimit: limit ? validateLimit('transactionLimit', limit.transactionLimitMax) : yup.number(),
  });
  const { values, updateValue, errors, touched } = useFormValues<IUpdateGlobalLimit>(
    {
      dailyLimit: limit?.dailyLimit || '',
      institutionCode: limit?.institutionCode || '',
      transactionLimit: limit?.transactionLimit || limit?.transactionLimitMax || '',
      level: limit?.level || 0,
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
      updateGlobalLimit({ ...values, transactionLimit: +values.transactionLimit, dailyLimit: +values.dailyLimit })
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
          <Grid item xs={12} md={3}>
            <TextField
              name="dailyLimit"
              label={t('labels:kycLevel')}
              value={limit ? limit.levelText : ''}
              fullWidth
              disabled
            />
            {/* <Stack alignItems="center" spacing={1}>
              <Typography>{t('labels:kycLevel')}</Typography>
              <Typography>{limit ? limitLevels[limit.level - 1] : ''}</Typography>
            </Stack> */}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="dailyLimit"
              label={t('labels:dailyLimit')}
              value={values.dailyLimit}
              onChange={handleChange}
              error={Boolean(touched.dailyLimit && errors?.dailyLimit)}
              helperText={touched.dailyLimit && errors?.dailyLimit}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="transactionLimit"
              label={t('labels:transactionLimit')}
              placeholder={limit?.transactionLimitMax.toString()}
              value={values.transactionLimit}
              onChange={handleChange}
              error={Boolean(touched.transactionLimit && errors?.transactionLimit)}
              helperText={touched.transactionLimit && errors?.transactionLimit}
              InputLabelProps={{ shrink: true }}
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

export default GlobalLimitsForm;
