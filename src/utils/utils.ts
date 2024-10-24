import React from 'react';
import Papa from 'papaparse';
import moment from 'moment';
import { AnyRec } from 'models';

/**
 * Helps maintain the values and onchange event handler for controlled form inputs
 * it saves the form values in the state of a class component
 *
 * @param component
 * @param stateKey
 */
export const withFormValuesState = <C extends React.Component<any, any>, K extends keyof C['state'], V extends keyof K>(
  component: C,
  stateKey: K
): [(event: any, forceName?: keyof V) => void, (newValues?: Record<keyof V, any>) => void] => {
  const updateValue = (event: React.ChangeEvent<HTMLInputElement>, forceName?: keyof V) => {
    const { name, type, value, checked } = event.target;
    const finalValue = type === 'checkbox' ? (checked ? value || true : false) : value;
    component.setState((prev: C['state']) => ({
      ...prev,
      [stateKey]: { ...prev[stateKey], [forceName || name]: finalValue },
    }));
  };

  const resetValues = (newValues?: Record<string, any>) => {
    component.setState((prev: C['state']) => ({ ...prev, [stateKey]: { ...newValues } }));
  };

  return [updateValue, resetValues];
};

/**
 * Gets the value of sub objects by using a dot notation path
 *
 * @param obj root object
 * @param path path to get value from
 */
export const objectGet = (obj: AnyRec, path: string): any =>
  path.split('.').reduce((o, i) => {
    if (o == null) {
      return null;
    }
    return o[i];
  }, obj) as any;

/**
 * Ensures only certain fields in a set of records are gotten from the records, using the columns passed.
 *
 * @param records the record set
 * @param columns array of the props and names of records to allow
 * @param excludeNames array of column names to exclude from the columns
 */
export const mapRecordsToTableData = (
  records: AnyRec[],
  columns: { name: string; prop: string }[],
  excludeNames?: string[]
): AnyRec[] => {
  const allowedColumns = excludeNames ? columns.filter((col) => excludeNames.indexOf(col.name) === -1) : columns;

  return records.map((item) => {
    const newItem: Record<string, any> = {};
    for (const column of allowedColumns) {
      newItem[column.name] = objectGet(item, column.prop);
    }
    return newItem;
  });
};

/**
 * Downloads CSV file, takes an object, converts it to csv and triggers a download on the browser for the csv.
 * @param data
 * @param fileName
 */
export const downloadDataCSV = <DT extends AnyRec[]>(data: DT, fileName = 'export') => {
  const csv = Papa.unparse(data);

  const downloadFileName = fileName + '.csv';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', downloadFileName);
  link.style.visibility = 'hidden';
  link.style.height = '0';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatDate = (date: Date, asDateEnd = false, format = 'MM/DD/YYYY') => {
  const moDate = moment(date);
  return asDateEnd ? moDate.format(`${format} 23:59:59`) : moDate.format(`${format} 00:00:00`);
};

interface IReadConfig {
  /**
   * array of mime types allowed e.g ['image/jpeg']
   */
  allowedMimes?: string[];
  /**
   * max size in mb
   */
  maxSize?: number;
}

export const readFileAsBase64 = (file: File, config: IReadConfig = {}): Promise<string> =>
  new Promise((resolve, reject) => {
    const { allowedMimes, maxSize } = config;

    if (!file) {
      reject('No file selected!');
    }
    const { size = 0, type = '' } = file || {};
    const fileSize = parseFloat((size / 1024 / 1024).toFixed(4));
    const reader = new FileReader();

    reader.onload = () => {
      if (fileSize === 0) {
        return reject('Cannot read file!');
      }
      if (allowedMimes && !allowedMimes.includes(type)) {
        return reject('File type is not allowed!');
      }
      if (maxSize && fileSize > maxSize) {
        const sizeStr = maxSize < 1 ? Math.round(maxSize * 1000) + 'KB' : maxSize + 'MB';
        return reject('File exceeds maximum size of ' + sizeStr);
      }

      if (!reader.result) {
        return reject('Could not read file');
      }

      resolve(reader.result.toString());
    };

    reader.onerror = () => {
      reject('Could not read file');
    };

    reader.readAsDataURL(file);
  });

export const trimName = (nameToTrim: string) => {
  if (nameToTrim.length > 20) {
    let newTrimmedName;
    if (nameToTrim.lastIndexOf('.') !== -1) {
      const namePart = nameToTrim.substring(0, nameToTrim.lastIndexOf('.'));
      const extension = nameToTrim.substring(nameToTrim.lastIndexOf('.'));
      newTrimmedName = `${namePart.substring(0, 20)}...  ${extension}`;
    } else {
      newTrimmedName = `${nameToTrim.substring(0, 20)}... `;
    }
    return newTrimmedName;
  }
  return nameToTrim;
};
