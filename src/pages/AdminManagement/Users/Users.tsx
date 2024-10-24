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
import { ICountry } from 'pages/AdminManagement/Countries/Countries.model';
import { getCountries } from 'pages/AdminManagement/Countries/Countries.service';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { activateUser, deactivateUser, getUsers } from './Users.service';
import { IGetUsersBody, IPortalUser } from './Users.model';
import UsersActionMenu from './UsersActionMenu';
import UserForm from './UserForm';

const Users = () => {
  const { isISWUser } = useAuthService();
  const { values, updateValue, updateDropdownValue } = useFormValues({
    country_id: '',
    institutionCode: '',
    userName: '',
  });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [users, setUsers] = useState<IPortalUser[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editUser, setEditUser] = useState<IPortalUser | undefined>(undefined);
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
    setEditUser(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const handleChange = useAnyUpdateValue(updateValue);

  const triggerEditUser = useCallback((targetUser: IPortalUser) => {
    setEditUser(targetUser);
    setOpenModal(true);
  }, []);

  const doActivateUser = useCallback((targetUser: IPortalUser) => {
    return activateUser({ userName: targetUser.userName })
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const doDeactivateUser = useCallback((targetUser: IPortalUser) => {
    return deactivateUser({ userName: targetUser.userName })
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const columns: IAppTableColumn<IPortalUser>[] = useMemo(() => {
    return (
      [
        { name: t('labels:firstName'), prop: 'firstName' },
        { name: t('labels:lastName'), prop: 'lastName' },
        { name: t('labels:username'), prop: 'userName' },
        { name: t('labels:branch'), prop: 'branch.name' },
        { name: t('labels:role'), prop: 'role.name' },
        { name: t('labels:email'), prop: 'emailAddress' },
        { name: t('labels:phoneNumber'), prop: 'mobileNumber' },
        {
          name: t('labels:status'),
          prop: 'status',
          renderCell: (status) =>
            status ? (
              <Chip label={t('labels:active')} color="success" size="small" />
            ) : (
              <Chip label={t('labels:inactive')} color="error" size="small" />
            ),
        },
        {
          name: '',
          prop: 'id',
          renderCell: (id, user) => (
            <UsersActionMenu
              id={id}
              user={user}
              triggerEditUser={triggerEditUser}
              doActivateUser={doActivateUser}
              doDeactivateUser={doDeactivateUser}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IPortalUser>)[]
    ).filter(Boolean) as IAppTableColumn<IPortalUser>[];
  }, [isISWUser, triggerEditUser]);

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

    getInstitutions({ country_id: values.country_id, pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [values.country_id, isISWUser]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetUsersBody => {
      const tbd = appTableRef.current;
      return {
        institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode,
        username: values.userName,
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
      };
    },
    [values]
  );

  const searchUsers = useCallback(
    (pageNumber?: number) => {
      const reqBody: IGetUsersBody = buildSearchBody(pageNumber);

      setFetching(true);
      getUsers(reqBody)
        .then((usersData) => {
          setRecordsCount(usersData.totalCount);

          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setUsers(usersData.data);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchUsers(), [searchUsers]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchUsers(1);
    },
    [searchUsers]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetUsersBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getUsers(reqBody)
      .then((usersData) => {
        downloadDataCSV(mapRecordsToTableData(usersData.data, columns, ['']), 'Users');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title="Users">
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:users')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpen}
            >
              {t('labels:createUser')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  {isISWUser && (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="user-search-country-label">{t('labels:country')}</InputLabel>
                        <Select
                          name="country_id"
                          labelId="user-search-country-label"
                          label={t('labels:country')}
                          value={values.country_id}
                          onChange={handleChange}
                        >
                          <MenuItem value="">All</MenuItem>
                          {countries.map((ctry) => (
                            <MenuItem key={ctry.id} value={ctry.id}>
                              {ctry.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {isISWUser && (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <Autocomplete
                          options={mappedInst}
                          onChange={(e, newValue) => updateDropdownValue('institutionCode', newValue?.code)}
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
                    <TextField
                      name="userName"
                      label={t('labels:username')}
                      value={values.userName}
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
              data={users}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {users.length ? (
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

      <AppModal open={openModal} onClose={handleClose} title={(editUser ? 'Edit' : 'Create') + ' User'} size="md">
        <UserForm closeForm={handleClose} institutions={institutions} editUser={editUser} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Users;
