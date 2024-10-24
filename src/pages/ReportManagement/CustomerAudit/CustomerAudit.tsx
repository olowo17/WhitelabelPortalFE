import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { TableToolbar } from 'components/TableToolbar';
import useAuthService from 'hooks/useAuthService';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { SearchIcon } from 'components/appIcons';
import CustomDatePicker from 'components/CustomDatePicker';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import CustomerSelectInput from 'components/CustomerSelectInput';
import {
  ISearchCustomerAudits,
  ICustomerAudit,
  CustomerAuditsStatuses,
  IGetCustomerAuditsBody,
} from './CustomerAudit.model';
import { getCustomerAuditColor, getCustomerAudits, getCustomerAuditTypes } from './CustomerAudit.servise';

const schema = yup.object().shape({
  endDate: yup.string(),
  startDate: yup.string(),
  methodName: yup.string(),
  customerNumber: yup.string(),
  username: yup.string(),
  accountNumber: yup.string(),
});

const CustomerAudit = () => {
  const { isISWUser } = useAuthService();
  const { t } = useTranslation(['labels']);

  const { values, updateValueByName, updateAnyValue, errors, setExtErrors, touched, setTouched } =
    useFormValues<ISearchCustomerAudits>({ startDate: '', endDate: '' }, schema);
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const [customerAuditTypes, setCustomerAuditTypes] = useState<string[]>([]);
  const [customerAudits, setCustomerAudits] = useState<ICustomerAudit[]>([]);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const columns: IAppTableColumn<ICustomerAudit>[] = useMemo(() => {
    return (
      [
        { name: t('labels:auditDate'), prop: 'dateCreated' },
        { name: t('labels:username'), prop: 'username' },
        { name: t('labels:accountNumber'), prop: 'accountNumber' },
        { name: t('labels:email'), prop: 'email' },
        { name: t('labels:customerNumber'), prop: 'customerNumber' },
        { name: t('labels:osType'), prop: 'osType' },
        { name: t('labels:methodName'), prop: 'methodName' },
        { name: t('labels:phoneNumber'), prop: 'phoneNumber' },
        { name: t('labels:deviceType'), prop: 'deviceType' },
        { name: t('labels:currentLimit'), prop: 'currentLimit' },
        { name: t('labels:newLimit'), prop: 'newLimit' },
        {
          name: t('labels:status'),
          prop: 'status',
          renderCell: (status: CustomerAuditsStatuses) => (
            <Chip label={status} color={getCustomerAuditColor(status)} size="small" />
          ),
        },
      ] as (null | IAppTableColumn<ICustomerAudit>)[]
    ).filter(Boolean) as IAppTableColumn<ICustomerAudit>[];
  }, [isISWUser]);

  useEffect(() => {
    getCustomerAuditTypes()
      .then((typesData) => setCustomerAuditTypes(typesData.data))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetCustomerAuditsBody => {
      const tbd = appTableRef.current;
      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        ...values,
      };
    },
    [values]
  );

  const searchCustomerAudit = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getCustomerAudits(reqBody)
        .then((data) => {
          setRecordsCount(data.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setCustomerAudits(data.customerAuditInfos);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchCustomerAudit(), [searchCustomerAudit]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchCustomerAudit(1);
    },
    [searchCustomerAudit]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getCustomerAudits(reqBody)
      .then((data) => {
        downloadDataCSV(mapRecordsToTableData(data.customerAuditInfos, columns, ['']), 'CustomerAudit');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:customerAudit')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:customerAudit')}
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
                      <InputLabel id="search-trans_type-label">{t('labels:methodName')}</InputLabel>
                      <Select
                        name="methodName"
                        labelId="search-trans_type-label"
                        label={t('labels:methodName')}
                        value={values.methodName}
                        onChange={updateAnyValue}
                      >
                        <MenuItem value="">All</MenuItem>
                        {customerAuditTypes.map((customerAuditType: string) => (
                          <MenuItem key={customerAuditType} value={customerAuditType}>
                            {customerAuditType}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomerSelectInput<ISearchCustomerAudits>
                      values={values}
                      updateValueByName={updateValueByName}
                      setTouched={setTouched}
                    />
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
              data={customerAudits}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                customerAudits.length ? (
                  <LoadingButton loading={downloading} onClick={download}>
                    Download
                  </LoadingButton>
                ) : null
              }
            />
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export default CustomerAudit;
