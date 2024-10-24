import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, Card, Container, FormControl, Grid, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { SearchIcon } from 'components/appIcons';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { TableToolbar } from 'components/TableToolbar';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import AppModal from 'components/AppModal';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import useAuthService from 'hooks/useAuthService';
import GlobalLimitsActionMenu from './GlobalLimitsActionMenu';
import GlobalLimitsForm from './GlobalLimitsForm';
import { ISearchGlobalLimit, IGlobalLimit, ISearchGlobalLimitBody } from './GlobalLimits.model';
import { searchGlobalLimit } from './GlobalLimits.service';

const GlobalLimits = () => {
  const { isISWUser, authUser } = useAuthService();
  const { values, updateDropdownValue } = useFormValues<ISearchGlobalLimit>({
    institutionCode: '',
  });
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [limits, setLimits] = useState<IGlobalLimit[]>([]);
  const [editedLimit, setEditedlimit] = useState<IGlobalLimit | undefined>(undefined);
  const [isComplaint, setIsComplaint] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  useEffect(() => {
    if (institutions.length) {
      const mappedArr: IMappedOption[] | any[] = [];
      institutions.map((inst) => {
        if (isISWUser || inst.name === authUser.institution.name) {
          mappedArr.push({ label: inst.name, id: inst.id, code: inst.code });
        }
      });
      setMappedInst([...mappedArr]);
    }
  }, [institutions]);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditedlimit(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const triggerEditLimit = useCallback((targetLimit: IGlobalLimit) => {
    setEditedlimit(targetLimit);
    handleOpen();
  }, []);

  const columns: IAppTableColumn<IGlobalLimit>[] = useMemo<IAppTableColumn<IGlobalLimit>[]>(() => {
    const columnsBuilder: (null | IAppTableColumn<IGlobalLimit>)[] = [
      { name: t('labels:kycLevel'), prop: 'levelText' },
      {
        name: t('labels:dailyLimit'),
        prop: 'dailyLimit',
        renderCell: (id, limit) =>
          limit && limit.dailyLimit ? new Intl.NumberFormat('en-GB').format(limit.dailyLimit) : null,
      },
      /* { name: t('labels:transactionLimit'), prop: 'transactionLimit' }, */
      {
        name: t('labels:transactionLimit'),
        prop: 'id',
        renderCell: (id, limit) => {
          const formattedLimit =
            limit && limit.transactionLimit ? new Intl.NumberFormat('en-GB').format(limit.transactionLimit) : null;
          const formattedMaxLimit =
            limit && limit.transactionLimitMax
              ? new Intl.NumberFormat('en-GB').format(limit.transactionLimitMax)
              : null;
          return limit ? formattedLimit || formattedMaxLimit : null;
        },
      },
      { name: t('labels:institution'), prop: 'institutionCode' },
      {
        name: '',
        prop: 'id',
        renderCell: (id, limit) => <GlobalLimitsActionMenu id={id} limit={limit} triggerEditLimit={triggerEditLimit} />,
        bodyCellProps: { align: 'right' },
      },
    ];

    return columnsBuilder.filter(Boolean) as IAppTableColumn<IGlobalLimit>[];
  }, []);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): ISearchGlobalLimitBody => {
      const tbd = appTableRef.current;

      return {
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
        ...values,
      };
    },
    [values]
  );

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

  const searchLimits = useCallback(
    (pageNumber?: number) => {
      const reqBody: ISearchGlobalLimitBody = buildSearchBody(pageNumber);

      setFetching(true);
      searchGlobalLimit(reqBody)
        .then((limitsData) => {
          setRecordsCount(limitsData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setLimits(limitsData.globalLimits);
          setIsComplaint(limitsData.useKyc);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchLimits(), [searchLimits]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchLimits(1);
    },
    [searchLimits]
  );

  return (
    <DashboardLayout>
      <Page title="Customer Limits">
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:globalLimits')}
            </Typography>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
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
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={fetching || !values.institutionCode}
                    >
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>

            <AppTable
              data={isComplaint ? limits : [limits[0]]}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              withoutPreLoading
            />
          </Card>
        </Container>
      </Page>

      <AppModal open={openModal} onClose={handleClose} title="Edit Global Limit" size="md">
        <GlobalLimitsForm closeForm={handleClose} limit={editedLimit} />
      </AppModal>
    </DashboardLayout>
  );
};

export default GlobalLimits;
