import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import useToast from 'hooks/useToast';
import { useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import { IApiError } from 'models';
import { ICategory, ICreateCategory, IUpdateCategory } from './Categories.model';
import { createCategory, updateCategory } from './Categories.service';

const schema = yup.object().shape({
  name: requiredOnly('name'),
  code: requiredOnly('code'),
});

interface ICategoryFormProps {
  closeForm: () => void;
  category?: ICategory;
}

const CategoryForm: React.FC<ICategoryFormProps> = ({ category, closeForm }) => {
  const { values, updateValue, errors, touched } = useFormValues<ICreateCategory | IUpdateCategory>(
    {
      categoryID: category?.categoryID,
      code: category?.code || '',
      name: category?.name || '',
    },
    schema
  );
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = category ? t('labels:edit') : t('labels:create');

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (category ? updateCategory(values as IUpdateCategory) : createCategory(values))
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, category, closeForm]
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
              onChange={updateValue}
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
              onChange={updateValue}
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

export default CategoryForm;
