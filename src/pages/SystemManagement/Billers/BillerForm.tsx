import React, { useCallback, useState } from 'react';
import { Avatar, Box, Button, FormControl, FormHelperText, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useFormValues } from 'hooks/useFormValues';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { requiredOnly } from 'utils/validation';
import { readFileAsBase64 } from 'utils/utils';
import { IBiller, ICreateBiller } from './Billers.model';
import { createBiller, updateBiller } from './Billers.service';

const schema = yup.object().shape({
  name: requiredOnly('name'),
  code: requiredOnly('code'),
  gatewayCode: requiredOnly('gatewayCode'),
  label: requiredOnly('label'),
  charge: requiredOnly('charge'),
  categoryID: requiredOnly('categoryID'),
  defaultProductCode: requiredOnly('defaultProductCode'),
  imageUrl: requiredOnly('image'),
});

interface IBillerFormProps {
  closeForm: () => void;
  biller?: IBiller;
}

const BillerForm: React.FC<IBillerFormProps> = (props) => {
  const { biller, closeForm } = props;
  const { values, updateAnyValue, errors, touched, updateValueByName } = useFormValues<ICreateBiller>(
    {
      name: biller?.name || '',
      code: biller?.code || '',
      gatewayCode: biller?.gatewayCode || '',
      label: biller?.label || '',
      charge: biller?.charge.toString() || '',
      categoryID: biller?.categoryID.toString() || '',
      defaultProductCode: biller?.defaultProductCode || '',
      imageUrl: biller?.imageUrl || '',
    },
    schema
  );
  const { t } = useTranslation(['labels']);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const actionStr = biller ? t('labels:update') : t('labels:create');

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (biller ? updateBiller({ ...values, billerID: biller.billerID.toString() }) : createBiller(values))
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, biller, closeForm]
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
        updateValueByName('imageUrl', parts[parts.length - 1]);
      })
      .catch((err) => {
        showToast({ message: err, type: 'error' });
        updateValueByName('imageUrl', '');
      });
  }, []);

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              name="name"
              label={t('labels:name')}
              value={values.name}
              onChange={updateAnyValue}
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
              onChange={updateAnyValue}
              error={Boolean(touched.code && errors?.code)}
              helperText={touched.code && errors?.code}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="gatewayCode"
              label={t('labels:gatewayCode')}
              value={values.gatewayCode}
              onChange={updateAnyValue}
              error={Boolean(touched.gatewayCode && errors?.gatewayCode)}
              helperText={touched.gatewayCode && errors?.gatewayCode}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="charge"
              label={t('labels:charge')}
              value={values.charge}
              onChange={updateAnyValue}
              error={Boolean(touched.charge && errors?.charge)}
              helperText={touched.charge && errors?.charge}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="label"
              label={t('labels:label')}
              value={values.label}
              onChange={updateAnyValue}
              error={Boolean(touched.label && errors?.label)}
              helperText={touched.label && errors?.label}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="categoryID"
              label={t('labels:categoryID')}
              value={values.categoryID}
              onChange={updateAnyValue}
              error={Boolean(touched.categoryID && errors?.categoryID)}
              helperText={touched.categoryID && errors?.categoryID}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="defaultProductCode"
              label={t('labels:defaultProductCode')}
              value={values.defaultProductCode}
              onChange={updateAnyValue}
              error={Boolean(touched.defaultProductCode && errors?.defaultProductCode)}
              helperText={touched.defaultProductCode && errors?.defaultProductCode}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Grid container>
                <Grid item xs={8}>
                  <Button variant="text" component="label" fullWidth size="large">
                    Upload Image
                    <input type="file" name="imageSelector" onChange={changeSelectedImage} hidden accept="image/*" />
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  {values.imageUrl && (
                    <Avatar
                      src={'data:image/jpeg;base64,' + values.imageUrl}
                      variant="rounded"
                      imgProps={{ style: { objectFit: 'contain' } }}
                    />
                  )}
                </Grid>
              </Grid>
              <FormHelperText error={Boolean(errors?.imageUrl)}>{touched.imageUrl && errors?.imageUrl}</FormHelperText>
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
          {actionStr}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default BillerForm;
