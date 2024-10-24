import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
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
import { IApiError } from 'models';
import useToast from 'hooks/useToast';
import { SearchIcon } from 'components/appIcons';
import CustomDatePicker from 'components/CustomDatePicker';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import { useFormValues } from 'hooks/useFormValues';
import useAuthService from 'hooks/useAuthService';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { IInstitution } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { IAppRating, IAppRatingsValues, IGetAppRatingsBody } from './AppRatings.model';
import { getAppRatings } from './AppRatings.service';

const schema = yup.object().shape({
  endDate: yup.string().notRequired(),
  startDate: yup.string().notRequired(),
  username: yup.string().notRequired(),
  institutionCode: yup.string().notRequired(),
});

const AppRatings = () => {
  const { t } = useTranslation(['labels']);
  const { isISWUser } = useAuthService();

  const { values, updateValueByName, updateAnyValue, errors, setExtErrors, touched, setTouched } =
    useFormValues<IAppRatingsValues>({ startDate: '', endDate: '', username: '', institutionCode: '' }, schema);
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [recordsCount, setRecordsCount] = useState(0);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [ratingReport, setRatingReport] = useState<IAppRating[]>([]);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const columns: IAppTableColumn<IAppRating>[] = useMemo(() => {
    return (
      [
        { name: t('labels:feedbackDate'), prop: 'feedbackDate' },
        { name: t('labels:institution'), prop: 'institution' },
        { name: t('labels:userName'), prop: 'userName' },
        { name: t('labels:deviceId'), prop: 'deviceId' },
        { name: t('labels:transactionRef'), prop: 'transactionRef' },
        { name: t('labels:rating'), prop: 'rating' },
        { name: t('labels:comment'), prop: 'comment' },
      ] as (null | IAppTableColumn<IAppRating>)[]
    ).filter(Boolean) as IAppTableColumn<IAppRating>[];
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

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetAppRatingsBody => {
      const tbd = appTableRef.current;
      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        ...values,
      };
    },
    [values]
  );

  const searchRatingReport = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getAppRatings(reqBody)
        .then((data) => {
          setRecordsCount(data.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setRatingReport(data.feedBackInfos);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchRatingReport(), [searchRatingReport]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchRatingReport(1);
    },
    [searchRatingReport]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getAppRatings(reqBody)
      .then((data) => {
        downloadDataCSV(mapRecordsToTableData(data.feedBackInfos, columns, ['']), 'App Ratings');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:appRatings')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:appRatings')}
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
                      value={values.startDate || ''}
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
                      value={values.endDate || ''}
                      updateValueByName={updateValueByName}
                      touched={touched.endDate}
                      setTouched={setTouched}
                      error={errors?.endDate}
                      setExtErrors={setExtErrors}
                      minDate={values.startDate ? new Date(values.startDate) : undefined}
                    />
                  </Grid>
                  {isISWUser && (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="lic-search-institution-label">{t('labels:institution')}</InputLabel>
                        <Select
                          name="institutionCode"
                          labelId="lic-search-institution-label"
                          label={t('labels:institution')}
                          value={values.institutionCode}
                          onChange={updateAnyValue}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {institutions.map((inst) => (
                            <MenuItem key={inst.code} value={inst.code}>
                              {inst.name}
                            </MenuItem>
                          ))}
                        </Select>
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
              data={ratingReport}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                ratingReport.length ? (
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

export default AppRatings;
