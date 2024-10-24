import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Button,
  Card,
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
import useAuthService from 'hooks/useAuthService';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import Page from 'components/Page';
import { AddOutlinedIcon, SearchIcon } from 'components/appIcons';
import { TableToolbar } from 'components/TableToolbar';
import AppModal from 'components/AppModal';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { ICountry } from '../Countries/Countries.model';
import { getCountries } from '../Countries/Countries.service';
import { getRoles } from './Roles.service';
import { IGetRolesBody, IRole } from './Roles.model';
import RolesActionMenu from './RolesActionMenu';
import RoleForm from './RoleForm';

const Roles = () => {
  const { isISWUser, authUser } = useAuthService();
  const { values, updateValue, updateDropdownValue } = useFormValues({ country_id: '', institutionCode: '' });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editRole, setEditRole] = useState<IRole | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    if (institutions.length) {
      const mappedArr = institutions.map((inst) => {
        const newInst = { label: inst.name, id: inst.id, code: inst.code };
        return newInst;
      });
      setMappedInst([{ label: 'All', id: 'All', code: 'All' }, ...mappedArr]);
    }
  }, [institutions]);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditRole(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const handleChange = useAnyUpdateValue(updateValue);

  const triggerEditRole = useCallback((targetRole: IRole) => {
    setEditRole(targetRole);
    setOpenModal(true);
  }, []);

  const columns: IAppTableColumn<IRole>[] = useMemo(() => {
    return (
      [
        { name: t('labels:name'), prop: 'name' },
        { name: t('labels:description'), prop: 'description' },
        isISWUser ? { name: t('labels:country'), prop: 'institution.country.name' } : null,
        isISWUser ? { name: t('labels:institution'), prop: 'institution.name' } : null,
        {
          name: '',
          prop: 'id',
          renderCell: (id, role) => <RolesActionMenu id={id} role={role} triggerEditRole={triggerEditRole} />,
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IRole>)[]
    ).filter(Boolean) as IAppTableColumn<IRole>[];
  }, [isISWUser, triggerEditRole]);

  useEffect(() => {
    if (!isISWUser) return;

    getCountries()
      .then((countriesData) => setCountries(countriesData.countries))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [isISWUser]);

  useEffect(() => {
    if (!isISWUser) return;

    getInstitutions({ country_id: values.country_id === 'All' ? '' : values.country_id, pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [values.country_id, isISWUser]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetRolesBody => {
      const tbd = appTableRef.current;
      pageNumber = pageNumber || tbd.pageNumber + 1;
      pageSize = pageSize || tbd.pageSize;

      return {
        institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode,
        pageNumber,
        pageSize,
      };
    },
    [values]
  );

  const searchRoles = useCallback(
    (pageNumber?: number) => {
      const reqBody: IGetRolesBody = buildSearchBody(pageNumber);

      setFetching(true);
      getRoles(reqBody)
        .then((rData) => {
          setRecordsCount(rData.data.length);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setRoles(rData.data);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchRoles(), [searchRoles]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchRoles(1);
    },
    [searchRoles]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetRolesBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getRoles(reqBody)
      .then((rData) => {
        downloadDataCSV(mapRecordsToTableData(rData.data, columns), 'Roles');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:roles')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:roles')}
            </Typography>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpen}>
              {t('labels:create') + ' ' + t('labels:roles')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                {isISWUser && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="role-search-country-label">{t('labels:country')}</InputLabel>
                        <Select
                          name="country_id"
                          labelId="role-search-country-label"
                          label={t('labels:country')}
                          value={values.country_id}
                          onChange={handleChange}
                        >
                          <MenuItem value="All">All</MenuItem>
                          {countries.map((ctry) => (
                            <MenuItem key={ctry.id} value={ctry.id}>
                              {ctry.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                      <Button type="submit" variant="contained" size="large" disabled={fetching}>
                        <SearchIcon /> {t('labels:search')}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </form>
            </TableToolbar>

            <AppTable
              data={roles}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {roles?.length ? (
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
      <AppModal open={openModal} onClose={handleClose} title={(editRole ? 'Edit' : 'Create') + ' Role'} size="md">
        <RoleForm
          closeForm={handleClose}
          role={editRole}
          searchRoles={searchRoles}
          isISWUser={isISWUser}
          authUser={authUser}
        />
      </AppModal>
    </DashboardLayout>
  );
};

export default Roles;
