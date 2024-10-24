import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router';
import { Switch, useLocation } from 'react-router-dom';

import useAuthService from 'hooks/useAuthService';
import Dashboard from 'pages/Dashboard/Dashboard';
import Login from 'pages/Authorization/Login/Login';
import Page404 from 'pages/Page404';
import ResetPassword from 'pages/Authorization/ResetPassword/ResetPassword';
import { Profile } from 'pages/Authorization/Profile/Profile';
import Users from 'pages/AdminManagement/Users/Users';
import Countries from 'pages/AdminManagement/Countries/Countries';
import Roles from 'pages/AdminManagement/Roles/Roles';
import RoleFunctions from 'pages/AdminManagement/RoleFunctions/RoleFunctions';
import Information from 'pages/AdminManagement/Information/Information';
import Branches from 'pages/AdminManagement/Branches/Branches';
import PendingRequests from 'pages/AdminManagement/PendingRequests/PendingRequests';
import Customers from 'pages/CustomerManagement/Customers/Customers';
import AppConfigs from 'pages/SystemManagement/AppConfigs/AppConfigs';
import Banks from 'pages/SystemManagement/Banks/Banks';
import Categories from 'pages/SystemManagement/Categories/Categories';
import Products from 'pages/SystemManagement/Products/Products';
import Devices from 'pages/CustomerManagement/Devices/Devices';
import PasswordReset from 'pages/CustomerManagement/PasswordReset/PasswordReset';
import PinReset from 'pages/CustomerManagement/PinReset/PinReset';
import Billers from 'pages/SystemManagement/Billers/Billers';
import CustomerLimits from 'pages/LimitManagement/CustomerLimits/CustomerLimits';
import GlobalLimits from 'pages/LimitManagement/GlobalLimits/GlobalLimits';
import Transactions from 'pages/ReportManagement/Transactions/Transactions';
import AuditReport from 'pages/ReportManagement/AuditReport/AuditReport';
import LoggedInCustomers from 'pages/ReportManagement/LoggedInCustomers/LoggedInCustomers';
import CustomerAudit from 'pages/ReportManagement/CustomerAudit/CustomerAudit';
import Institutions from 'pages/AdminManagement/Institutions/Institutions';
import AppRatings from 'pages/ReportManagement/AppRatings/AppRatings';
import ChangePassword from 'pages/Authorization/ChangePassword/ChangePassword';
import { VerifyPasswordChange } from 'pages/Authorization/ResetPassword/VerifyResetPassword';
import SetNewPassword from 'pages/Authorization/ResetPassword/SetNewPassword';
import routePaths from './routePaths';

const Routes = () => (
  <Switch>
    <Route path="/" render={() => <Redirect to={routePaths.dashboard} />} exact />
    <ProtectedRoute path={routePaths.dashboard} component={Dashboard} exact />
    <ProtectedRoute path={routePaths.users} component={Users} exact />
    <ProtectedRoute path={routePaths.countries} component={Countries} exact />
    <ProtectedRoute path={routePaths.roles} component={Roles} exact />
    <ProtectedRoute path={routePaths.roleFunctions} component={RoleFunctions} exact />
    <ProtectedRoute path={routePaths.branches} component={Branches} exact />
    <ProtectedRoute path={routePaths.requestPending} component={PendingRequests} exact />
    <ProtectedRoute path={routePaths.information} component={Information} exact />
    <ProtectedRoute path={routePaths.customer} component={Customers} exact />
    <ProtectedRoute path={routePaths.banks} component={Banks} exact />
    <ProtectedRoute path={routePaths.categories} component={Categories} exact />
    <ProtectedRoute path={routePaths.products} component={Products} exact />
    <ProtectedRoute path={routePaths.devices} component={Devices} exact />
    <ProtectedRoute path={routePaths.passwordReset} component={PasswordReset} exact />
    <ProtectedRoute path={routePaths.pinReset} component={PinReset} exact />
    <ProtectedRoute path={routePaths.profile} component={Profile} exact />
    <ProtectedRoute path={routePaths.appConfig} component={AppConfigs} exact />
    <ProtectedRoute path={routePaths.banks} component={Banks} exact />
    <ProtectedRoute path={routePaths.billers} component={Billers} exact />
    <ProtectedRoute path={routePaths.customerLimits} component={CustomerLimits} exact />
    <ProtectedRoute path={routePaths.globalLimits} component={GlobalLimits} exact />
    <ProtectedRoute path={routePaths.transactions} component={Transactions} exact />
    <ProtectedRoute path={routePaths.auditReport} component={AuditReport} exact />
    <ProtectedRoute path={routePaths.loggedInCustomers} component={LoggedInCustomers} exact />
    <ProtectedRoute path={routePaths.changePassword} component={ChangePassword} exact />
    <ProtectedRoute path={routePaths.customerAudit} component={CustomerAudit} exact />

    <ProtectedRoute path={routePaths.appRatings} component={AppRatings} exact />
    <ProtectedRoute path={routePaths.institutions} component={Institutions} exact />

    <GuestRoute path={routePaths.login} component={Login} />
    <GuestRoute path={routePaths.resetPassword} component={ResetPassword} />
    <GuestRoute path={routePaths.verifyReset} component={VerifyPasswordChange} />
    <GuestRoute path={routePaths.setNewPassword} component={SetNewPassword} />

    <Route path="*" component={Page404} />
  </Switch>
);

export default Routes;

const allowedRoutes = [routePaths.profile, routePaths.changePassword];

export const disabledRoutes = [
  routePaths.institutions,
  routePaths.transferRoutes,
  routePaths.healthCheck,
  routePaths.insights,
  routePaths.appRatings,
];

function ProtectedRoute(routeProps: RouteProps): JSX.Element {
  const { isAuthenticated, authUserMenu } = useAuthService();
  const storedFirstLogin = localStorage.getItem('firstLogin');
  const isFirstLogin = storedFirstLogin ? JSON.parse(storedFirstLogin) : false;
  const location = useLocation();
  if (isAuthenticated) {
    const isValid =
      allowedRoutes.some((routePath) => routePath === routeProps.path) ||
      authUserMenu?.some((menuItem) => menuItem.routerLink === routeProps.path);
    if (isValid) {
      return isFirstLogin && location.pathname !== '/change-password' ? (
        <Redirect to={routePaths.changePassword} />
      ) : (
        <Route {...routeProps} />
      );
    } else if (authUserMenu?.some((menuItem) => menuItem.routerLink === routePaths.dashboard)) {
      return <Redirect to={routePaths.dashboard} />;
    } else {
      return <Redirect to={routePaths.profile} />;
    }
  } else {
    return <Redirect to={routePaths.login} />;
  }
}

function GuestRoute(routeProps: RouteProps): JSX.Element {
  const { isAuthenticated } = useAuthService();
  if (isAuthenticated) {
    const storedFirstLogin = localStorage.getItem('firstLogin');
    const isFirstLogin = storedFirstLogin ? JSON.parse(storedFirstLogin) : false;
    return isFirstLogin ? <Redirect push to={routePaths.changePassword} /> : <Redirect to={routePaths.dashboard} />;
  } else {
    return <Route {...routeProps} />;
  }
}
