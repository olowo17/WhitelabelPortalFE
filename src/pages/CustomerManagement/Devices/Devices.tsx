import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Card, Chip, Container, Grid, Stack, Typography } from '@mui/material';
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
import CustomerSelectInput from 'components/CustomerSelectInput';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import CustomDatePicker from 'components/CustomDatePicker';
import DevicesActionMenu from './DevicesActionMenu';
import { IDevice, IDeviceAction, IGetDevicesBody, ISearchDevices } from './Devices.model';
import { activateDevice, deactivateDevice, getDevices, releaseDevice } from './Devices.service';

const successDeviceState = 'ACTIVATION_COMPLETED';

const schema = yup.object().shape({ endDate: yup.string(), startDate: yup.string() });

const Devices = () => {
  const { isISWUser } = useAuthService();
  const { t } = useTranslation(['labels']);
  const { values, updateValueByName, errors, setExtErrors, touched, setTouched } = useFormValues<ISearchDevices>(
    { startDate: '', endDate: '' },
    schema
  );
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const [devices, setDevices] = useState<IDevice[]>([]);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const doRequest = (action: IDeviceAction) => (targetDevice: IDevice) =>
    action(targetDevice.deviceID)
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
        searchDevices();
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });

  const doActivateDevice = useCallback(doRequest(activateDevice), []);
  const doDeactivateDevice = useCallback(doRequest(deactivateDevice), []);
  const doReleaseDevice = useCallback(doRequest(releaseDevice), []);

  const columns: IAppTableColumn<IDevice>[] = useMemo(() => {
    return (
      [
        { name: t('labels:activationDate'), prop: 'activationStarted' },
        { name: t('labels:deviceName'), prop: 'name' },
        { name: t('labels:model'), prop: 'model' },
        { name: t('labels:customer'), prop: 'customerUsername' },
        { name: t('labels:institutionCode'), prop: 'institutionCode' },
        {
          name: t('labels:deviceState'),
          prop: 'deviceState',
          renderCell: (deviceState) =>
            deviceState === successDeviceState ? (
              <Chip label={deviceState} color="success" size="small" />
            ) : (
              <Chip label={deviceState} color="error" size="small" /> // Can we get list of all possible statuses here?
            ),
        },
        {
          name: t('labels:status'),
          prop: 'enabled',
          renderCell: (enabled) =>
            enabled ? (
              <Chip label={t('labels:active')} color="success" size="small" />
            ) : (
              <Chip label={t('labels:inactive')} color="error" size="small" />
            ),
        },
        {
          name: '',
          prop: 'deviceID',
          renderCell: (_id, device) => (
            <DevicesActionMenu
              device={device}
              doActivateDevice={doActivateDevice}
              doDeactivateDevice={doDeactivateDevice}
              doReleaseDevice={doReleaseDevice}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IDevice>)[]
    ).filter(Boolean) as IAppTableColumn<IDevice>[];
  }, [isISWUser]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetDevicesBody => {
      const tbd = appTableRef.current;
      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        startDate: values.startDate || '',
        endDate: values.endDate || '',
        customerNumber: values.customerNumber,
        username: values.username,
        accountNumber: values.accountNumber,
      };
    },
    [values]
  );

  const searchDevices = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getDevices(reqBody)
        .then((devicesData) => {
          setRecordsCount(devicesData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setDevices(devicesData.devices);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchDevices(), [searchDevices]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchDevices(1);
    },
    [searchDevices]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetDevicesBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getDevices(reqBody)
      .then((devicesData) => {
        downloadDataCSV(mapRecordsToTableData(devicesData.devices, columns, ['']), 'Devices');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:devices')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:devices')}
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
                    <CustomerSelectInput<ISearchDevices>
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
              data={devices}
              columns={columns}
              keyProp="deviceID"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {devices?.length ? (
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
    </DashboardLayout>
  );
};

export default Devices;
