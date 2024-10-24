import { Theme } from '@mui/material';

export default function Autocomplete(theme: Theme) {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiAutocomplete-popupIndicator': {
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
        paper: {
          boxShadow: theme.customShadows.z20,
        },
      },
    },
  };
}
