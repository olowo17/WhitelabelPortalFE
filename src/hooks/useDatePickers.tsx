import { Dispatch, SetStateAction, useMemo } from 'react';
import { DatePickerProps } from '@mui/lab/DatePicker';
import { DatePickerErrors } from 'utils/validation';
import { formatDate } from 'utils/utils';
import { UpdateValueByName } from './useFormValues';

type DateOnChange = (date: Date | null) => void;

export const useDateHandler = <V extends Record<string, any>>(
  inputNames: ReadonlyArray<keyof V>, // array values might be just 'date' | 'startDate' | 'endDate', so maybe ts generic isn't neccessary
  updateValueByName: UpdateValueByName<V>, // if some other action needed, add as the third param
  format?: string
) => {
  type InputNames = typeof inputNames[number];

  return useMemo(() => {
    const inputHandlers: Record<InputNames, DateOnChange> = {} as any;

    for (const name of inputNames) {
      inputHandlers[name] = (date: Date | null) => {
        const formattedDate = date
          ? name === 'endDate'
            ? formatDate(date, true, format)
            : formatDate(date, false, format)
          : '';
        updateValueByName(name, formattedDate);
      };
    }

    return inputHandlers;
  }, [...inputNames]);
};

export const useDateErrors = <V extends Record<string, any>>(
  inputNames: ReadonlyArray<keyof V>, // array values might be just 'date' | 'startDate' | 'endDate', so maybe ts generic isn't neccessary
  setErrors: Dispatch<SetStateAction<Partial<Record<keyof V, string>> | undefined>> // if some other action needed, add as the third param
) => {
  type InputNames = typeof inputNames[number];

  return useMemo(() => {
    const inputHandlers: Record<InputNames, DatePickerProps['onError']> = {} as any;

    for (const name of inputNames) {
      inputHandlers[name] = ((reason) => {
        setErrors((prevErrors) =>
          prevErrors || reason
            ? ({ ...prevErrors, [name]: reason ? DatePickerErrors[reason] : null } as Partial<Record<keyof V, string>>)
            : undefined
        );
      }) as DatePickerProps['onError'];
    }

    return inputHandlers;
  }, [...inputNames]);
};
