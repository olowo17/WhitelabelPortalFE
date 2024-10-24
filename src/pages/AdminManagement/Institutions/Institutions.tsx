import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
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
import { Link as RouterLink } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { AddOutlinedIcon, SearchIcon } from 'components/appIcons';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef } from 'components/AppTable';
import { TableToolbar } from 'components/TableToolbar';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import AppModal from 'components/AppModal';
import { ICountry } from 'pages/AdminManagement/Countries/Countries.model';
import { getCountries } from 'pages/AdminManagement/Countries/Countries.service';
import { getInstitutions } from './Institutions.service';
import { IGetInstitutionsBody, IInstitution } from './Institutions.model';
import InstitutionsActionMenu from './InstitutionsActionMenu';
import InstitutionForm from './InstitutionForm';

const Institutions = () => {
  const { isISWUser } = useAuthService();
  const { values, updateValue } = useFormValues({ country_id: '' });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedInstitution, setEditedInstitution] = useState<IInstitution | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditedInstitution(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>({
    pageNumber: 1,
    pageSize: 10,
    recordsCount: institutions.length,
    setPageNumber: () => null,
  }); // mocked
  const handleChange = useAnyUpdateValue(updateValue);

  const triggerEditInstitution = useCallback((targetInstitution: IInstitution) => {
    setEditedInstitution(targetInstitution);
    setOpenModal(true);
  }, []);

  const columns: IAppTableColumn<IInstitution>[] = useMemo<IAppTableColumn<IInstitution>[]>(() => {
    const columnsBuilder: (null | IAppTableColumn<IInstitution>)[] = [
      /* {
        name: t('labels:logo'),
        prop: 'logo',
        renderCell: (logo) => <img src={(GRAPHQL_HOST || '') + logo} alt="" style={{ width: 75 }} />,
      }, */
      {
        name: t('labels:logo'),
        prop: 'imageUrl',
        renderCell: (imageUrl, institution) => (
          <Avatar
            alt={institution.name}
            src={'data:image/jpeg;base64,' + imageUrl}
            variant="rounded"
            imgProps={{ style: { objectFit: 'contain' } }}
          />
        ),
      },
      { name: t('labels:name'), prop: 'name' },
      { name: t('labels:code'), prop: 'code' },
      { name: t('labels:bankCode'), prop: 'bankCode' },
      isISWUser ? { name: t('labels:country'), prop: 'country.name' } : null,
      {
        name: '',
        prop: 'id',
        renderCell: (id, institution) => (
          <InstitutionsActionMenu id={id} institution={institution} triggerEditInstitution={triggerEditInstitution} />
        ),
        bodyCellProps: { align: 'right' },
      },
    ];

    return columnsBuilder.filter(Boolean) as IAppTableColumn<IInstitution>[];
  }, [isISWUser, triggerEditInstitution]);

  useEffect(() => {
    if (!isISWUser) return;

    getCountries()
      .then((countriesData) => setCountries(countriesData.countries))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [isISWUser]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetInstitutionsBody => {
      const tbd = appTableRef.current;

      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        country_id: values.country_id === 'All' ? '' : values.country_id,
      };
    },
    [values]
  );

  const searchInstitutions = useCallback(() => {
    const reqBody: IGetInstitutionsBody = buildSearchBody();

    setFetching(true);
    getInstitutions(reqBody)
      .then((institutionsData) => {
        setRecordsCount(institutionsData.totalRecordCount);
        setInstitutions(institutionsData.institutions);
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setFetching(false));
  }, [buildSearchBody]);

  const syncTable = useCallback(() => {
    searchInstitutions();
  }, [searchInstitutions]);

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetInstitutionsBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getInstitutions(reqBody)
      .then((institutionsData) => {
        downloadDataCSV(mapRecordsToTableData(institutionsData.institutions, columns, ['']), 'Institutions');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title="Institutions">
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:institutions')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpen}
            >
              {t('labels:createInstitution')}
            </Button>
          </Stack>

          <Card>
            {isISWUser && (
              <TableToolbar>
                <form
                  action=""
                  style={{ width: '100%' }}
                  onSubmit={(evt) => {
                    evt.preventDefault();
                    searchInstitutions();
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="institution-search-country-label">{t('labels:country')}</InputLabel>
                        <Select
                          name="country_id"
                          labelId="institution-search-country-label"
                          label={t('labels:country')}
                          value={values.country_id}
                          onChange={handleChange}
                        >
                          <MenuItem value="All">All</MenuItem>
                          {countries.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                              {country.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button type="submit" variant="contained" size="large" disabled={fetching}>
                        <SearchIcon /> {t('labels:search')}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </TableToolbar>
            )}

            <AppTable
              data={institutions}
              columns={columns}
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {institutions.length ? (
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
        title={(editedInstitution ? 'Edit' : 'Create') + ' Institution'}
        size="md"
      >
        <InstitutionForm closeForm={handleClose} countries={countries} editedInstitution={editedInstitution} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Institutions;
