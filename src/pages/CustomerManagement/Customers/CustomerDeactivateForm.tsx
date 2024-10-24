import React, { FormEventHandler, useCallback, useState } from 'react';
import { Button, TextField } from '@mui/material';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import { useFormValues } from 'hooks/useFormValues';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { deactivateCustomer } from './Customers.service';

const schema = yup.object().shape({
  reason: yup.string().required(),
});

interface ICustomerDeactivateFormProps {
  closeForm: () => void;
  customerID: number;
}

const CustomerDeactivateForm: React.FC<ICustomerDeactivateFormProps> = (props) => {
  const { closeForm, customerID } = props;
  const { values, updateAnyValue, errors, touched } = useFormValues({ reason: '' }, schema);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(['labels']);
  const { showToast } = useToast();

  const submitForm: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      setLoading(true);
      deactivateCustomer(customerID, values.reason)
        .then((dt) => {
          showToast({ message: dt.description, type: 'success' });
          closeForm();
        })
        .catch((err: IApiError) => showToast({ message: err.description, type: 'error' }))
        .finally(() => setLoading(false));
    },
    [closeForm, customerID, values.reason]
  );

  const close = useCallback(() => closeForm(), [closeForm]);

  return (
    <form onSubmit={submitForm}>
      <TextField
        name="reason"
        value={values.reason}
        onChange={updateAnyValue}
        error={Boolean(touched.reason && errors?.reason)}
        helperText={touched.reason && errors?.reason}
        label={t('labels:reason')}
        multiline
        minRows={5}
        maxRows={5}
        fullWidth
      />

      <div style={{ marginTop: 50, textAlign: 'right' }}>
        <LoadingButton type="submit" color="error" variant="contained" loading={loading}>
          Deactivate
        </LoadingButton>
        <Button type="button" onClick={close} variant="contained">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CustomerDeactivateForm;
