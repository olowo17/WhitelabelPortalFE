import React, { useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from 'store/hooks';
import { clearHiddenToasts } from 'store/slices/app/toastSlice';
import useToast from 'hooks/useToast';
import { CloseIcon } from './appIcons';

const SnackbarProvider = () => {
  const dispatch = useAppDispatch();
  const { toasts, closeToast } = useToast();

  useEffect(() => {
    // helps to clear all closed toasts
    const timer = setInterval(() => {
      dispatch(clearHiddenToasts());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = (toastId: string, event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    closeToast(toastId);
  };

  return (
    <div>
      {toasts.map((toast) => {
        const toastCloseHandler = (e: React.SyntheticEvent | React.MouseEvent, r?: string) =>
          handleClose(toast.id, e, r);

        const action = (
          <>
            {toast.buttons?.map((btn) => (
              <Button
                key={btn.text}
                color="secondary"
                size="small"
                onClick={(ibe) => {
                  if (!btn.onClick) return;
                  const close = () => toastCloseHandler(ibe);
                  btn.onClick(close);
                }}
              >
                {btn.text}
              </Button>
            ))}

            <IconButton size="small" aria-label="close" color="inherit" onClick={toastCloseHandler}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        );

        return (
          <Snackbar
            key={toast.id}
            open={toast.open}
            autoHideDuration={toast.hideAfter}
            anchorOrigin={toast.position ? { vertical: toast.position[0], horizontal: toast.position[1] } : undefined}
            onClose={toastCloseHandler}
            message={toast.message}
            action={action}
          >
            {toast.type ? (
              <Alert severity={toast.type} sx={{ width: '100%' }} action={action}>
                {toast.message}
              </Alert>
            ) : undefined}
          </Snackbar>
        );
      })}
    </div>
  );
};

export default SnackbarProvider;
