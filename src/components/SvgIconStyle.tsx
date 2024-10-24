import React from 'react';
import { Box } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

interface SvgIconStyle {
  src: string;
  color: string;
  sx: SxProps<Theme>;
}

export default function SvgIconStyle({ src, color = 'inherit', sx }: SvgIconStyle) {
  return (
    <Box
      component="span"
      sx={{
        width: 24,
        height: 24,
        mask: `url(${src}) no-repeat center / contain`,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        bgcolor: `${color}.main`,
        ...(color === 'inherit' && { bgcolor: 'currentColor' }),
        ...(color === 'action' && { bgcolor: 'action.active' }),
        ...(color === 'disabled' && { bgcolor: 'action.disabled' }),
        ...(color === 'paper' && { bgcolor: 'background.paper' }),
        ...sx,
      }}
    />
  );
}
