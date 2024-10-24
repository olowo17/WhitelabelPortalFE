import React, { useMemo } from 'react';
import { CssBaseline, ThemeOptions } from '@mui/material';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import shape from './shape';
import palette from './palette';
import typography from './typography';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';

declare module '@mui/system' {
  interface Shape {
    borderRadiusSm: number;
    borderRadiusMd: number;
  }
}

declare module '@mui/material' {
  interface Color {
    0: string;
    500_8: string;
    500_12: string;
    500_16: string;
    500_24: string;
    500_32: string;
    500_48: string;
    500_56: string;
    500_80: string;
  }

  interface Theme {
    customShadows: typeof customShadows;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    customShadows: typeof customShadows;
  }
}

interface IThemeConfigProps {
  children: React.ReactNode;
}

export default function ThemeConfig({ children }: IThemeConfigProps) {
  const themeOptions = useMemo<ThemeOptions>(
    () => ({
      palette,
      shape,
      typography,
      shadows,
      customShadows,
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
