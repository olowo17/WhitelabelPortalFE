import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { EditIcon } from 'components/appIcons';
import { ICategory } from './Categories.model';

interface ICategoriesActionMenuProps {
  category: ICategory;
  triggerEditCategory: (category: ICategory) => void;
}

const CategoriesActionMenu: React.FC<ICategoriesActionMenuProps> = ({ category, triggerEditCategory }) => {
  const doEdit = useCallback(() => triggerEditCategory(category), [category, triggerEditCategory]);

  // switch to dropdown menu if more than one action is required, look at users module for reference.
  return (
    <Button onClick={doEdit} startIcon={<EditIcon />}>
      Edit
    </Button>
  );
};

export default CategoriesActionMenu;
