import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertColor } from '@mui/material/Alert/Alert';
import { SnackbarOrigin, SnackbarProps } from '@mui/material/Snackbar/Snackbar';
import { MakeOptional } from '@mui/lab/internal/pickers/typings/helpers';
import { RootState } from 'store/store';

export interface IToast {
  id: string;
  open?: boolean;
  type?: AlertColor;
  message: string;
  hideAfter: SnackbarProps['autoHideDuration'];
  position?: [SnackbarOrigin['vertical'], SnackbarOrigin['horizontal']];
  buttons?: { text: string; onClick?: (close: () => void) => void }[];
}

export type ToastConfig = MakeOptional<Omit<IToast, 'id' | 'open'>, 'hideAfter'>;

export interface ToastSliceState {
  toasts: IToast[];
}

const initialState: ToastSliceState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    toast: (state, action: PayloadAction<ToastConfig>) => {
      const toastConf = action.payload;
      const id = Date.now().toString() + Math.random().toString();
      state.toasts = [
        ...state.toasts,
        {
          ...toastConf,
          id,
          open: true,
          hideAfter: toastConf.hideAfter === undefined ? 5000 : toastConf.hideAfter,
          position: toastConf.position || ['top', 'center'],
        },
      ];
    },
    hideToast: (state, action: PayloadAction<IToast['id']>) => {
      const toastId = action.payload;
      const targ = state.toasts.findIndex((t) => t.id === toastId);

      if (targ >= 0) state.toasts[targ] = { ...state.toasts[targ], open: false };

      state.toasts = [...state.toasts];
    },
    clearHiddenToasts: (state) => {
      state.toasts = state.toasts.filter((t) => t.open);
    },
  },
});

export const { toast, hideToast, clearHiddenToasts } = toastSlice.actions;

// selector functions

export const selectToastSlice = (state: RootState) => state.toast;

export default toastSlice.reducer;
