import React, {
  ForwardedRef,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell/TableCell';
import { AnyRec } from 'models';
import { objectGet } from 'utils/utils';
import Scrollbar from './Scrollbar';

export const rowsPerPageOptions = [5, 10, 25, 50];

export type RecordValue = string | number | boolean;

export interface IAppTableColumn<RowType extends AnyRec> {
  name: string;
  prop: string;
  /**
   * @param value the value on the table cell
   * @param row the record object on the table row
   */
  renderCell?: (value: RecordValue, row: RowType) => ReactNode;
  renderHead?: (columnName: string) => ReactNode;
  headCellProps?: TableCellProps;
  bodyCellProps?: TableCellProps;
}

export interface IAppTableRef {
  pageNumber: number;
  pageSize: number;
  recordsCount: number;
  /**
   * Changes the current page on the table, the pages are indexed starting from 0
   *
   * @param pageNumber the number the page should be set to starting from 0. Which means the first page is 0, second is 1 and so on
   */
  setPageNumber: (pageNumber: number) => void;
}

export const INIT_TABLE_REF: IAppTableRef = {
  pageNumber: 0,
  pageSize: rowsPerPageOptions[1],
  recordsCount: 0,
  setPageNumber: () => null,
};

interface IAppTableProps {
  data: AnyRec[];
  columns: IAppTableColumn<any>[];
  recordsCount: number;
  syncTable?: (pageNumber: number, pageSize: number) => void;
  loading?: boolean;
  actions?: React.ReactNode;
  /**
   * prop to be used to identify each record row, this value should be constant
   */
  keyProp?: string;
  withoutPreLoading?: boolean;
}

const AppTable = React.forwardRef((props: PropsWithChildren<IAppTableProps>, ref: ForwardedRef<IAppTableRef>) => {
  const { data, columns, syncTable, loading, recordsCount, keyProp } = props;
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [preloading, setPreloading] = useState(!props.withoutPreLoading);
  const isInternalPageChange = useRef(true);

  const { t } = useTranslation(['labels']);

  const propDataMap = useMemo(
    () =>
      data.map((row) =>
        columns.reduce((newMapped, column) => {
          if (column.prop === 'amount')
            newMapped[column.prop] = new Intl.NumberFormat('en-GB').format(objectGet(row, column.prop));
          else newMapped[column.prop] = objectGet(row, column.prop);
          return newMapped;
        }, {} as AnyRec)
      ),
    [data, columns]
  );

  const rowKeyList = useMemo(() => (keyProp ? data.map((row) => objectGet(row, keyProp)) : []), [data]);

  if (process.env.NODE_ENV === 'development') {
    useEffect(() => {
      if (!keyProp) {
        console.warn('Provide a keyProp to app table to get a key for each table row.');
      } else if (rowKeyList.length && !rowKeyList[0]) {
        console.warn('Ensure the keyProp value is set to a prop that exists and has unique values across records');
      }
    }, [data, rowKeyList]);
  }

  const handleChangePage = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, newPageNumber: number) => {
    isInternalPageChange.current = true;
    setPageNumber(newPageNumber);
  }, []);

  const handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = useCallback(
    (event) => {
      setPageSize(+event.target.value);
      isInternalPageChange.current = true;
      setPageNumber(0);
    },
    []
  );

  useEffect(() => {
    if (ref) {
      (ref as MutableRefObject<IAppTableRef>).current = {
        pageNumber: pageNumber,
        pageSize: pageSize,
        recordsCount,
        setPageNumber,
      };
    }
  }, [pageNumber, pageSize, recordsCount]);

  useEffect(() => {
    if (!preloading) {
      setPreloading(true);
      return;
    }
    if (!isInternalPageChange.current) return;

    isInternalPageChange.current = false;
    syncTable?.(pageNumber, pageSize);
  }, [pageNumber, pageSize]);

  return (
    <>
      {loading && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      <Scrollbar>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {columns.map((column, ix) => (
                  <TableCell key={column.name + column.prop + ix} {...column.headCellProps}>
                    {column.renderHead ? column.renderHead(column.name) : column.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {propDataMap.map((mappedRow, i) => (
                <TableRow key={keyProp ? rowKeyList[i] : i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {columns.map((column, ix) => (
                    <TableCell key={column.name + column.prop + ix} {...column.bodyCellProps}>
                      {column.renderCell ? column.renderCell(mappedRow[column.prop], data[i]) : mappedRow[column.prop]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      {loading && data.length ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      ) : null}

      <Box component="div" margin={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            {props.actions}
          </Grid>
          <Grid item xs={12} md={8}>
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              colSpan={columns.length}
              count={recordsCount}
              page={pageNumber}
              rowsPerPage={pageSize}
              labelRowsPerPage={t('labels:rowsPerPage')}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              backIconButtonProps={{ disabled: loading || pageNumber === 0 }}
              nextIconButtonProps={{ disabled: loading || pageNumber === Math.ceil(recordsCount / pageSize) - 1 }}
              SelectProps={{ disabled: loading }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
});

AppTable.displayName = 'AppTable';

export default AppTable;
