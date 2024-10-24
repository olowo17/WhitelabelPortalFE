import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { EditIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { ICustomerLimit } from './CustomerLimits.model';

interface ICustomerLimitsActionMenuProps {
  id: RecordValue;
  limit: ICustomerLimit;
  triggerEditLimit: (customer: ICustomerLimit) => void;
}

const CustomerLimitsActionMenu: React.FC<ICustomerLimitsActionMenuProps> = ({ limit, triggerEditLimit }) => {
  const doEdit = useCallback(() => triggerEditLimit(limit), [limit, triggerEditLimit]);

  // switch to dropdown menu if more than one action is required, look at users module for reference.
  return (
    <Button onClick={doEdit} startIcon={<EditIcon />}>
      Edit
    </Button>
  );
};

export default CustomerLimitsActionMenu;
