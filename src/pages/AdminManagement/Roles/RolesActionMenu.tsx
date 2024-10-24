import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { EditIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { IRole } from './Roles.model';

interface IRolesActionMenuProps {
  id: RecordValue;
  role: IRole;
  triggerEditRole: (role: IRole) => void;
}

const RolesActionMenu: React.FC<IRolesActionMenuProps> = (props) => {
  const { role, triggerEditRole } = props;
  const doEdit = useCallback(() => triggerEditRole(role), [role, triggerEditRole]);

  // switch to dropdown menu if more than one action is required, look at users module for reference.
  return (
    <Button onClick={doEdit} startIcon={<EditIcon />}>
      Edit
    </Button>
  );
};

export default RolesActionMenu;
