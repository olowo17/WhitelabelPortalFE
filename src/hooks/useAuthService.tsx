import { useCallback, useMemo, useState } from 'react';
import { useJwt } from 'react-jwt';
import { IAuthUser, ILogin, ILoginReturn, IUser } from 'pages/Authorization/Login/login.model';
import { ISetNewPasswordBody } from 'pages/Authorization/ResetPassword/resetPassword.model';
import { AnyRec } from 'models';
import { AUTH_STORE_KEY } from 'utils/constants';
import api from 'api/api';
import { IChangePasswordBody } from 'pages/Authorization/ChangePassword/changePassword.model';

const useAuthService = () => {
  const authDataBuild: IAuthUser | null = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORE_KEY) || '');
    } catch (e) {
      return null;
    }
  }, []);

  const [authData, setAuthData] = useState(authDataBuild);
  const [isAuthenticated, setIsAuthenticated] = useState(!!authData);
  const authUser = useMemo(() => authData?.user || ({} as IUser), [authData?.user]);
  const isISWUser = useMemo(() => authUser?.institution?.isISW || false, [authUser?.institution]);

  const isFirstLogin = authData?.firstLogin;
  const authUserToken = authData?.token;

  const authUserMenu = useMemo(() => {
    if (!authData?.verticalMenuItems) return [];

    return authData.verticalMenuItems;
  }, [authData?.verticalMenuItems]);

  const decodeToken = useCallback((): AnyRec | null => {
    return authUserToken ? useJwt(authUserToken).decodedToken : null;
  }, [authUserToken]);

  const authUserInstitution: IUser['institution'] | null = useMemo(() => authUser?.institution || null, []);

  const resetPassword = useCallback(
    (body: { email: string }) =>
      api.post<unknown, ILoginReturn>('user/password-reset/initate', body).then((res) => res),
    []
  );

  const setNewPassword = useCallback(
    (body: ISetNewPasswordBody) =>
      api.post<unknown, ILoginReturn>('user/password-reset/complete', body).then((res) => res),
    []
  );

  const changePassword = useCallback(
    (body: IChangePasswordBody) => api.post<unknown, ILoginReturn>('user/change-password', body).then((res) => res),
    []
  );

  const login: ILogin = useCallback(
    (body) =>
      api.post<unknown, ILoginReturn>('user/authenticate', body, { urlEncoded: true }).then((res) => {
        const { data } = res;
        const currentUser: IAuthUser = {
          ...data,
          firstLogin: data.user.firstLogin,
          lastLogin: new Date().getTime(),
        };

        if (currentUser?.token) {
          localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(currentUser));
          setAuthData(currentUser);
        }
        if (currentUser?.firstLogin !== null) {
          localStorage.setItem('firstLogin', JSON.stringify(currentUser.firstLogin));
          setAuthData(currentUser);
        }
        return res;
      }),
    []
  );

  const logout = useCallback(() => {
    return new Promise<void>((resolve) => {
      localStorage.removeItem(AUTH_STORE_KEY);
      localStorage.removeItem('firstLogin');
      setIsAuthenticated(false);
      resolve();
    });
  }, []);

  return {
    authUser: authUser,
    authData,
    authUserToken,
    authUserMenu,
    authUserInstitution,
    isAuthenticated,
    isFirstLogin,
    isISWUser,
    decodeToken,
    resetPassword,
    setNewPassword,
    changePassword,
    login,
    logout,
  };
};

export default useAuthService;
