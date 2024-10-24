import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { EditIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { IGlobalLimit } from './GlobalLimits.model';

interface IGlobalLimitsActionMenuProps {
  id: RecordValue;
  limit: IGlobalLimit;
  triggerEditLimit: (limit: IGlobalLimit) => void;
}

const GlobalLimitsActionMenu: React.FC<IGlobalLimitsActionMenuProps> = ({ limit, triggerEditLimit }) => {
  const doEdit = useCallback(() => triggerEditLimit(limit), [limit, triggerEditLimit]);

  // switch to dropdown menu if more than one action is required, look at users module for reference.
  return (
    <Button onClick={doEdit} startIcon={<EditIcon />}>
      Edit
    </Button>
  );
};

export default GlobalLimitsActionMenu;
