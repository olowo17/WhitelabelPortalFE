import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  Grid,
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
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { SearchIcon } from 'components/appIcons';
import CustomDatePicker from 'components/CustomDatePicker';
import { downloadDataCSV, formatDate, mapRecordsToTableData } from 'utils/utils';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { requiredOnly } from 'utils/validation';
import { getRequestTypes } from 'pages/AdminManagement/PendingRequests/PendingRequests.service';
import { IRequestType } from 'pages/AdminManagement/PendingRequests/PendingRequests.model';
import { IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import AuditReportActionMenu from './AuditReportActionMenu';
import { getAuditReportColor, getAuditReports } from './AuditReport.servise';
import { AuditReportStatuses, IAuditReport, ISearchAuditReport, ISearchAuditReportBody } from './AuditReport.model';

const today = new Date();
const endDate = formatDate(today, true);
const startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));

const schema = yup.object().shape({
  endDate: requiredOnly('endDate'),
  startDate: requiredOnly('startDate'),
  auditType: yup.string(),
  actionOn: yup.string(),
  actionBy: yup.string(),
});

const AuditReport = () => {
  const { t } = useTranslation(['labels']);

  const { values, updateValue, updateValueByName, updateDropdownValue, errors, setExtErrors, touched, setTouched } =
    useFormValues<ISearchAuditReport>({ startDate, endDate, auditType: '', actionOn: '', actionBy: '' }, schema);
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const [requestTypes, setRequestTypes] = useState<IRequestType[]>([]);
  const [mappedRequestTypes, setMappedRequestTypes] = useState<IMappedOption[]>([]);
  const [auditReports, setAuditReports] = useState<IAuditReport[]>([]);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const columns: IAppTableColumn<IAuditReport>[] = useMemo(() => {
    return (
      [
        { name: t('labels:auditDate'), prop: 'createDate' },
        { name: t('labels:auditType'), prop: 'auditType' },
        { name: t('labels:actionBy'), prop: 'actionBy' },
        { name: t('labels:actionOn'), prop: 'actionOn' },
        { name: t('labels:userComputer'), prop: 'userIp' },
        {
          name: t('labels:status'),
          prop: 'status',
          renderCell: (status: AuditReportStatuses) =>
            status && <Chip label={status} color={getAuditReportColor(status)} size="small" />,
        },
        {
          name: '',
          prop: 'id',
          renderCell: (id, auditReport) => <AuditReportActionMenu id={id} auditReport={auditReport} />,
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IAuditReport>)[]
    ).filter(Boolean) as IAppTableColumn<IAuditReport>[];
  }, []);

  useEffect(() => {
    if (requestTypes.length) {
      const mappedArr = requestTypes.map((type) => {
        const newType = { label: type.value, id: type.key, code: type.value };
        return newType;
      });
      setMappedRequestTypes([...mappedArr]);
    }
  }, [requestTypes]);

  useEffect(() => {
    getRequestTypes()
      .then((typesData) => setRequestTypes(typesData.types))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): ISearchAuditReportBody => {
      const tbd = appTableRef.current;
      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        ...values,
      };
    },
    [values]
  );

  const searchAuditReport = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getAuditReports(reqBody)
        .then((data) => {
          setRecordsCount(data.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setAuditReports(data.auditTrails);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchAuditReport(), [searchAuditReport]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchAuditReport(1);
    },
    [searchAuditReport]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getAuditReports(reqBody)
      .then((data) => {
        downloadDataCSV(mapRecordsToTableData(data.auditTrails, columns, ['']), 'AuditReport');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:auditReport')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:auditReport')}
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
                    <TextField
                      name="actionOn"
                      label={t('labels:actionOn')}
                      value={values.actionOn}
                      onChange={updateValue}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="actionBy"
                      label={t('labels:actionBy')}
                      value={values.actionBy}
                      onChange={updateValue}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <Autocomplete
                        options={mappedRequestTypes}
                        onChange={(e, newValue) => updateDropdownValue('auditType', newValue?.code)}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id} value={option.code}>
                              {option.label}
                            </li>
                          );
                        }}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label={t('labels:auditType')} />}
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
              data={auditReports}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                auditReports.length ? (
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

export default AuditReport;
