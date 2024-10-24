import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
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
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { TableToolbar } from 'components/TableToolbar';
import useAuthService from 'hooks/useAuthService';
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { SearchIcon } from 'components/appIcons';
import CustomDatePicker from 'components/CustomDatePicker';
import { downloadDataCSV, formatDate, mapRecordsToTableData } from 'utils/utils';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { requiredOnly } from 'utils/validation';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import {
  ISearchTransactions,
  ISearchTransactionsBody,
  ITransaction,
  ITransactionType,
  TransactionsStatuses,
} from './Transactions.model';
import {
  getTransactionChannels,
  getTransactionColor,
  getTransactions,
  getTransactionTypes,
} from './Transactions.servise';
import TransactionsActionMenu from './TransactionsActionMenu';

const today = new Date();
const dateFormat = 'YYYY-MM-DD';
const endDate = formatDate(today, true, dateFormat);
const startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), false, dateFormat);

const defaultTransTypeCode = 'OWN-TRANSFER';

const schema = yup.object().shape({
  endDate: requiredOnly('endDate'),
  startDate: requiredOnly('startDate'),
  transTypeCode: requiredOnly('transactionType'),
  transactionChannel: yup.string(),
  transRef: yup.string(),
  institutionCode: yup.string(),
  sourceAccount: yup.string(),
});

const Transactions = () => {
  const { isISWUser, authUser } = useAuthService();
  const { t } = useTranslation(['labels']);

  const {
    values,
    updateValue,
    updateValueByName,
    updateAnyValue,
    errors,
    setExtErrors,
    touched,
    setTouched,
    updateDropdownValue,
  } = useFormValues<ISearchTransactions>(
    {
      startDate,
      endDate,
      transTypeCode: defaultTransTypeCode,
      transRef: '',
      institutionCode: '',
      sourceAccount: '',
      channel: '',
    },
    schema
  );
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const [transactionTypes, setTransactionTypes] = useState<ITransactionType[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const columns: IAppTableColumn<ITransaction>[] = useMemo(() => {
    return (
      [
        { name: t('labels:date'), prop: 'date' },
        { name: t('labels:sourceAccount'), prop: 'sourceAccount' },
        { name: t('labels:amount'), prop: 'amount' },
        { name: t('labels:destinationAccountOrMobileNumber'), prop: 'destinationAccountOrMobileNumber' },
        { name: t('labels:reference'), prop: 'transactionReference' },
        {
          name: t('labels:status'),
          prop: 'status',
          renderCell: (status: TransactionsStatuses) => (
            <Chip label={status} color={getTransactionColor(status)} size="small" />
          ),
        },
        { name: t('labels:responseCode'), prop: 'responseCode' },
        { name: t('labels:channel'), prop: 'transactionChannel' },
        { name: t('labels:responseDescription'), prop: 'responseDescription' },
        {
          name: '',
          prop: 'id',
          renderCell: (id, transaction) => <TransactionsActionMenu id={id} transaction={transaction} />,
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<ITransaction>)[]
    ).filter(Boolean) as IAppTableColumn<ITransaction>[];
  }, [isISWUser]);

  const fetchInstitutions = useCallback(() => {
    getInstitutions({ pageNumber: 1, country_id: '1' })
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
    getTransactionTypes()
      .then((typesData) => setTransactionTypes(typesData.transactionTypes))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  useEffect(() => {
    getTransactionChannels()
      .then((channelData) => setChannels(channelData.channels))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  useEffect(() => {
    if (institutions.length) {
      const mappedArr: IMappedOption[] | any[] = isISWUser ? [{ label: 'All', id: 'All', code: 'All' }] : [];
      institutions.map((inst) => {
        if (isISWUser || inst.name === authUser.institution.name) {
          mappedArr.push({ label: inst.name, id: inst.id, code: inst.code });
        }
      });
      setMappedInst([...mappedArr]);
    }
  }, [institutions]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): ISearchTransactionsBody => {
      const tbd = appTableRef.current;
      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        ...values,
        institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode,
      };
    },
    [values]
  );

  const searchTransactions = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getTransactions(reqBody)
        .then((data) => {
          setRecordsCount(data.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setTransactions(data.transactions);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchTransactions(), [searchTransactions]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchTransactions(1);
    },
    [searchTransactions]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getTransactions(reqBody)
      .then((data) => {
        downloadDataCSV(mapRecordsToTableData(data.transactions, columns, ['']), 'Transactions');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:transactions')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:transactions')}
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
                      dateFormat={dateFormat}
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
                      dateFormat={dateFormat}
                      minDate={values.startDate ? new Date(values.startDate) : undefined}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="search-trans_type-label">{t('labels:transactionType')}</InputLabel>
                      <Select
                        name="transTypeCode"
                        labelId="search-trans_type-label"
                        label={t('labels:transactionType')}
                        value={values.transTypeCode}
                        onChange={updateAnyValue}
                      >
                        {transactionTypes.map((transactionType: ITransactionType) => (
                          <MenuItem key={transactionType.code} value={transactionType.code}>
                            {transactionType.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="search-trans_channel-label">{t('labels:channel')}</InputLabel>
                      <Select
                        name="channel"
                        labelId="search-trans_channel-label"
                        label={t('labels:channel')}
                        value={values.channel}
                        onChange={updateAnyValue}
                      >
                        {channels.map((channel: string, index: number) => (
                          <MenuItem key={index + 1} value={channel}>
                            {channel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="sourceAccount"
                      label={t('labels:sourceAccount')}
                      value={values.sourceAccount}
                      onChange={updateValue}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="transRef"
                      label={t('labels:transRef')}
                      value={values.transRef}
                      onChange={updateValue}
                      fullWidth
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
              data={transactions}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                transactions?.length ? (
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

export default Transactions;
