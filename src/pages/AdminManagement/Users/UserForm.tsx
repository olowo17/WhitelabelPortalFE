import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import useAuthService from 'hooks/useAuthService';
import { requiredOnly, validateEmail, validatePassword } from 'utils/validation';
import { GRAPHQL_HOST } from 'utils/constants';
import useToast from 'hooks/useToast';
import { IApiError } from 'models';
import { getBranches } from 'pages/AdminManagement/Branches/Branches.service';
import { IInstitution } from 'pages/AdminManagement/Institutions/Institutions.model';
import { VisibilityIcon, VisibilityOffIcon } from 'components/appIcons';
import { IBranch } from '../Branches/Branches.model';
import { IRole } from '../Roles/Roles.model';
import { getRoles } from '../Roles/Roles.service';
import { IPortalUser, ICreateUserSearch } from './Users.model';
import { updateUser, createUser } from './Users.service';

interface IUserFormProps {
  closeForm: () => void;
  institutions: IInstitution[];
  editUser?: IPortalUser;
}

const schema = yup.object().shape({
  email: validateEmail(),
  firstName: requiredOnly('firstName'),
  lastName: requiredOnly('lastName'),
  mobileNumber: requiredOnly('mobileNumber'),
  branchCode: requiredOnly('branch'),
  roleId: requiredOnly('role'),
  password: validatePassword('password'),
  passwordConfirmation: yup
    .string()
    .trim()
    .oneOf([yup.ref('password'), null], "Passwords don't match"),
});

const schemaEdit = yup.object().shape({
  email: validateEmail(),
  firstName: requiredOnly('firstName'),
  lastName: requiredOnly('lastName'),
  mobileNumber: requiredOnly('mobileNumber'),
});

const UserForm = (props: IUserFormProps) => {
  const { editUser } = props;
  const { values, updateValue, errors, touched } = useFormValues<ICreateUserSearch>(
    {
      firstName: editUser?.firstName || '',
      lastName: editUser?.lastName || '',
      email: editUser?.emailAddress || '',
      password: '',
      passwordConfirmation: '',
      roleId: editUser?.role?.roleID || '',
      mobileNumber: editUser?.mobileNumber || '',
      institutionCode: editUser?.institution?.code || '',
      branchCode: editUser?.branch?.code || '',
    },
    editUser ? schemaEdit : schema
  );
  const { showToast } = useToast();
  const { authUser } = useAuthService();
  const handleChange = useAnyUpdateValue(updateValue);
  const [targetInstitution, setTargetInstitution] = useState(
    authUser.institution.isISW && authUser.roles[0].name === 'SUPER_ADMIN' ? null : authUser.institution.code
  );
  const [submitting, setSubmitting] = useState(false);
  const [fetchingInstData, setFetchingInstData] = useState(false);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = editUser ? t('labels:update') : t('labels:create');

  useEffect(() => {
    if (!targetInstitution) return;

    setFetchingInstData(true);
    Promise.all([
      getBranches({ institutionCode: targetInstitution.toString(), pageNumber: 1 }),
      getRoles({ institutionCode: targetInstitution.toString(), pageNumber: 1, pageSize: 10 }),
    ])
      .then((instData) => {
        const [branchesData, rolesData] = instData;
        setBranches(branchesData.data);
        setRoles(rolesData.data);
      })
      .catch(() => {
        showToast({ message: 'Could not get some needed data.', type: 'error' });
      })
      .finally(() => {
        setFetchingInstData(false);
      });
  }, [targetInstitution]);

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };
  const handleShowPasswordConfirmation = () => {
    setShowPasswordConfirmation((show) => !show);
  };

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (!targetInstitution || errors) return;
      const { ...createdUser } = values;
      setSubmitting(true);
      (editUser
        ? updateUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            mobileNumber: values.mobileNumber,
            institutionCode: targetInstitution.toString(),
          })
        : createUser({ ...createdUser, institutionCode: targetInstitution.toString() })
      )
        .then((data) => {
          showToast({ message: data.description, type: 'success' });
          props.closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, targetInstitution, errors, props.closeForm]
  );

  const boxContent = targetInstitution ? (
    <div>
      {!editUser && authUser.institution.isISW && (
        <div style={{ marginBottom: 20 }}>
          <Button variant="text" onClick={() => setTargetInstitution(null)}>
            {t('labels:back')}
          </Button>
        </div>
      )}

      {fetchingInstData ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />

          <div style={{ marginTop: 12 }}>Fetching Data...</div>
        </Box>
      ) : (
        <Box>
          {branches.length === 0 && (
            <Box sx={{ color: 'error.main' }}>No Branch created yet, create one before you can create a user</Box>
          )}
          {roles.length === 0 && (
            <Box sx={{ color: 'error.main' }}>No Role created yet, create one before you can create a user </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  name="email"
                  label={t('labels:email')}
                  value={values.email}
                  onChange={handleChange}
                  error={Boolean(touched.email && errors?.email)}
                  helperText={touched.email && errors?.email}
                  disabled={!!editUser}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  name="firstName"
                  label={t('labels:firstName')}
                  value={values.firstName}
                  onChange={handleChange}
                  error={Boolean(touched.firstName && errors?.firstName)}
                  helperText={touched.firstName && errors?.firstName}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  name="lastName"
                  label={t('labels:lastName')}
                  value={values.lastName}
                  onChange={handleChange}
                  error={Boolean(touched.lastName && errors?.lastName)}
                  helperText={touched.lastName && errors?.lastName}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  name="mobileNumber"
                  label={t('labels:mobileNumber')}
                  value={values.mobileNumber}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              {editUser ? null : (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="user-form-branchCode-label">{t('labels:branch')}</InputLabel>
                    <Select
                      name="branchCode"
                      labelId="user-form-branchCode-label"
                      label={t('labels:branch')}
                      value={values.branchCode}
                      onChange={handleChange}
                      error={Boolean(touched.branchCode && errors?.branchCode)}
                    >
                      <MenuItem value="">- Select -</MenuItem>
                      {branches.map((branch) => (
                        <MenuItem key={branch.code} value={branch.code}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText error={Boolean(errors?.branchCode)}>
                      {touched.branchCode && errors?.branchCode}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )}

              {editUser ? null : (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="user-form-roleId-label">{t('labels:role')}</InputLabel>
                    <Select
                      name="roleId"
                      labelId="user-form-roleId-label"
                      label={t('labels:role')}
                      value={values.roleId}
                      onChange={handleChange}
                      error={Boolean(touched.roleId && errors?.roleId)}
                    >
                      <MenuItem value="">- Select -</MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.roleID} value={role.roleID}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText error={Boolean(errors?.roleId)}>{touched.roleId && errors?.roleId}</FormHelperText>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {editUser ? null : (
              <Grid container spacing={2} sx={{ paddingTop: '14px' }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label={t(`labels:password`)}
                    onChange={updateValue}
                    onBlur={updateValue as any}
                    error={Boolean(touched.password && errors?.password)}
                    helperText={touched.password && errors?.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowPassword} edge="end">
                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    name="passwordConfirmation"
                    label={t(`labels:confirmPassword`)}
                    onChange={updateValue}
                    onBlur={updateValue as any}
                    error={Boolean(touched.passwordConfirmation && errors?.passwordConfirmation)}
                    helperText={touched.passwordConfirmation && errors?.passwordConfirmation}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowPasswordConfirmation} edge="end">
                            {showPasswordConfirmation ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            )}

            <LoadingButton
              type="submit"
              variant="contained"
              sx={{ marginTop: 2 }}
              loading={submitting}
              disabled={Boolean(errors)}
            >
              {actionStr}
            </LoadingButton>
          </form>
        </Box>
      )}
    </div>
  ) : (
    <div>
      <Typography variant="h6" component="h4" sx={{ marginY: 1 }}>
        {t('labels:selectInstitution')}
      </Typography>

      <Grid container spacing={2}>
        {props.institutions.map((inst) => (
          <Grid key={inst.code} item xs={6} md={4} lg={2}>
            <Button
              variant="text"
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', margin: 'auto' }}
              onClick={() => setTargetInstitution(inst.code)}
            >
              <img src={GRAPHQL_HOST + inst.logo} alt="" style={{ width: 75 }} />
              {inst.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </div>
  );

  return <Box>{boxContent}</Box>;
};

export default UserForm;
