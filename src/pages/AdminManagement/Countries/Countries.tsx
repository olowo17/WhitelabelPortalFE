import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Card, Chip, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { AddOutlinedIcon, SearchIcon } from 'components/appIcons';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { TableToolbar } from 'components/TableToolbar';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import AppModal from 'components/AppModal';
import { getCountries } from './Countries.service';
import { IGetCountriesBody, ICountry } from './Countries.model';
import CountriesActionMenu from './CountriesActionMenu';
import CountryForm from './CountryForm';

const Countries = () => {
  const { isISWUser } = useAuthService();
  const { values, updateValue } = useFormValues({ name: '', active: true });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedCountry, setEditedCountry] = useState<ICountry | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditedCountry(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const handleChange = useAnyUpdateValue(updateValue);

  const triggerEditCountry = useCallback((targetCountry: ICountry) => {
    setEditedCountry(targetCountry);
    setOpenModal(true);
  }, []);

  const columns: IAppTableColumn<ICountry>[] = useMemo<IAppTableColumn<ICountry>[]>(() => {
    const columnsBuilder: (null | IAppTableColumn<ICountry>)[] = [
      { name: t('labels:name'), prop: 'name' },
      { name: t('labels:code'), prop: 'code' },
      {
        name: t('labels:status'),
        prop: 'active',
        renderCell: () =>
          values.active ? (
            <Chip label={t('labels:active')} color="success" size="small" />
          ) : (
            <Chip label={t('labels:inactive')} color="error" size="small" />
          ),
      },
      {
        name: '',
        prop: 'id',
        renderCell: (id, institution) => (
          <CountriesActionMenu id={id} institution={institution} triggerEditCountry={triggerEditCountry} />
        ),
        bodyCellProps: { align: 'right' },
      },
    ];

    return columnsBuilder.filter(Boolean) as IAppTableColumn<ICountry>[];
  }, [isISWUser, triggerEditCountry]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetCountriesBody => {
      const tbd = appTableRef.current;

      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        name: values.name,
        // active: values.active,
      };
    },
    [values]
  );

  const searchCountries = useCallback(
    (pageNumber?: number) => {
      const reqBody: IGetCountriesBody = buildSearchBody(pageNumber);

      setFetching(true);
      getCountries(reqBody)
        .then((countriesData) => {
          setRecordsCount(countriesData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setCountries(countriesData.countries);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchCountries(), [searchCountries]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchCountries(1);
    },
    [searchCountries]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetCountriesBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getCountries(reqBody)
      .then((countriesData) => {
        downloadDataCSV(mapRecordsToTableData(countriesData.countries, columns, ['']), 'Countries');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title="Countries">
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:countries')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpen}
            >
              {t('labels:createCountry')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="name"
                      label={t('labels:name')}
                      value={values.name}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button type="submit" variant="contained" size="large" disabled={fetching}>
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>

            <AppTable
              data={countries}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {countries.length ? (
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
        open={openModal}
        onClose={handleClose}
        title={(editedCountry ? 'Edit' : 'Create') + ' Country'}
        size="md"
      >
        <CountryForm closeForm={handleClose} editedCountry={editedCountry} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Countries;
