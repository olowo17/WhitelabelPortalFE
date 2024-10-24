import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import Page from 'components/Page';
import { SearchIcon } from 'components/appIcons';
import { TableToolbar } from 'components/TableToolbar';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import AppModal from 'components/AppModal';
import CustomDatePicker from 'components/CustomDatePicker';
import CustomerSelectInput from 'components/CustomerSelectInput';
import useAuthService from 'hooks/useAuthService';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { ICustomer, IGetCustomersBody, IRegStatus, ISearchCustomers } from './Customers.model';
import {
  activateCustomer,
  getCustomers,
  getRegistrationStatuses,
  releaseCustomer,
  resetCounter,
  toggleTransactional,
} from './Customers.service';
import CustomersActionMenu from './CustomersActionMenu';
import CustomerDeactivateForm from './CustomerDeactivateForm';
import CustomerKycUpgradeForm from './CustomerKycUpgradeForm';

interface ICustomersProps {
  setup: boolean;
}

const statusClassMap: Record<string, string> = {
  ACTIVE: 'success',
  PENDING_REGISTRATION: 'warning',
  INACTIVE: 'error',
};

const schema = yup.object().shape({
  endDate: yup.string(),
  startDate: yup.string(),
});

const Customers: React.FC<ICustomersProps> = () => {
  const { isISWUser } = useAuthService();
  const { values, updateValue, updateValueByName, errors, setExtErrors, touched, setTouched, updateDropdownValue } =
    useFormValues<ISearchCustomers>(
      {
        institutionCode: '',
        regStatus: 'ALL',
        startDate: '',
        endDate: '',
      },
      schema
    );
  const handleChange = useAnyUpdateValue(updateValue);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [regStatuses, setRegStatuses] = useState<IRegStatus[]>([{ name: 'All', code: 'ALL' }]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<ICustomer | undefined>(undefined);
  const [deactivateCustID, setDeactivateCustID] = useState(0);
  const closeDeactivateMdl = useCallback(() => setDeactivateCustID(0), []);
  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const [openCustomerDetails, setOpenCustomerDetails] = useState(false);
  const [openKycModal, setOpenKycModal] = useState(false);
  useEffect(() => {
    if (institutions.length) {
      const mappedArr = institutions.map((inst) => {
        const newInst = { label: inst.name, id: inst.id, code: inst.code };
        return newInst;
      });
      setMappedInst([{ label: 'All', id: 'All', code: 'All' }, ...mappedArr]);
    }
  }, [institutions]);

  const viewCustomer = useCallback((customer: ICustomer) => {
    setOpenCustomerDetails(true);
    setTargetCustomer(customer);
  }, []);

  const closeViewModal = useCallback(() => {
    setTargetCustomer(undefined);
    setOpenCustomerDetails(false);
  }, []);

  const handleKycOpen = useCallback((editedCustomer: ICustomer) => {
    setTargetCustomer(editedCustomer);
    setOpenKycModal(true);
  }, []);
  const handleKycClose = useCallback(() => {
    setOpenKycModal(false);
    setTargetCustomer(undefined);
  }, []);

  const fetchRegStatus = useCallback(() => {
    getRegistrationStatuses()
      .then((rsData) => {
        setRegStatuses(rsData.regStatuses);
      })
      .catch((err: IApiError) => {
        showToast({
          message: err.description,
          type: 'error',
          buttons: [
            {
              text: 'Retry',
              onClick: (close) => {
                fetchRegStatus();
                close();
              },
            },
          ],
        });
      });
  }, []);

  const fetchInstitutions = useCallback(() => {
    if (!isISWUser) return;

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
  }, [isISWUser]);

  // fetch institutions
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // fetch registration statuses
  useEffect(() => {
    fetchRegStatus();
  }, []);

  const doDeactivateCustomer = useCallback((customerId: number) => setDeactivateCustID(customerId), []);

  const doActivateCustomer = useCallback(
    (customerId: number) =>
      activateCustomer(customerId)
        .then((dt) => showToast({ message: dt.description, type: 'success' }))
        .catch((err: IApiError) => showToast({ message: err.description, type: 'error' })),
    []
  );

  const doToggleTransactional = useCallback(
    (customerId: number) =>
      toggleTransactional(customerId)
        .then((dt) => showToast({ message: dt.description, type: 'success' }))
        .catch((err: IApiError) => showToast({ message: err.description, type: 'error' })),
    []
  );

  const doReleaseCustomer = useCallback(
    (customerId: number) =>
      releaseCustomer(customerId)
        .then((dt) => showToast({ message: dt.description, type: 'success' }))
        .catch((err: IApiError) => showToast({ message: err.description, type: 'error' })),
    []
  );

  const doResetCounter = useCallback(
    (customerId: number) =>
      resetCounter(customerId)
        .then((dt) => showToast({ message: dt.description, type: 'success' }))
        .catch((err: IApiError) => showToast({ message: err.description, type: 'error' })),
    []
  );

  const columns: IAppTableColumn<ICustomer>[] = useMemo(() => {
    return (
      [
        {
          name: t('labels:regDate'),
          prop: 'regStarted',
        },
        {
          name: t('labels:lastLogin'),
          prop: 'lastLogin',
        },
        {
          name: t('labels:accountNumber'),
          prop: 'primaryAccountNumber',
        },
        {
          name: t('labels:name'),
          prop: 'customerName',
        },
        {
          name: t('labels:username'),
          prop: 'username',
        },
        {
          name: t('labels:customerNumber'),
          prop: 'customerNumber',
        },
        isISWUser
          ? {
              name: t('labels:institutionCode'),
              prop: 'institutionCode',
            }
          : null,
        {
          name: t('labels:regStatus'),
          prop: 'regStatus',
          renderCell: (regStatus: string) => (
            <Chip label={regStatus} color={statusClassMap[regStatus] as any | 'error'} size="small" />
          ),
        },
        {
          name: t('labels:status'),
          prop: 'enabled',
          renderCell: (isEnabled: boolean) => (
            <Chip
              label={t(isEnabled ? 'labels:active' : 'labels:inactive')}
              color={isEnabled ? 'success' : 'error'}
              size="small"
            />
          ),
        },
        {
          name: '',
          prop: 'customerID',
          renderCell: (id, customer) => (
            <CustomersActionMenu
              id={id}
              customer={customer}
              viewCustomer={viewCustomer}
              doDeactivateCustomer={doDeactivateCustomer}
              doActivateCustomer={doActivateCustomer}
              doToggleTransactional={doToggleTransactional}
              doReleaseCustomer={doReleaseCustomer}
              doResetCounter={doResetCounter}
              doKycOpen={handleKycOpen}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<ICustomer>)[]
    ).filter(Boolean) as IAppTableColumn<ICustomer>[];
  }, [isISWUser]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetCustomersBody => {
      const tbd = appTableRef.current;
      pageNumber = pageNumber || tbd.pageNumber + 1;
      pageSize = pageSize || tbd.pageSize;

      return {
        pageNumber,
        pageSize,
        ...values,
        institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode,
      };
    },
    [values]
  );

  const searchCustomers = useCallback(
    (pageNumber?: number) => {
      const reqBody: IGetCustomersBody = buildSearchBody(pageNumber);

      setFetching(true);
      getCustomers(reqBody)
        .then((cData) => {
          setRecordsCount(cData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setCustomers(cData.customers);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchCustomers(), [searchCustomers]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchCustomers(1);
    },
    [searchCustomers]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetCustomersBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getCustomers(reqBody)
      .then((cData) => {
        downloadDataCSV(mapRecordsToTableData(cData.customers, columns, ['']), 'Roles');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  const targetCustomerPreview = useMemo(
    () =>
      targetCustomer
        ? Object.keys(targetCustomer.additionalParams).map((key) => (
            <Grid key={key} container>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ padding: 1, fontWeight: 'bold' }}>{key}</Box>
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Box sx={{ padding: 1 }}>{targetCustomer.additionalParams[key]?.toString()}</Box>
              </Grid>
            </Grid>
          ))
        : null,
    [targetCustomer]
  );

  return (
    <DashboardLayout>
      <Page title={t('labels:customers')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:customers')}
            </Typography>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <CustomDatePicker
                      name="startDate"
                      label="startDate"
                      value={values.startDate}
                      updateValueByName={updateValueByName}
                      touched={touched.startDate}
                      setTouched={setTouched}
                      error={errors?.startDate}
                      setExtErrors={setExtErrors}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomDatePicker
                      name="endDate"
                      label="endDate"
                      value={values.endDate}
                      updateValueByName={updateValueByName}
                      touched={touched.endDate}
                      setTouched={setTouched}
                      error={errors?.endDate}
                      setExtErrors={setExtErrors}
                      minDate={values.startDate ? new Date(values.startDate) : undefined}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="cs-search-reg-status-label">{t('labels:regStatus')}</InputLabel>
                      <Select
                        name="regStatus"
                        labelId="cs-search-reg-status-label"
                        label={t('labels:regStatus')}
                        value={values.regStatus}
                        onChange={handleChange}
                      >
                        {regStatuses.map((regStatus) => (
                          <MenuItem key={regStatus.code} value={regStatus.code}>
                            {regStatus.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomerSelectInput<ISearchCustomers>
                      values={values}
                      updateValueByName={updateValueByName}
                      setTouched={setTouched}
                    />
                  </Grid>
                  {isISWUser && (
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
                  )}
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
              keyProp="customerID"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {customers.length ? (
                    <LoadingButton loading={downloading} onClick={download}>
                      Download
                    </LoadingButton>
                  ) : null}
                </>
              }
            />
          </Card>
        </Container>
      </Page>

      <AppModal
        open={Boolean(deactivateCustID)}
        onClose={closeDeactivateMdl}
        title={t('labels:deactivate') + ' ' + t('labels:customer')}
        size="md"
      >
        <CustomerDeactivateForm customerID={deactivateCustID} closeForm={closeDeactivateMdl} />
      </AppModal>

      <AppModal
        open={openCustomerDetails && Boolean(targetCustomer)}
        onClose={closeViewModal}
        title={t('labels:view') + ' ' + t('labels:customer')}
        size="md"
      >
        <Box>{targetCustomerPreview}</Box>
      </AppModal>

      <AppModal
        open={openKycModal && Boolean(targetCustomer)}
        onClose={handleKycClose}
        title={t('labels:upgradeKyc')}
        size="md"
      >
        <CustomerKycUpgradeForm closeForm={handleKycClose} editedCustomer={targetCustomer as ICustomer} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Customers;
