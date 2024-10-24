import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  FormControl,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
import CustomerSelectInput from 'components/CustomerSelectInput';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import useAuthService from 'hooks/useAuthService';
import CustomerLimitsActionMenu from './CustomerLimitsActionMenu';
import CustomerLimitsForm from './CustomerLimitsForm';
import { ISearchCustomerLimit, ICustomerInfo, ICustomerLimit, ISearchCustomerLimitBody } from './CustomerLimits.model';
import { searchCustomerLimit } from './CustomerLimits.service';

const CustomerLimits = () => {
  const { isISWUser, authUser } = useAuthService();
  const { values, updateValueByName, setTouched, updateDropdownValue } = useFormValues<ISearchCustomerLimit>({
    institutionCode: '',
  });
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [limits, setLimits] = useState<ICustomerLimit[]>([]);
  const [customer, setCustomer] = useState<ICustomerInfo | undefined>(undefined);
  const [editedLimit, setEditedlimit] = useState<ICustomerLimit | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
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
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditedlimit(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);

  const triggerEditLimit = useCallback((targetLimit: ICustomerLimit) => {
    setEditedlimit(targetLimit);
    handleOpen();
  }, []);

  const columns: IAppTableColumn<ICustomerLimit>[] = useMemo<IAppTableColumn<ICustomerLimit>[]>(() => {
    const columnsBuilder: (null | IAppTableColumn<ICustomerLimit>)[] = [
      { name: t('labels:name'), prop: 'name' },
      { name: t('labels:amount'), prop: 'amount' },
      {
        name: '',
        prop: 'customerID',
        renderCell: (id, limit) => {
          if (limit.name !== 'Daily Transaction Limit') return null;
          return <CustomerLimitsActionMenu id={id} limit={limit} triggerEditLimit={triggerEditLimit} />;
        },
        bodyCellProps: { align: 'right' },
      },
    ];

    return columnsBuilder.filter(Boolean) as IAppTableColumn<ICustomerLimit>[];
  }, []);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): ISearchCustomerLimitBody => {
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
      const reqBody: ISearchCustomerLimitBody = buildSearchBody(pageNumber);

      setFetching(true);
      searchCustomerLimit(reqBody)
        .then((limitsData) => {
          setRecordsCount(limitsData.limits.length);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setCustomer(limitsData.customerInfo);
          setLimits(limitsData.limits);
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
              {t('labels:customerLimits')}
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
                    <CustomerSelectInput<ISearchCustomerLimit>
                      values={values}
                      updateValueByName={updateValueByName}
                      setTouched={setTouched}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={
                        fetching ||
                        !values.institutionCode ||
                        (!values.accountNumber && !values.customerNumber && !values.username)
                      }
                    >
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>

            <Box paddingLeft="16px">
              <label className="control-label">Customer Name:{'  '}</label>
              {customer?.customerName || 'Not Found'}
            </Box>
            <AppTable
              data={limits}
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

      <AppModal open={openModal} onClose={handleClose} title="Edit Customer Limit" size="md">
        <CustomerLimitsForm closeForm={handleClose} customer={customer} limit={editedLimit} />
      </AppModal>
    </DashboardLayout>
  );
};

export default CustomerLimits;
