import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import appReducer from './slices/app/appSlice';
import toastReducer from './slices/app/toastSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
