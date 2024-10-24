import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { EditIcon } from 'components/appIcons';
import { IConfig } from './AppConfigs.model';

interface IConfigsActionMenu {
  config: IConfig;
  triggerEditConfig: (config: IConfig) => void;
}

const AppConfigsActionMenu: React.FC<IConfigsActionMenu> = ({ config, triggerEditConfig }) => {
  const { t } = useTranslation();

  const doEditConfig = useCallback(() => {
    triggerEditConfig(config);
  }, [triggerEditConfig, config]);

  return (
    <Button onClick={doEditConfig} startIcon={<EditIcon />}>
      {t('labels:edit')}
    </Button>
  );
};

export default AppConfigsActionMenu;
