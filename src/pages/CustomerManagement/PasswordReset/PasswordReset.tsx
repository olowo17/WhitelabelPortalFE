import React, { useCallback, useState } from 'react';
import { Button, Card, Container, Grid, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { TableToolbar } from 'components/TableToolbar';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { SearchIcon } from 'components/appIcons';
import CustomerSelectInput from 'components/CustomerSelectInput';
import { useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import { IPasswordCustomer, ISearchPassword, ISearchPasswordForm } from './PasswordReset.model';
import { resetPassword, searchCustomer } from './PasswordReset.service';

const defaultCustomer: IPasswordCustomer = {
  customerName: '',
  primaryAccountNumber: '',
  username: '',
};

const schema = yup.object().shape(
  {
    accountNumber: yup.string().when(['customerNumber', 'username'], {
      is: (customerNumber: string, username: string) => !(customerNumber || username),
      then: requiredOnly('accountNumber'),
    }),
    customerNumber: yup.string().when(['accountNumber', 'username'], {
      is: (accountNumber: string, username: string) => !(accountNumber || username),
      then: requiredOnly('customer'),
    }),
    username: yup.string().when(['accountNumber', 'customerNumber'], {
      is: (accountNumber: string, customerNumber: string) => !(accountNumber || customerNumber),
      then: requiredOnly('username'),
    }),
  },
  // array of conflicts fields
  [
    ['accountNumber', 'customerNumber'],
    ['accountNumber', 'username'],
    ['customerNumber', 'username'],
  ]
);

const PasswordReset = () => {
  const { t } = useTranslation(['labels']);
  const { values, updateValue, updateValueByName, errors, touched, setTouched } = useFormValues<ISearchPasswordForm>(
    {},
    schema
  );
  const [customer, setCustomer] = useState<IPasswordCustomer>(defaultCustomer);
  const { showToast } = useToast();
  const [searching, setSearching] = useState(false);
  const [resetting, setResetting] = useState(false);

  const buildSearchBody = useCallback(
    (): ISearchPassword => ({
      pageNumber: 1,
      pageSize: 10,
      accountNumber: values.accountNumber,
      customerNumber: values.customerNumber,
      username: values.username,
    }),
    [values]
  );

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();

      const reqBody = buildSearchBody();

      setSearching(true);
      searchCustomer(reqBody)
        .then((data) => {
          setCustomer(data.customer);
        })
        .catch((err: IApiError) => {
          setCustomer(defaultCustomer);
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSearching(false));
    },
    [buildSearchBody]
  );

  const onResetSubmit = useCallback(
    (evt) => {
      evt.preventDefault();

      setResetting(true);
      resetPassword({ accountNumber: customer.primaryAccountNumber })
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setResetting(false));
    },
    [resetPassword, customer]
  );

  return (
    <DashboardLayout>
      <Page title={t('labels:passwordReset')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:passwordReset')}
            </Typography>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <CustomerSelectInput<ISearchPasswordForm>
                      values={values}
                      updateValueByName={updateValueByName}
                      errors={errors}
                      touched={touched}
                      setTouched={setTouched}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button type="submit" variant="contained" size="large" disabled={searching || Boolean(errors)}>
                      {searching ? <CircularProgress size={14} /> : <SearchIcon />} {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>
            <TableToolbar>
              <form onSubmit={onResetSubmit}>
                <Grid container direction="column" spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="customerName"
                      label={t('labels:customerName')}
                      value={customer.customerName}
                      onChange={updateValue}
                      fullWidth
                      disabled
                      sx={{ root: { bgcolor: 'text.disabled' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="username"
                      label={t('labels:username')}
                      value={customer.username}
                      onChange={updateValue}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="primaryAccountNumber"
                      label={t('labels:primaryAccountNumber')}
                      value={customer.primaryAccountNumber}
                      onChange={updateValue}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={searching || resetting || !customer.primaryAccountNumber}
                      fullWidth
                    >
                      {searching || resetting ? <CircularProgress size={14} /> : t('labels:reset')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export default PasswordReset;
