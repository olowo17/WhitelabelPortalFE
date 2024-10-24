import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { IApiError } from 'models';
import useAuthService from 'hooks/useAuthService';
import useToast from 'hooks/useToast';
import { IInstitution, IMappedOption } from 'pages/AdminManagement/Institutions/Institutions.model';
import { getInstitutions } from 'pages/AdminManagement/Institutions/Institutions.service';
import { disabledRoutes } from 'routes/routes';
import { getCountries } from '../Countries/Countries.service';
import { ICountry } from '../Countries/Countries.model';
import { getRoles } from '../Roles/Roles.service';
import { IRole } from '../Roles/Roles.model';
import { updateRoleFunction, getMenus, getRoleFunctions } from './RoleFunctions.service';
import { IMenu } from './RoleFunctions.model';

const RoleFunctions = () => {
  const { t } = useTranslation(['labels']);
  const { isISWUser, authUser } = useAuthService();
  const { showToast } = useToast();
  const { values, updateValue, updateValueByName, updateDropdownValue } = useFormValues({
    country_id: '',
    institutionCode: isISWUser ? '' : authUser.institution.code,
    roleId: '',
  });
  const handleChange = useAnyUpdateValue(updateValue);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [mappedInst, setMappedInst] = useState<IMappedOption[]>([]);
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRoleFns, setSelectedRoleFns] = useState<IMenu[]>([]);
  const [parentMenus, setParentMenus] = useState<IMenu[]>([]);
  const [groupedChildMenus, setGroupedChildMenus] = useState<Record<string, IMenu[]>>({});
  const [checkedFns, setCheckedFns] = useState<Record<string, boolean>>({});
  const [fetchingMenus, setFetchingMenus] = useState(false);
  const [fetchingFns, setFetchingFns] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (institutions.length) {
      const mappedArr = institutions.map((inst) => {
        const newInst = { label: inst.name, id: inst.id, code: inst.code };
        return newInst;
      });
      setMappedInst([{ label: 'All', id: 'All', code: 'All' }, ...mappedArr]);
    }
  }, [institutions]);
  useEffect(() => {
    if (!isISWUser) return;

    getCountries()
      .then((countriesData) => setCountries(countriesData.countries))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [isISWUser]);

  useEffect(() => {
    if (!isISWUser) return;

    getInstitutions({ country_id: values.country_id, pageNumber: 1 })
      .then((instData) => setInstitutions(instData.institutions))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      });
  }, [values.country_id, isISWUser]);

  const fetchMenus = useCallback(() => {
    setMenus([]);

    if (!values.institutionCode) return;

    setFetchingMenus(true);
    getMenus({ institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode })
      .then((fetchedMenus) => setMenus(fetchedMenus.data))
      .catch((err: IApiError) => {
        showToast({
          message: err.description,
          type: 'error',
          buttons: [
            {
              text: 'Retry',
              onClick: (close) => {
                fetchMenus();
                close();
              },
            },
          ],
        });
      })
      .finally(() => setFetchingMenus(false));
  }, [values.institutionCode]);

  const fetchRoles = useCallback(() => {
    setRoles([]);
    if (!values.institutionCode) return;

    getRoles({
      pageNumber: 1,
      pageSize: 10,
      institutionCode: values.institutionCode === 'All' ? '' : values.institutionCode,
    })
      .then((rolesData) => {
        setRoles(rolesData.data);
      })
      .catch((err: IApiError) => {
        showToast({
          message: err.description,
          type: 'error',
          buttons: [
            {
              text: 'Retry',
              onClick: (close) => {
                fetchRoles();
                close();
              },
            },
          ],
        });
      });
  }, [values.institutionCode]);

  // Fetches menus and roles belonging to an institution on institution change
  useEffect(() => {
    updateValueByName('roleId', '');
    if (!values.institutionCode) return;
    fetchMenus();
    fetchRoles();
  }, [values.institutionCode]);

  // Organises menus (or role functions) items into parents and children. This helps easy access for UI render
  useEffect(() => {
    const stubParentMenus = menus.filter(
      // hasSubMenu returns true even if should be false
      // parentID=0 uses when a menu has no parent
      (menu) => !menu.parentID || menu.parentID?.toString() === '0'
    );

    const stubGroupedChildMenus: Record<string, IMenu[]> = {};
    for (const parentMenu of stubParentMenus) {
      stubGroupedChildMenus[parentMenu.id] = menus.filter(
        (menu) => menu.parentID?.toString() === parentMenu.id.toString()
      );
    }

    setParentMenus(stubParentMenus);
    setGroupedChildMenus(stubGroupedChildMenus);
  }, [menus]);

  // Fetches role functions on role change
  useEffect(() => {
    if (!values.roleId) {
      setSelectedRoleFns([]);
      return;
    }

    setFetchingFns(true);
    getRoleFunctions({ roleId: values.roleId })
      .then((fetchedRoleFunctions) => setSelectedRoleFns(fetchedRoleFunctions.data))
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setFetchingFns(false));
  }, [values.roleId]);

  // Selects the functions that have already been assigned to a role.
  useEffect(() => {
    setCheckedFns(
      selectedRoleFns.reduce((allCheckedFns, roleFn) => {
        allCheckedFns[roleFn.id] = true;
        return allCheckedFns;
      }, {} as Record<string, boolean>)
    );
  }, [selectedRoleFns]);

  const onToggleCheck = useCallback(
    (event) => {
      const element = event.target as HTMLInputElement;
      // element name holds the menu item id
      const { name: targetMenuId, checked } = element;

      const targetMenu = menus.find((mn) => mn.id.toString() === targetMenuId.toString());
      if (!targetMenu) return;

      setCheckedFns((prevCheckedFns) => {
        const menusToUpdate: string[] = [targetMenuId];
        const isParentMenu = Boolean(groupedChildMenus[targetMenuId]);
        if (!targetMenu.parentID && !isParentMenu) return prevCheckedFns;
        if (isParentMenu) {
          groupedChildMenus[targetMenuId].forEach((childMenu) => {
            menusToUpdate.push(childMenu.id.toString());
          });
        } else if (targetMenu.parentID) {
          if (checked) {
            // if a child item is checked, ensure its parent is also checked
            menusToUpdate.push(targetMenu.parentID.toString());
          } else {
            const hasCheckedSibling = groupedChildMenus[targetMenu.parentID].some(
              // any other sibling menu is checked
              (siblingMenu) =>
                siblingMenu.id !== targetMenu.id &&
                // exclude disabledRoutes untill all the API will be added
                disabledRoutes.indexOf(siblingMenu.routerLink as string) === -1 &&
                prevCheckedFns[siblingMenu.id]
            );
            // if a child item is unchecked, uncheck its parent but on if no other child of the parent is checked
            if (!hasCheckedSibling) {
              menusToUpdate.push(targetMenu.parentID.toString());
            }
          }
        }

        const updatedCheckedFns = { ...prevCheckedFns };
        menusToUpdate.forEach((menuId) => {
          if (checked) updatedCheckedFns[menuId] = true;
          else delete updatedCheckedFns[menuId];
        });

        return updatedCheckedFns;
      });
    },
    [menus, groupedChildMenus]
  );

  const submitRoles = useCallback(
    (evt) => {
      evt.preventDefault();

      if (!values.roleId) return;

      const functionIDs: string[] = [];

      for (const checkedMenuId in checkedFns) {
        if (!checkedFns[checkedMenuId]) continue;
        functionIDs.push(checkedMenuId);
      }

      const body = { roleID: values.roleId, functionIDs };

      setSaving(true);
      updateRoleFunction(body)
        .then((rolesData) => showToast({ message: rolesData.description, type: 'success' }))
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSaving(false));
    },
    [checkedFns]
  );

  return (
    <DashboardLayout>
      <Page title={t('labels:roles')}>
        <Container maxWidth="xl">
          <Card>
            <Box padding={2}>
              <Grid container spacing={2}>
                {isISWUser && (
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="rf-search-country-label">{t('labels:country')}</InputLabel>
                      <Select
                        name="country_id"
                        labelId="rf-search-country-label"
                        label={t('labels:country')}
                        value={values.country_id}
                        onChange={handleChange}
                      >
                        <MenuItem value="">All</MenuItem>
                        {countries.map((ctry) => (
                          <MenuItem key={ctry.id} value={ctry.id}>
                            {ctry.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {isISWUser && (
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <Autocomplete
                        options={mappedInst}
                        onChange={(e, newValue) => updateDropdownValue('institutionCode', newValue?.code)}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id} value={option.code}>
                              {option.label}
                            </li>
                          );
                        }}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label={t('labels:institution')} />}
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="rf-search-role-label">{t('labels:role')}</InputLabel>
                    <Select
                      name="roleId"
                      labelId="rf-search-role-label"
                      label={t('labels:institution')}
                      value={values.roleId}
                      onChange={handleChange}
                    >
                      <MenuItem value="">- Select -</MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.roleID} value={role.roleID}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ width: '100%', padding: 2 }}>
              {fetchingFns && <LinearProgress />}

              {fetchingMenus && (
                <Box textAlign="center">
                  <LinearProgress />
                  <Typography variant="h4" marginY={3}>
                    Getting all Role Functions
                  </Typography>
                </Box>
              )}
            </Box>

            <Grid container spacing={2} padding={2}>
              {parentMenus.map((parentMenu) => (
                <Grid key={parentMenu.id} item xs={12} md={3}>
                  <Card variant="outlined" sx={{ padding: 2, height: '100%' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name={parentMenu.id.toString()}
                          checked={checkedFns[parentMenu.id] || false}
                          onChange={onToggleCheck}
                          disabled={saving || fetchingFns}
                        />
                      }
                      label={<Typography variant="h6">{parentMenu.title}</Typography>}
                    />

                    <hr />

                    {groupedChildMenus[parentMenu.id]?.map((childMenu) => {
                      if (disabledRoutes.indexOf(childMenu.routerLink as string) === -1) {
                        return (
                          <div key={childMenu.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name={childMenu.id.toString()}
                                  checked={checkedFns[childMenu.id] || false}
                                  onChange={onToggleCheck}
                                  disabled={saving || fetchingFns}
                                />
                              }
                              label={childMenu.title}
                            />
                          </div>
                        );
                      }
                    })}
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box component="form" action="" onSubmit={submitRoles} padding={2} textAlign="right">
              <LoadingButton type="submit" variant="contained" loading={saving} size="large" disabled={!values.roleId}>
                Save
              </LoadingButton>
            </Box>
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export default RoleFunctions;
