import React, { useMemo } from 'react';
import { Breakpoint, Theme, useMediaQuery } from '@mui/material';

interface IMHiddenProps {
  children: React.ReactNode;
  width: 'xsDown' | 'smDown' | 'mdDown' | 'lgDown' | 'xlDown' | 'xsUp' | 'smUp' | 'mdUp' | 'lgUp' | 'xlUp';
}

/**
 * Hides or Shows the child react node based on the screen size and media query
 *
 * @constructor
 */
const MHidden: React.FC<IMHiddenProps> = ({ width, children }) => {
  const breakpoint: Breakpoint = useMemo(() => width.substring(0, 2) as Breakpoint, [width]);

  const hiddenUp = useMediaQuery((theme: Theme) => theme.breakpoints.up(breakpoint));
  const hiddenDown = useMediaQuery((theme: Theme) => theme.breakpoints.down(breakpoint));

  const isMediaDown = useMemo(() => width.includes('Down'), [width]);
  const isMediaUp = useMemo(() => width.includes('Up'), [width]);

  if (isMediaDown) {
    return hiddenDown ? null : <>{children}</>;
  }

  if (isMediaUp) {
    return hiddenUp ? null : <>{children}</>;
  }

  return null;
};

export default MHidden;
