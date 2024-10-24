import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/lab';
import { FormControl, TextField } from '@mui/material';
import { UpdateValueByName } from 'hooks/useFormValues';
import { useDateErrors, useDateHandler } from 'hooks/useDatePickers';

export type DateRangeField = 'date' | 'startDate' | 'endDate';

interface IDateRangePicker<T extends Record<string, any>> {
  name: DateRangeField;
  label: string;
  value: string;
  touched?: boolean;
  error?: string;
  minDate?: Date;
  updateValueByName: UpdateValueByName<T>;
  setTouched: Dispatch<SetStateAction<Record<keyof T, boolean>>>;
  setExtErrors: Dispatch<SetStateAction<Partial<Record<keyof T, string>> | undefined>>;
  dateFormat?: string;
}

const CustomDatePicker = <T extends Record<string, any>>({
  name,
  label,
  value,
  touched,
  error,
  minDate,
  updateValueByName,
  setTouched,
  setExtErrors,
  dateFormat,
}: IDateRangePicker<T>) => {
  const { t } = useTranslation(['labels']);

  const handleOnChange = useDateHandler([name], updateValueByName, dateFormat);

  const handleOnError = useDateErrors([name], setExtErrors);

  const handleOnBlur = useCallback(() => {
    setTouched((prevTouched) =>
      prevTouched?.[name] ? prevTouched : ({ ...prevTouched, [name]: true } as Record<keyof T, boolean>)
    );
  }, []);

  return (
    <FormControl fullWidth>
      <DatePicker
        label={t(`labels:${label}`)}
        value={value ? new Date(value) : null}
        onChange={handleOnChange[name]}
        renderInput={(params) => (
          <TextField
            {...params}
            error={touched && Boolean(error)}
            helperText={touched && error}
            onBlur={handleOnBlur}
          />
        )}
        minDate={minDate}
        maxDate={new Date()}
        onError={handleOnError[name]}
      />
    </FormControl>
  );
};

export default CustomDatePicker;
