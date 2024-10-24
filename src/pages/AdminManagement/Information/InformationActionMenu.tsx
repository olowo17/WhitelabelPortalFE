import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EditIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { IInformation } from './Information.model';

interface IInformationActionMenuProps {
  id: RecordValue;
  info: IInformation;
  triggerEditInfo: (info: IInformation) => void;
}

const InformationActionMenu: React.FC<IInformationActionMenuProps> = (props) => {
  const { info, triggerEditInfo } = props;
  const doEdit = useCallback(() => triggerEditInfo(info), [info, triggerEditInfo]);
  const { t } = useTranslation(['labels']);

  // switch to dropdown menu if more than one action is required, look at users module for reference.
  return (
    <Button onClick={doEdit} startIcon={<EditIcon />}>
      {t('labels:edit')}
    </Button>
  );
};

export default InformationActionMenu;
