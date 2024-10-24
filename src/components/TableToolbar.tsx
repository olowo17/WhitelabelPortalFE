import { styled } from '@mui/material/styles';
import { Toolbar } from '@mui/material';

export const TableToolbar = styled(Toolbar)(({ theme }) => ({
  height: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2, 4, 2),
}));
