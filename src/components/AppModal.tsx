import React, { useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { CloseIcon } from './appIcons';

interface IAppModalProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  size?: DialogProps['maxWidth'];
  title?: string;
  dismissible?: boolean;
  disableEnforceFocus?: boolean;
}

const AppModal: React.FC<IAppModalProps> = (props) => {
  const { open, onClose, size = 'sm', dismissible } = props;

  const handleClose = useCallback(
    (event: React.SyntheticEvent | React.MouseEvent, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (!dismissible && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;

      onClose?.();
    },
    [onClose, dismissible]
  );

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      maxWidth={size}
      fullWidth
      scroll="paper"
      onBackdropClick={(event) => event.preventDefault()}
      disableEnforceFocus // https://dev.to/rexebin/fix-tinymce-react-not-usable-in-material-ui-dialog-68i
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      {props.title && <DialogTitle>{props.title}</DialogTitle>}

      <DialogContent dividers>{props.children}</DialogContent>

      {props.actions && <DialogActions>{props.actions}</DialogActions>}
    </Dialog>
  );
};

export default AppModal;
