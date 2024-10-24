import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Avatar,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { AddOutlinedIcon, SearchIcon } from 'components/appIcons';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import Page from 'components/Page';
import { TableToolbar } from 'components/TableToolbar';
import { useFormValues } from 'hooks/useFormValues';
import AppModal from 'components/AppModal';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { IBiller, IGetBillersBody } from './Billers.model';
import {
  activateBiller,
  addFilteredBiller,
  deactivateBiller,
  getBillers,
  getFilteredBillers,
  removeFilteredBiller,
} from './Billers.service';
import BillersActionMenu from './BillersActionMenu';
import BillerForm from './BillerForm';

const Billers = () => {
  const { isISWUser } = useAuthService();
  const { values, updateAnyValue } = useFormValues({ billerName: '' });
  const { values: fTValues, updateDropdownValue } = useFormValues({ filterInstCode: '' });
  const [billers, setBillers] = useState<IBiller[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editBiller, setEditBiller] = useState<IBiller | undefined>(undefined);
  const [getFilteredState, setGetFilteredState] = useState({ fetching: false, failed: false });
  const [filteredOutBillers, setFilteredOutBillers] = useState<Record<string, boolean>>({});
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [filteringBillers, setFilteringBillers] = useState<Record<string, boolean>>({});

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditBiller(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const fetchInstitutions = useCallback(() => {
    if (!isISWUser) return;

    getInstitutions({ country_id: '', pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({
          message: err.description || 'Could not get institutions',
          type: 'error',
          hideAfter: null,
          buttons: [
            {
              text: 'RETRY',
              onClick: (close) => {
                fetchInstitutions();
                close();
              },
            },
          ],
        });
      });
  }, [isISWUser]);

  useEffect(() => fetchInstitutions(), []);

  useEffect(() => {
    if (institutions.length) {
      const mappedArr = institutions.map((inst) => {
        const newInst = { label: inst.name, id: inst.id, code: inst.code };
        return newInst;
      });
      setMappedInst([{ label: 'Select Institution', id: 'All', code: '' }, ...mappedArr]);
    }
  }, [institutions]);

  const getInstitutionFilteredBillers = useCallback((institutionCode) => {
    setFilteredOutBillers({});
    if (!institutionCode) return;

    setGetFilteredState({ fetching: true, failed: false });
    getFilteredBillers(institutionCode)
      .then((ftData) => {
        const newFilteredOutBillers = ftData.billers.reduce<Record<string, boolean>>(
          (filteredOutMap, filteredBiller) => {
            filteredOutMap[filteredBiller.billerID] = true;
            return filteredOutMap;
          },
          {}
        );
        setFilteredOutBillers(newFilteredOutBillers);
      })
      .catch((err: IApiError) => {
        showToast({
          message: err.description,
          type: 'error',
          hideAfter: null,
          buttons: [
            {
              text: 'RETRY',
              onClick: (close) => {
                fetchInstitutions();
                close();
              },
            },
          ],
        });
        setGetFilteredState((pib) => ({ ...pib, failed: true }));
      })
      .finally(() => {
        setGetFilteredState((pib) => ({ ...pib, fetching: false }));
      });
  }, []);

  useEffect(() => {
    getInstitutionFilteredBillers(fTValues.filterInstCode);
  }, [fTValues.filterInstCode, getInstitutionFilteredBillers]);

  const doActivateBiller = useCallback((billerID: number) => {
    return activateBiller(billerID)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }));
  }, []);

  const doDeactivateBiller = useCallback((billerID: number) => {
    return deactivateBiller(billerID)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }));
  }, []);

  const triggerEditBiller = useCallback((targetBiller: IBiller) => {
    setEditBiller(targetBiller);
    setOpenModal(true);
  }, []);

  const toggleIsFiltering = useCallback(
    (billerID: number, filtering: boolean) => setFilteringBillers((p) => ({ ...p, [billerID]: filtering })),
    []
  );

  const removeFromFiltered = useCallback((billerID: number, institutionCode: string) => {
    toggleIsFiltering(billerID, true);
    removeFilteredBiller(billerID, institutionCode)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }))
      .finally(() => toggleIsFiltering(billerID, false));
  }, []);

  const addToFiltered = useCallback((billerID: number, institutionCode: string) => {
    toggleIsFiltering(billerID, true);
    addFilteredBiller(billerID, institutionCode)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }))
      .finally(() => toggleIsFiltering(billerID, false));
  }, []);

  const renderFilterOutHead = useCallback(
    () => (
      <Grid container columnSpacing={1} alignItems="center" justifyContent="center" minWidth="100px">
        {getFilteredState.fetching && (
          <Grid item>
            <CircularProgress size={16} />
          </Grid>
        )}
      </Grid>
    ),
    [institutions, mappedInst, updateDropdownValue, fTValues.filterInstCode, getFilteredState.fetching]
  );

  const renderFilteredOutCell = useCallback(
    (billerID: number) => {
      if (!fTValues.filterInstCode || getFilteredState.fetching || getFilteredState.failed) return null;

      const isFilteredOut = filteredOutBillers[billerID];
      const isFiltering = filteringBillers[billerID];

      return isFilteredOut ? (
        <LoadingButton
          size="small"
          color="success"
          onClick={() => removeFromFiltered(billerID, fTValues.filterInstCode)}
          loading={isFiltering}
        >
          {t('labels:add')}
        </LoadingButton>
      ) : (
        <LoadingButton
          size="small"
          color="error"
          onClick={() => addToFiltered(billerID, fTValues.filterInstCode)}
          loading={isFiltering}
        >
          {t('labels:remove')}
        </LoadingButton>
      );
    },
    [getFilteredState, filteredOutBillers, removeFromFiltered, addToFiltered, filteringBillers, fTValues.filterInstCode]
  );

  const columns: IAppTableColumn<IBiller>[] = useMemo(() => {
    return (
      [
        {
          name: '',
          prop: 'imageUrl',
          renderCell: (imageUrl, biller) => (
            <Avatar
              alt={biller.name}
              src={'data:image/jpeg;base64,' + imageUrl}
              variant="rounded"
              imgProps={{ style: { objectFit: 'contain' } }}
            />
          ),
        },
        { name: t('labels:name'), prop: 'name' },
        { name: t('labels:code'), prop: 'code' },
        { name: t('labels:gatewayCode'), prop: 'gatewayCode' },
        { name: t('labels:defaultProductCode'), prop: 'defaultProductCode' },
        { name: t('labels:charge'), prop: 'charge' },
        { name: t('labels:label'), prop: 'label' },
        {
          name: t('labels:status'),
          prop: 'status',
          renderCell: (status) => (
            <Chip
              label={t(status ? 'labels:active' : 'labels:inactive')}
              color={status ? 'success' : 'error'}
              size="small"
            />
          ),
        },
        isISWUser
          ? {
              name: '',
              prop: 'billerID',
              renderCell: (billerID: number, biller) => (
                <BillersActionMenu
                  billerID={billerID}
                  biller={biller}
                  doActivateBiller={doActivateBiller}
                  doDeactivateBiller={doDeactivateBiller}
                  triggerEditBiller={triggerEditBiller}
                />
              ),
              bodyCellProps: { align: 'right' },
            }
          : null,
        isISWUser
          ? {
              name: '',
              prop: 'billerID',
              renderCell: renderFilteredOutCell,
              renderHead: renderFilterOutHead,
              bodyCellProps: { justifyContent: 'center' },
            }
          : null,
      ] as (null | IAppTableColumn<IBiller>)[]
    ).filter(Boolean) as IAppTableColumn<IBiller>[];
  }, [isISWUser, triggerEditBiller, renderFilteredOutCell, renderFilterOutHead, doActivateBiller, doDeactivateBiller]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetBillersBody => {
      const tbd = appTableRef.current;
      pageNumber = pageNumber || tbd.pageNumber + 1;
      pageSize = pageSize || tbd.pageSize;

      return {
        billerName: values.billerName,
        pageNumber,
        pageSize,
      };
    },
    [values]
  );

  const searchBillers = useCallback(
    (pageNumber?: number) => {
      const reqBody: IGetBillersBody = buildSearchBody(pageNumber);

      setFetching(true);
      getBillers(reqBody)
        .then((bData) => {
          setRecordsCount(bData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setBillers(bData.billers);
        })
        .catch((err: IApiError) => showToast({ message: err.description, type: 'error' }))
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchBillers(), [searchBillers]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchBillers(1);
    },
    [searchBillers]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetBillersBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getBillers(reqBody)
      .then((bData) => {
        downloadDataCSV(mapRecordsToTableData(bData.billers, columns, ['']), 'Billers');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:billers')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:billers')}
            </Typography>
            {isISWUser && (
              <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpen}>
                {t('labels:create') + ' ' + t('labels:biller')}
              </Button>
            )}
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="billerName"
                      label={t('labels:billerName')}
                      value={values.billerName}
                      onChange={updateAnyValue}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button type="submit" variant="contained" size="large" disabled={fetching}>
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3} />
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <Autocomplete
                        options={mappedInst}
                        onChange={(e, newValue) => updateDropdownValue('filterInstCode', newValue?.code)}
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
                </Grid>
              </form>
            </TableToolbar>

            <AppTable
              data={billers}
              columns={columns}
              keyProp="billerID"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                billers.length ? (
                  <LoadingButton loading={downloading} onClick={download}>
                    Download
                  </LoadingButton>
                ) : null
              }
            />
          </Card>
        </Container>
      </Page>
      <AppModal
        open={openModal}
        onClose={handleClose}
        title={t(editBiller ? 'labels:edit' : 'labels:create') + ' ' + t('labels:biller')}
        size="md"
      >
        <BillerForm closeForm={handleClose} biller={editBiller} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Billers;
