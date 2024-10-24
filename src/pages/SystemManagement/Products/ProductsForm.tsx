import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { createProduct, updateProduct } from './Products.service';
import { IBiller, ICreateProduct, IProduct, IUpdateProduct } from './Products.model';

interface IProductForm {
  billers: IBiller[];
  editedProduct: IProduct | undefined;
  closeForm: () => void;
}

const schema = yup.object().shape({
  name: requiredOnly('name'),
  code: requiredOnly('productCode'),
  minAmount: requiredOnly('minAmount'),
  maxAmount: requiredOnly('maxAmount'),
  billerID: requiredOnly('biller'),
});

const ProductForm = ({ editedProduct, billers, closeForm }: IProductForm) => {
  const { values, updateValue, errors, touched } = useFormValues(
    editedProduct
      ? ({
          name: editedProduct.name,
          code: editedProduct.code,
          minAmount: editedProduct.minAmount,
          maxAmount: editedProduct.maxAmount,
          billerID: editedProduct.billerID,
          productID: editedProduct.productID,
        } as IUpdateProduct)
      : ({} as ICreateProduct),
    schema
  );
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = editedProduct ? t('labels:edit') : t('labels:create');

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (editedProduct ? updateProduct(values as IUpdateProduct) : createProduct(values as ICreateProduct))
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, editedProduct, closeForm]
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
          <Grid item xs={12} md={4}>
            <TextField
              name="minAmount"
              label={t('labels:minimumAmount')}
              value={values.minAmount}
              onChange={handleChange}
              error={Boolean(touched.minAmount && errors?.minAmount)}
              helperText={touched.minAmount && errors?.minAmount}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="maxAmount"
              label={t('labels:maximumAmount')}
              value={values.maxAmount}
              onChange={handleChange}
              error={Boolean(touched.maxAmount && errors?.maxAmount)}
              helperText={touched.maxAmount && errors?.maxAmount}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="product-form-biller-label">{t('labels:biller')}</InputLabel>
              <Select
                name="billerID"
                labelId="product-form-biller-label"
                label={t('labels:biller')}
                value={values.billerID}
                onChange={handleChange}
                error={Boolean(touched.billerID && errors?.billerID)}
              >
                <MenuItem value="">- Select -</MenuItem>
                {billers.map((biller) => (
                  <MenuItem key={biller.billerID} value={biller.billerID}>
                    {biller.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText error={Boolean(errors?.billerID)}>{touched.billerID && errors?.billerID}</FormHelperText>
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

export default ProductForm;
