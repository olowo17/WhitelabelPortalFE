import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  FormHelperText,
  Grid,
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
import { useFormValues } from 'hooks/useFormValues';
import AppTable, { IAppTableColumn, IAppTableRef, INIT_TABLE_REF } from 'components/AppTable';
import AppModal from 'components/AppModal';
import { TableToolbar } from 'components/TableToolbar';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import { IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import ProductForm from './ProductsForm';
import ProductsActionMenu from './ProductsActionMenu';
import { activateProduct, deactivateProduct, getAllBillers, getProducts } from './Products.service';
import { IBiller, IGetProducts, IProduct } from './Products.model';

const Products = () => {
  const { values, updateValue, errors, updateDropdownValue } = useFormValues({ productName: '', billerID: '' });
  const [billers, setBillers] = useState<IBiller[]>([]);
  const [mappedBillers, setMappedBillers] = useState<IMappedOption[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedProduct, setEditProduct] = useState<IProduct | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditProduct(undefined);
  }, []);
  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>(INIT_TABLE_REF);
  const triggerEditProduct = useCallback((targetProduct: IProduct) => {
    setEditProduct(targetProduct);
    setOpenModal(true);
  }, []);

  const doActivateProduct = useCallback((targetProduct: IProduct) => {
    return activateProduct(targetProduct.productID)
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const doDeactivateProduct = useCallback((targetProduct: IProduct) => {
    return deactivateProduct(targetProduct.productID)
      .then((data) => {
        showToast({ message: data.description, type: 'success' });
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const columns: IAppTableColumn<IProduct>[] = useMemo(() => {
    return (
      [
        { name: t('labels:productName'), prop: 'name' },
        { name: t('labels:code'), prop: 'code' },
        {
          name: t('labels:minimumAmount'),
          prop: 'minAmount',
          renderCell: (id, limit) =>
            limit && limit.minAmount ? new Intl.NumberFormat('en-GB').format(limit.minAmount) : null,
        },
        {
          name: t('labels:maximumAmount'),
          prop: 'maxAmount',
          renderCell: (id, limit) =>
            limit && limit.maxAmount ? new Intl.NumberFormat('en-GB').format(limit.maxAmount) : null,
        },
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
          renderCell: (_id, product) => (
            <ProductsActionMenu
              product={product}
              triggerEditProduct={triggerEditProduct}
              doActivateProduct={doActivateProduct}
              doDeactivateProduct={doDeactivateProduct}
            />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<IProduct>)[]
    ).filter(Boolean) as IAppTableColumn<IProduct>[];
  }, [triggerEditProduct]);

  useEffect(() => {
    if (billers.length) {
      const mappedArr = billers.map((biller) => {
        const newInst = { label: biller.name, id: biller.billerID, code: biller.name };
        return newInst;
      });
      setMappedBillers([{ label: 'All', id: 'All', code: 'All' }, ...mappedArr]);
    }
  }, [billers]);

  useEffect(() => {
    getAllBillers()
      .then((billersData) => setBillers(billersData.billers))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, []);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetProducts => {
      const tbd = appTableRef.current;
      return {
        billerID: values.billerID === 'All' ? '' : values.billerID,
        productName: values.productName,
        pageNumber: pageNumber || tbd.pageNumber + 1,
        pageSize: pageSize || tbd.pageSize,
      };
    },
    [values]
  );

  const searchProducts = useCallback(
    (pageNumber?: number) => {
      const reqBody = buildSearchBody(pageNumber);

      setFetching(true);
      getProducts(reqBody)
        .then((productsData) => {
          setRecordsCount(productsData.totalRecordCount);
          appTableRef.current.setPageNumber(reqBody.pageNumber - 1);
          setProducts(productsData.products);
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setFetching(false));
    },
    [buildSearchBody]
  );

  const syncTable = useCallback(() => searchProducts(), [searchProducts]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchProducts(1);
    },
    [searchProducts]
  );

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getProducts(reqBody)
      .then((productsData) => {
        downloadDataCSV(mapRecordsToTableData(productsData.products, columns, ['']), 'Products');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  return (
    <DashboardLayout>
      <Page title={t('labels:products')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:products')}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="#"
              startIcon={<AddOutlinedIcon />}
              onClick={handleOpen}
            >
              {t('labels:createProduct')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="productName"
                      label={t('labels:productName')}
                      value={values.productName}
                      onChange={updateValue}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <Autocomplete
                        options={mappedBillers}
                        onChange={(e, newValue) => updateDropdownValue('billerID', newValue?.id)}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id} value={option.code}>
                              {option.label}
                            </li>
                          );
                        }}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label={t('labels:biller')} />}
                      />
                      <FormHelperText error={Boolean(errors?.billerID)}>{errors?.billerID}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={fetching || Boolean(errors?.billerID)}
                    >
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>

            <AppTable
              data={products}
              columns={columns}
              keyProp="id"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {products.length ? (
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
        title={(editedProduct ? 'Edit' : 'Create') + ' Product'}
        size="md"
      >
        <ProductForm closeForm={handleClose} billers={billers} editedProduct={editedProduct} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Products;
