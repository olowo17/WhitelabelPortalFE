import React, { useCallback, useRef, useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { EditIcon, MoreVertIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { IInstitution } from './Institutions.model';

interface IInstitutionsActionMenuProps {
  id: RecordValue;
  institution: IInstitution;
  triggerEditInstitution: (institution: IInstitution) => void;
}

const InstitutionsActionMenu: React.FC<IInstitutionsActionMenuProps> = ({ institution, triggerEditInstitution }) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const doEditInstitution = useCallback(() => {
    triggerEditInstitution(institution);
  }, [triggerEditInstitution, institution]);

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={doEditInstitution}>
          <EditIcon /> Edit
        </MenuItem>
      </Menu>
    </>
  );
};

export default InstitutionsActionMenu;
