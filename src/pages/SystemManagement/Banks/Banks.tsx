import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Chip, Container, Grid, Stack, TextField, Typography } from '@mui/material';
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
import { IBank, IGetBanksBody } from './Banks.model';
import { activateBank, deactivateBank, getBanks, toggleFiltered } from './Banks.service';
import BanksActionMenu from './BanksActionMenu';
import BankForm from './BankForm';

const Banks = () => {
  const { isISWUser } = useAuthService();
  const { values, updateAnyValue } = useFormValues({ bankName: '' });
  const [banks, setBanks] = useState<IBank[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editBank, setEditBank] = useState<IBank | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditBank(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const triggerEditBank = useCallback((targetBank: IBank) => {
    setEditBank(targetBank);
    setOpenModal(true);
  }, []);

  const updateFiltered = (bankID: IBank['bankID'], filtered: boolean) => {
    return toggleFiltered(bankID, filtered)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }));
  };

  const doActivateBank = useCallback((bankID: number) => {
    return activateBank(bankID)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }));
  }, []);

  const doDeactivateBank = useCallback((bankID: number) => {
    return deactivateBank(bankID)
      .then((data) => showToast({ message: data.description, type: 'success' }))
      .catch((err) => showToast({ message: err.description, type: 'error' }));
  }, []);

  const columns: IAppTableColumn<IBank>[] = useMemo(() => {
    return (
      [
        { name: t('labels:name'), prop: 'name' },
        { name: t('labels:code'), prop: 'code' },
        isISWUser
          ? {
              name: t('labels:status'),
              prop: 'status',
              renderCell: (status) => (
                <Chip
                  label={t(status ? 'labels:enabled' : 'labels:disabled')}
                  color={status ? 'success' : 'error'}
                  size="small"
                />
              ),
            }
          : {
              name: '',
              prop: 'filtered',
              renderCell: (filtered) => (
                <Chip
                  label={t(filtered ? 'labels:inactive' : 'labels:active')}
                  color={filtered ? 'error' : 'success'}
                  size="small"
                />
              ),
            },
        {
          name: '',
          prop: 'bankID',
          renderCell: (bankID: number, bank) => (
            <BanksActionMenu
              bankID={bankID}
              bank={bank}
              updateFiltered={updateFiltered}
              doActivateBank={doActivateBank}
              doDeactivateBank={doDeactivateBank}
              triggerEditBank={triggerEditBank}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IBank>)[]
    ).filter(Boolean) as IAppTableColumn<IBank>[];
  }, [isISWUser, triggerEditBank, updateFiltered, doActivateBank, doDeactivateBank]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetBanksBody => {
      const tbd = appTableRef.current;
      pageNumber = pageNumber || tbd.pageNumber + 1;
      pageSize = pageSize || tbd.pageSize;

      return {
        bankName: values.bankName,
        pageNumber,
        pageSize,
      };
    },
    [values]
  );

  const searchBanks = useCallback(
    (pageNumber?: number) => {
      const reqBody: IGetBanksBody = buildSearchBody(pageNumber);

      setFetching(true);
      getBanks(reqBody)
        .then((bData) => {
          setRecordsCount(bData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setBanks(bData.banks);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchBanks(), [searchBanks]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchBanks(1);
    },
    [searchBanks]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetBanksBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getBanks(reqBody)
      .then((bData) => {
        downloadDataCSV(mapRecordsToTableData(bData.banks, columns, ['']), 'Banks');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:banks')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:banks')}
            </Typography>
            {isISWUser && (
              <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpen}>
                {t('labels:create') + ' ' + t('labels:bank')}
              </Button>
            )}
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="bankName"
                      label={t('labels:bankName')}
                      value={values.bankName}
                      onChange={updateAnyValue}
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
              data={banks}
              columns={columns}
              keyProp="bankID"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                banks.length ? (
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
        title={t(editBank ? 'labels:edit' : 'labels:create') + ' ' + t('labels:bank')}
        size="md"
      >
        <BankForm closeForm={handleClose} bank={editBank} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Banks;
