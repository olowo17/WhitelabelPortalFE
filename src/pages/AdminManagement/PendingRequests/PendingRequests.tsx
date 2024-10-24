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
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import {
  IGetPendingRequestsBody,
  IRequestType,
  IPendingRequest,
  MakeRequest,
  RequestsStatuses,
} from './PendingRequests.model';
import { approveRequest, declineRequest, getPendingRequests, getRequestTypes } from './PendingRequests.service';
import PendingRequestsActionMenu from './PendingRequestsActionMenu';

const schema = yup.object().shape({ requestType: yup.string(), endDate: yup.string(), startDate: yup.string() });

const PendingRequests = () => {
  const { isISWUser } = useAuthService();
  const { t } = useTranslation(['labels']);
  const { values, updateValue, updateValueByName, errors, setExtErrors, touched, setTouched } = useFormValues(
    { requestType: '', startDate: '', endDate: '' },
    schema
  );
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<IPendingRequest[]>([]);
  const [requestTypes, setRequestTypes] = useState<IRequestType[]>([]);
  const handleChange = useAnyUpdateValue(updateValue);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const columns: IAppTableColumn<IPendingRequest>[] = useMemo(() => {
    return (
      [
        { name: t('labels:requestDate'), prop: 'requestDate' },
        { name: t('labels:requestType'), prop: 'requestType' },
        { name: t('labels:requestorEmail'), prop: 'requestorEmaill' },
        { name: t('labels:requestor'), prop: 'requestorUsername' },
        {
          name: t('labels:status'),
          prop: 'status',
          renderCell: (status) =>
            status === RequestsStatuses.PENDING ? (
              <Chip label={status} color="warning" size="small" />
            ) : (
              <Chip label={status} color="info" size="small" /> // Can we get status different from PENDING here?
            ),
        },
        {
          name: '',
          prop: 'requestId',
          renderCell: (_id, request) => (
            <PendingRequestsActionMenu
              request={request}
              doApproveRequest={doRequest(approveRequest)}
              doDeclineRequest={doRequest(declineRequest)}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IPendingRequest>)[]
    ).filter(Boolean) as IAppTableColumn<IPendingRequest>[];
  }, [isISWUser]);

  const doRequest = useCallback(
    (action: MakeRequest) => (targetRequest: IPendingRequest) => {
      action(targetRequest.requestID)
        .then((data) => {
          showToast({ message: data?.description || '', type: 'success' });
        })
        .catch((err) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => searchRequests());
    },
    []
  );

  useEffect(() => {
    getRequestTypes()
      .then((typesData) => setRequestTypes(typesData.types))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetPendingRequestsBody => {
      const tbd = appTableRef.current;
      return {
        requestType: values.requestType,
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        startDate: values.startDate || '',
        endDate: values.endDate || '',
      };
    },
    [values]
  );

  const searchRequests = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getPendingRequests(reqBody)
        .then((requestsData) => {
          setRecordsCount(requestsData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setPendingRequests(requestsData.requests);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchRequests(), [searchRequests]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchRequests(1);
    },
    [searchRequests]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getPendingRequests(reqBody)
      .then((requestsData) => {
        downloadDataCSV(mapRecordsToTableData(requestsData.requests, columns, ['']), 'PendingRequests');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:pendingRequests')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:pendingRequests')}
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
                      <InputLabel id="search-request_type-label">{t('labels:requestType')}</InputLabel>
                      <Select
                        name="requestType"
                        labelId="search-request_type-label"
                        label={t('labels:requestType')}
                        value={values.requestType}
                        onChange={handleChange}
                      >
                        <MenuItem value="">All</MenuItem>

                        {requestTypes.map((request: IRequestType) => (
                          <MenuItem key={request.key} value={request.value}>
                            {request.value}
                          </MenuItem>
                        ))}
                      </Select>
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
              data={pendingRequests || []}
              columns={columns}
              keyProp="requestId"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                pendingRequests?.length ? (
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

export default PendingRequests;
