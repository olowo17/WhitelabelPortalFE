import React, { useEffect } from 'react';
import { Location } from 'history';
import { useHistory, useLocation } from 'react-router-dom';
import routePaths from 'routes/routePaths';

const getToken = (path: Location<unknown>) => path.search.split('=')[1];

export function VerifyPasswordChange() {
  const history = useHistory();
  const pathname = useLocation();
  useEffect(() => {
    localStorage.setItem('resetToken', getToken(pathname));
    history.push(routePaths.setNewPassword);
  }, []);
  return <div>You will be redirected</div>;
}
