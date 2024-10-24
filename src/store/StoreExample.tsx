import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchUser, selectAppSlice } from './slices/app/appSlice';

function StoreExample() {
  const appState = useAppSelector(selectAppSlice);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, []);

  return (
    <div>
      {appState.status === 'loading' ? (
        <p>Loading...</p>
      ) : (
        <p>
          Hello <code>{appState.user?.name}</code>.
        </p>
      )}
    </div>
  );
}

export default StoreExample;
