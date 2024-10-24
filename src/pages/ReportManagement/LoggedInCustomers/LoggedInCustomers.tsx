import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, Card, Container, FormControl, Grid, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { TableToolbar } from 'components/TableToolbar';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { SearchIcon } from 'components/appIcons';
import CustomDatePicker from 'components/CustomDatePicker';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { requiredOnly } from 'utils/validation';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { ILoggedCustomersValues, ILoggedCustomer, IGetLoggedCustomersBody } from './LoggedInCustomers.model';
import { getLoggedCustomers } from './LoggedInCustomers.service';

const schema = yup.object().shape({
  date: requiredOnly('date'),
  institutionCode: requiredOnly('institution'),
});

const LoggedInCustomers = () => {
  const { t } = useTranslation(['labels']);

  const { values, updateValueByName, errors, setExtErrors, touched, setTouched, updateDropdownValue } =
    useFormValues<ILoggedCustomersValues>({ date: '', institutionCode: '' }, schema);
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [recordsCount, setRecordsCount] = useState(0);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [customers, setCustomers] = useState<ILoggedCustomer[]>([]);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const columns: IAppTableColumn<ILoggedCustomer>[] = useMemo(() => {
    return (
      [
        { name: t('labels:name'), prop: 'customerName' },
        { name: t('labels:accountNumber'), prop: 'primaryAccountNumber' },
        { name: t('labels:username'), prop: 'username' },
        { name: t('labels:customerID'), prop: 'customerID' },
        { name: t('labels:lastLogin'), prop: 'lastLogin' },
      ] as (null | IAppTableColumn<ILoggedCustomer>)[]
    ).filter(Boolean) as IAppTableColumn<ILoggedCustomer>[];
  }, []);

  const fetchInstitutions = useCallback(() => {
    getInstitutions({ pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({
          message: err.description,
          type: 'error',
          hideAfter: null,
          buttons: [
            {
              text: 'Retry',
              onClick: (close) => {
                fetchInstitutions();
                close();
              },
            },
          ],
        });
      });
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (institutions.length) {
      const mappedArr = institutions.map((inst) => {
        const newInst = { label: inst.name, id: inst.id, code: inst.code };
        return newInst;
      });
      setMappedInst([...mappedArr]);
    }
  }, [institutions]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetLoggedCustomersBody => {
      const tbd = appTableRef.current;
      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        ...values,
      };
    },
    [values]
  );

  const searchLoggedCustomers = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getLoggedCustomers(reqBody)
        .then((data) => {
          setRecordsCount(data.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setCustomers(data.customers);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchLoggedCustomers(), [searchLoggedCustomers]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchLoggedCustomers(1);
    },
    [searchLoggedCustomers]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getLoggedCustomers(reqBody)
      .then((data) => {
        downloadDataCSV(mapRecordsToTableData(data.customers, columns, ['']), 'Logged-In Customers');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:loggedInCustomers')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:loggedInCustomers')}
            </Typography>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <CustomDatePicker
                      name="date"
                      label="date"
                      value={values.date}
                      updateValueByName={updateValueByName}
                      touched={touched.date}
                      setTouched={setTouched}
                      error={errors?.date}
                      setExtErrors={setExtErrors}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <Autocomplete
                        options={mappedInst}
                        onChange={(e, newValue) => {
                          updateDropdownValue('institutionCode', newValue?.code);
                        }}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id} value={option.code}>
                              {option.label}
                            </li>
                          );
                        }}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label={t('labels:institution')} />}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button type="submit" variant="contained" size="large" disabled={fetching || Boolean(errors)}>
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>
            <AppTable
              data={customers}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                customers.length ? (
                  <LoadingButton loading={downloading} onClick={download}>
                    Download
                  </LoadingButton>
                ) : null
              }
              withoutPreLoading
            />
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export default LoggedInCustomers;
