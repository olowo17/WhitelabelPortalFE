import React, { useState, useCallback, ChangeEvent, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { SelectChangeEvent, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UpdateValueByName } from 'hooks/useFormValues';

type FieldNames = 'accountNumber' | 'customerNumber' | 'username';
interface ICustomerSelectFields {
  accountNumber?: string;
  customerNumber?: string | number;
  username?: string;
}
interface ICustomerSelectInput<T extends Record<string, any>> {
  values: T & ICustomerSelectFields;
  updateValueByName: UpdateValueByName<T>;
  setTouched: Dispatch<SetStateAction<Record<keyof T, boolean>>>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

const fieldNames = ['accountNumber', 'customerNumber', 'username'] as const;

const CustomerSelectInput = <T extends Record<string, any>>({
  values,
  updateValueByName,
  touched,
  errors,
  setTouched,
}: ICustomerSelectInput<T>) => {
  const [fieldName, setFieldName] = useState<FieldNames>('accountNumber');
  const [currentValue, setCurrentValue] = useState<string | number | undefined>(values[fieldName]);
  const { t } = useTranslation(['labels']);
  const isInitialMount = useRef(true);

  const handleOnChangeName = useCallback((event: SelectChangeEvent<FieldNames>) => {
    setFieldName(event.target.value as FieldNames);
  }, []);

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(event.target.value);
      updateValueByName(fieldName, event.target.value);
    },
    [fieldName]
  );

  const handleOnBlur = useCallback(() => {
    setTouched((prevTouched) =>
      prevTouched?.[fieldName] ? prevTouched : ({ ...prevTouched, [fieldName]: true } as Record<keyof T, boolean>)
    );
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      for (const name of fieldNames) {
        updateValueByName(name, name === fieldName ? currentValue : undefined);
      }
    }
  }, [fieldName]);

  return (
    <>
      <Grid container>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="cs-search-customer-field-label">{t('labels:customer')}</InputLabel>
            <Select
              name="fieldName"
              labelId="cs-search-customer-field-label"
              label={t('labels:customer')}
              value={fieldName}
              onChange={handleOnChangeName}
            >
              <MenuItem key="accountNumber" value="accountNumber">
                Account Number
              </MenuItem>
              <MenuItem key="customerNumber" value="customerNumber">
                Customer Number
              </MenuItem>
              <MenuItem key="username" value="username">
                Username
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name={fieldName}
            value={values[fieldName] || ''}
            onChange={handleOnChange}
            error={Boolean(touched?.[fieldName] && errors?.[fieldName])}
            helperText={touched?.[fieldName] && errors?.[fieldName]}
            onBlur={handleOnBlur}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CustomerSelectInput;
