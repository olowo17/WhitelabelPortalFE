import { useState, useCallback, ChangeEvent, useEffect } from 'react';
import * as yup from 'yup';
import { Errors, validateCallback } from 'utils/validation';

export type UpdateValue = (event: ChangeEvent<HTMLInputElement>, forceName?: string) => void;
export type UpdateValueByName<V extends Record<string, any>> = (name: keyof V, value: any) => void;

/**
 * Helps maintain the values and onchange event handler for controlled form inputs
 *
 * @param initialValues
 * @param schema
 */
export const useFormValues = <V extends Record<string, any>>(initialValues: V, schema?: yup.AnySchema) => {
  const [values, setValues] = useState<V>(initialValues);
  const [errors, setErrors] = useState<Errors<V> | undefined>(undefined);
  const [extErrors, setExtErrors] = useState<Errors<V> | undefined>(undefined); // Errors from custom components validation
  const [touched, setTouched] = useState<Record<keyof V, boolean>>({} as Record<keyof V, boolean>);

  const updateDropdownValue = useCallback((name, value) => {
    setValues((prevValues) => {
      return { ...prevValues, [name]: value };
    });
  }, []);

  const updateValueByName: UpdateValueByName<V> = useCallback((name: keyof V, value: any) => {
    setValues((prevValues) => {
      return { ...prevValues, [name]: value };
    });
    setTouched((prevTouched) => {
      return prevTouched[name] ? prevTouched : { ...prevTouched, [name]: true };
    });
  }, []);

  const updateValue: UpdateValue = useCallback((event: ChangeEvent<HTMLInputElement>, forceName?: keyof V) => {
    const { name, type, value, checked } = event.target;

    const targetName = (forceName as string) || name;
    const finalValue = type === 'checkbox' ? (checked ? value || true : false) : value;

    if (process.env.NODE_ENV === 'development') {
      if (!targetName || targetName.trim() === '') {
        console.warn('You are attempting to update the value of an input without a name');
      }
    }

    setValues((prevValues) => {
      return { ...prevValues, [targetName]: finalValue };
    });

    setTouched((prevTouched) => {
      return prevTouched[targetName] ? prevTouched : { ...prevTouched, [targetName]: true };
    });
  }, []);

  const updateAnyValue = useAnyUpdateValue(updateValue);

  useEffect(() => {
    if (!schema) return;

    setErrors(() => {
      const validationErrors = validateCallback(values, schema);
      return extErrors || validationErrors ? ({ ...extErrors, ...validationErrors } as Errors<V>) : undefined;
    });
  }, [values, extErrors]);

  const resetValues = useCallback((newValues?: Record<keyof V, any>) => {
    setTouched({} as Record<keyof V, boolean>);
    setValues({ ...(newValues ? newValues : ({} as V)) });
  }, []);

  return {
    values,
    updateValue,
    updateValueByName,
    resetValues,
    errors,
    setErrors,
    setExtErrors,
    touched,
    setTouched,
    updateAnyValue,
    updateDropdownValue,
  };
};

export const useAnyUpdateValue = (handler: UpdateValue) => {
  return useCallback((event: any) => handler(event), [handler]);
};
