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
import BranchForm from './BranchesForm';
import BranchesActionMenu from './BranchesActionMenu';
import { activateBranch, deactivateBranch, getBranches } from './Branches.service';
import { IBranch, IGetBranchesBody } from './Branches.model';

const Branches = () => {
  const { isISWUser } = useAuthService();
  const { values, updateValue, updateDropdownValue } = useFormValues({ country_id: '', institutionCode: '' });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editBranch, setEditBranch] = useState<IBranch | undefined>(undefined);
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
    setEditBranch(undefined);
  }, []);
  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const handleChange = useAnyUpdateValue(updateValue);
  const triggerEditBranch = useCallback((targetBranch: IBranch) => {
    setEditBranch(targetBranch);
    setOpenModal(true);
  }, []);

  const doActivateBranch = useCallback((targetBranch: IBranch) => {
    return activateBranch({ code: targetBranch.code })
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const doDeactivateBranch = useCallback((targetBranch: IBranch) => {
    return deactivateBranch({ code: targetBranch.code })
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const columns: IAppTableColumn<IBranch>[] = useMemo(() => {
    return (
      [
        { name: t('labels:branchCode'), prop: 'code' },
        { name: t('labels:name'), prop: 'name' },
        isISWUser ? { name: t('labels:institution'), prop: 'institution.name' } : null,
        { name: t('labels:country'), prop: 'institution.country.name' },
        {
          name: t('labels:status'),
          prop: 'activeStatus',
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
          renderCell: (id, branch) => (
            <BranchesActionMenu
              id={id}
              branch={branch}
              triggerEditBranch={triggerEditBranch}
              doActivateBranch={doActivateBranch}
              doDeactivateBranch={doDeactivateBranch}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IBranch>)[]
    ).filter(Boolean) as IAppTableColumn<IBranch>[];
  }, [isISWUser, triggerEditBranch]);

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
    (pageNumber?: number, pageSize?: number): IGetBranchesBody => {
      const tbd = appTableRef.current;
      return {
        institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode,
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
      };
    },
    [values]
  );

  const searchBranches = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getBranches(reqBody)
        .then((branchesData) => {
          setRecordsCount(branchesData.totalCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setBranches(branchesData.data);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchBranches(), [searchBranches]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchBranches(1);
    },
    [searchBranches]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getBranches(reqBody)
      .then((branchesData) => {
        downloadDataCSV(mapRecordsToTableData(branchesData.data, columns, ['']), 'Branches');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:branches')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:branches')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpen}
            >
              {t('labels:createBranch')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  {isISWUser && (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="branch-search-country-label">{t('labels:country')}</InputLabel>
                        <Select
                          name="country_id"
                          labelId="branch-search-country-label"
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
                  )}
                  {isISWUser && (
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
                  )}
                  <Grid item xs={12} md={3}>
                    <Button type="submit" variant="contained" size="large" disabled={fetching}>
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>

            <AppTable
              data={branches}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {branches.length ? (
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
      <AppModal open={openModal} onClose={handleClose} title={(editBranch ? 'Edit' : 'Create') + ' Branch'} size="md">
        <BranchForm closeForm={handleClose} countries={countries} editBranch={editBranch} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Branches;
