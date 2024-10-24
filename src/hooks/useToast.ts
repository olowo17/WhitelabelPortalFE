import { useCallback } from 'react';
import { hideToast, IToast, selectToastSlice, toast, ToastConfig } from 'store/slices/app/toastSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';

const useToast = () => {
  const { toasts } = useAppSelector(selectToastSlice);
  const dispatch = useAppDispatch();

  const showToast = useCallback((config: ToastConfig) => {
    dispatch(toast(config));
  }, []);

  const closeToast = useCallback((toastId: IToast['id']) => {
    dispatch(hideToast(toastId));
  }, []);

  return { toasts, showToast, closeToast };
};

export default useToast;
