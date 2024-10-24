import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import AppTable, { IAppTableColumn, IAppTableRef, rowsPerPageOptions } from 'components/AppTable';
import { IApiError } from 'models';
import { downloadDataCSV, mapRecordsToTableData } from 'utils/utils';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import Page from 'components/Page';
import { AddOutlinedIcon, SearchIcon } from 'components/appIcons';
import { TableToolbar } from 'components/TableToolbar';
import AppModal from 'components/AppModal';
import { IGetCategories, ICategory } from './Categories.model';
import CategoriesActionMenu from './CategoriesActionMenu';
import CategoryForm from './CategoryForm';
import { getCategories } from './Categories.service';

const Categories = () => {
  const { values, updateValue } = useFormValues({ categoryName: '' });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editedCategory, setEditCategory] = useState<ICategory | undefined>(undefined);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = useCallback(() => setOpenModal(true), []);
  const handleClose = useCallback(() => {
    setOpenModal(false);
    setEditCategory(undefined);
  }, []);

  const { showToast } = useToast();
  const { t } = useTranslation(['labels']);

  const appTableRef = useRef<IAppTableRef>({
    pageNumber: 1,
    pageSize: rowsPerPageOptions[2],
    recordsCount: categories.length,
    setPageNumber: () => null,
  });

  const triggerEditCategory = useCallback((targetCategory: ICategory) => {
    setEditCategory(targetCategory);
    setOpenModal(true);
  }, []);

  const columns: IAppTableColumn<ICategory>[] = useMemo(() => {
    return (
      [
        { name: t('labels:name'), prop: 'name' },
        { name: t('labels:code'), prop: 'code' },
        {
          name: '',
          prop: 'category',
          renderCell: (_id, category) => (
            <CategoriesActionMenu category={category} triggerEditCategory={triggerEditCategory} />
          ),
          bodyCellProps: { align: 'right' },
        },
      ] as (null | IAppTableColumn<ICategory>)[]
    ).filter(Boolean) as IAppTableColumn<ICategory>[];
  }, [triggerEditCategory]);

  const buildSearchBody = useCallback(
    (pageNumber?: number, pageSize?: number): IGetCategories => {
      const tbd = appTableRef.current;
      pageNumber = pageNumber || tbd.pageNumber + 1;
      pageSize = pageSize || tbd.pageSize;

      return {
        categoryName: values.categoryName,
        pageNumber,
        pageSize,
      };
    },
    [values]
  );

  const searchCategories = useCallback(() => {
    const reqBody: IGetCategories = buildSearchBody();

    setFetching(true);
    getCategories(reqBody)
      .then((data) => {
        setRecordsCount(data.totalRecordCount);
        setCategories(data.categories);
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setFetching(false));
  }, [buildSearchBody]);

  const syncTable = useCallback(() => {
    searchCategories();
  }, [searchCategories]);

  const download = useCallback(() => {
    const tbd = appTableRef.current;
    const reqBody: IGetCategories = buildSearchBody(1, tbd.recordsCount);

    setDownloading(true);
    getCategories(reqBody)
      .then((data) => {
        downloadDataCSV(mapRecordsToTableData(data.categories, columns), 'Categories');
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setDownloading(false));
  }, [buildSearchBody]);

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      searchCategories();
    },
    [searchCategories]
  );

  return (
    <DashboardLayout>
      <Page title={t('labels:categories')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:categories')}
            </Typography>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleOpen}>
              {t('labels:create') + ' ' + t('labels:categories')}
            </Button>
          </Stack>

          <Card>
            <TableToolbar>
              <form action="" style={{ width: '100%' }} onSubmit={onSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      name="categoryName"
                      label={t('labels:categoryName')}
                      value={values.categoryName}
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
              data={categories}
              columns={columns}
              keyProp="category"
              syncTable={syncTable}
              recordsCount={recordsCount}
              loading={fetching}
              ref={appTableRef}
              actions={
                <>
                  {categories.length ? (
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
        title={(editedCategory ? 'Edit' : 'Create') + ' Category'}
        size="md"
      >
        <CategoryForm closeForm={handleClose} category={editedCategory} />
      </AppModal>
    </DashboardLayout>
  );
};

export default Categories;
