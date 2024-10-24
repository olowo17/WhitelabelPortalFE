import { Dispatch, SetStateAction } from 'react';
import * as yup from 'yup';
import { ValidationError } from 'yup';
import { TFunction } from 'react-i18next';
import i18n from 'assets/i18n/config';

export type Errors<V extends Record<string, any>> = Partial<Record<keyof V, string>>;

export const validateCallback = <V extends Record<string, any>>(
  values: V,
  schema: yup.AnySchema,
  setErrors?: Dispatch<SetStateAction<Errors<V> | undefined>>
) => {
  try {
    schema.validateSync(values, { abortEarly: false });
    setErrors?.(undefined);
    return undefined;
  } catch (error) {
    if (error instanceof ValidationError) {
      const allErrors: Errors<V> = error.inner.reduce((currentErrors, { path, message }) => {
        if (path) {
          return {
            ...currentErrors,
            [path]: message,
          };
        }
        return currentErrors;
      }, {});
      setErrors?.(allErrors);
      return allErrors;
    }
  }
};

// ##### i18n #####
const t = i18n.t.bind(i18n);
const tLbl: TFunction = (key, options) => t(`labels:${key}`, options);
const tMsg: TFunction = (key, options) => t(`messages:${key}`, options);

const getRequiredMsg = (name: string) => `${tLbl(name)} ${tMsg('isRequired')}`;
const getEmailMsg = (name: string) => `${tLbl(name)} ${tMsg('isEmail')}`;
// ##### / i18n #####

export const requiredOnly = (name: string) => yup.string().required(getRequiredMsg(name));

export const validatePassword = (name: string) =>
  yup
    .string()
    .trim()
    .min(6, 'Password must contain at least 6 characters')
    .matches(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/, 'Password must contain 1 or more special symbol')
    .matches(/[a-z]/, 'Password must contain 1 or more lowercase letter')
    .matches(/[A-Z]/, 'Password must contain 1 or more uppercase letter')
    .matches(/[0-9]/, 'Password must contain 1 or more digit')
    .required(getRequiredMsg(name));

export const validateNewPassword = (name: string) => {
  return yup
    .string()
    .trim()
    .min(6, 'Password must contain at least 6 characters')
    .matches(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/, 'Password must contain 1 or more special symbol')
    .matches(/[a-z]/, 'Password must contain 1 or more lowercase letter')
    .matches(/[A-Z]/, 'Password must contain 1 or more uppercase letter')
    .matches(/[0-9]/, 'Password must contain 1 or more digit')
    .required(getRequiredMsg(name))
    .notOneOf([yup.ref('currentPassword')], 'The new password cannot be the same as the old password');
};

export const validateLimit = (name: string, maxLimit: number) =>
  yup
    .number()
    .max(maxLimit, `${maxLimit} is max`)
    .required('value')
    .typeError(`${tLbl(name)} ${tMsg('isRequired')}`);

/* export const validateTransLimit = (name: string, maxLimit: number) =>
  yup
    .number()
    .max(maxLimit, `${maxLimit} is max`)
    .nullable(true)
    .transform((value) => (isNaN(value) || value === null || value === undefined ? null : value)); */

export const validatePassMatch = (name: string) =>
  yup
    .string()
    .trim()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required(getRequiredMsg(name));

export const validateEmail = (name = 'email') => yup.string().email(getEmailMsg(name)).required(getRequiredMsg(name));

export enum DatePickerErrors {
  invalidDate = 'Invalid Date Format',
  shouldDisableDate = 'Should disable Date',
  disableFuture = 'Start Date should not be greater than End Date',
  disablePast = 'End Date should not be less than Start Date',
  minDate = 'Date should not be less than Min Date',
  maxDate = 'Date should not be greater than Max Date',
}
