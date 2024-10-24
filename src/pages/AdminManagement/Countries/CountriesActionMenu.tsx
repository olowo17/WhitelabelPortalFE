import React, { useCallback, useRef, useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { EditIcon, MoreVertIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { ICountry } from './Countries.model';

interface ICountriesActionMenuProps {
  id: RecordValue;
  institution: ICountry;
  triggerEditCountry: (institution: ICountry) => void;
}

const CountriesActionMenu: React.FC<ICountriesActionMenuProps> = ({ institution, triggerEditCountry }) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const doEditCountry = useCallback(() => {
    triggerEditCountry(institution);
  }, [triggerEditCountry, institution]);

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
        <MenuItem onClick={doEditCountry}>
          <EditIcon /> Edit
        </MenuItem>
      </Menu>
    </>
  );
};

export default CountriesActionMenu;
