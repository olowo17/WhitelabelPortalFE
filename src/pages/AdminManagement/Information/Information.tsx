import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Container, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import { AddOutlinedIcon } from 'components/appIcons';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import Page from 'components/Page';
import AppModal from 'components/AppModal';
import { getInfos, getInfoTypes } from './Information.service';

import { IInformation } from './Information.model';
import InformationForm from './InformationForm';
import InformationActionMenu from './InformationActionMenu';
const Information = () => {
  const { isISWUser } = useAuthService();
  const [infos, setInfos] = useState<IInformation[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editInfo, setEditInfo] = useState<IInformation | undefined>(undefined);
  const [infoTypes, setInfoTypes] = useState<string[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditInfo(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const triggerEditInfo = useCallback((targetInfo: IInformation) => {
    setEditInfo(targetInfo);
    setOpenModal(true);
  }, []);

  const columns: IAppTableColumn<IInformation>[] = useMemo(() => {
    return (
      [
        { name: t('labels:code'), prop: 'code' },
        { name: t('labels:name'), prop: 'name' },
        isISWUser ? { name: t('labels:institutionCode'), prop: 'institutionCode' } : null,
        {
          name: '',
          prop: 'id',
          renderCell: (id, info) => <InformationActionMenu id={id} info={info} triggerEditInfo={triggerEditInfo} />,
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IInformation>)[]
    ).filter(Boolean) as IAppTableColumn<IInformation>[];
  }, [isISWUser, triggerEditInfo]);

  useEffect(() => {
    getInfoTypes()
      .then((typesData) => setInfoTypes(typesData.infoTypes))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const searchInfos = useCallback(() => {
    setFetching(true);

    getInfos()
      .then((iData) => {
        setRecordsCount(iData.totalRecordCount);
        setInfos(iData.informations);
      })
      .catch((err: IApiError) => {
        showToast({
          message: err.description,
          type: 'error',
          buttons: [
            {
              text: 'Retry',
              onClick: (close) => {
                searchInfos();
                close();
              },
            },
          ],
        });
      })
      .finally(() => setFetching(false));
  }, []);

  const syncTable = useCallback(() => searchInfos(), [searchInfos]);

  const download = useCallback(() => {
    setDownloading(true);
    getInfos()
      .then((iData) => {
        downloadDataCSV(mapRecordsToTableData(iData.informations, columns, ['']), 'Information');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, []);

  return (
    <DashboardLayout>
      <Page title={t('labels:information')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:information')}
            </Typography>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpen}>
              {t('labels:createInfo')}
            </Button>
          </Stack>

          <Card>
            <AppTable
              data={infos}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {infos.length ? (
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
      <AppModal open={openModal} onClose={handleClose} title={t(editInfo ? 'editInfo' : 'createInfo')} size="md">
        <InformationForm closeForm={handleClose} infoTypes={infoTypes} info={editInfo} searchInfos={searchInfos} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Information;
