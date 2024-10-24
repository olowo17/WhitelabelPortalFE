import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Card, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { AddOutlinedIcon, SearchIcon } from 'components/appIcons';
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import AppModal from 'components/AppModal';
import { TableToolbar } from 'components/TableToolbar';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import ConfigForm from './AppConfigsForm';
import ConfigsActionMenu from './AppConfigsActionMenu';
import { IConfig, IConfigsSearch, IGetConfigsBody } from './AppConfigs.model';
import { getConfigs } from './AppConfigs.service';

const AppConfigs = () => {
  const { values, updateValue } = useFormValues<IConfigsSearch>({ application: '', query: '' });
  const [configs, setConfigs] = useState<IConfig[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedConfig, setEditConfig] = useState<IConfig | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditConfig(undefined);
  }, []);
  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const triggerEditConfig = useCallback((targetConfig: IConfig) => {
    setEditConfig(targetConfig);
    setOpenModal(true);
  }, []);

  const columns: IAppTableColumn<IConfig>[] = useMemo(() => {
    return (
      [
        { name: t('labels:application'), prop: 'application' },
        { name: t('labels:key'), prop: 'key' },
        { name: t('labels:label'), prop: 'label' },
        { name: t('labels:profile'), prop: 'profile' },
        { name: t('labels:value'), prop: 'value' },
        {
          name: '',
          prop: 'id',
          renderCell: (_id, config) => <ConfigsActionMenu config={config} triggerEditConfig={triggerEditConfig} />,
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IConfig>)[]
    ).filter(Boolean) as IAppTableColumn<IConfig>[];
  }, [triggerEditConfig]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetConfigsBody => {
      const tbd = appTableRef.current;
      return {
        ...values,
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
      };
    },
    [values]
  );

  const searchConfigs = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getConfigs(reqBody)
        .then((configsData) => {
          setRecordsCount(configsData.totalCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setConfigs(configsData.data);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchConfigs(), [searchConfigs]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchConfigs(1);
    },
    [searchConfigs]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getConfigs(reqBody)
      .then((configsData) => {
        downloadDataCSV(mapRecordsToTableData(configsData.data, columns, ['']), 'Configs');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:appConfig')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:appConfig')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpen}
            >
              {t('labels:createConfig')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="application"
                      label={t('labels:application')}
                      value={values.application}
                      onChange={updateValue}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="query"
                      label={t('labels:search')}
                      value={values.query}
                      onChange={updateValue}
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
              data={configs}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {configs.length ? (
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
        title={editedConfig ? t('labels:editConfig') : t('labels:createConfig')}
        size="md"
      >
        <ConfigForm closeForm={handleClose} editedConfig={editedConfig} />
      </AppModal>
    </DashboardLayout>
  );
};

export default AppConfigs;
