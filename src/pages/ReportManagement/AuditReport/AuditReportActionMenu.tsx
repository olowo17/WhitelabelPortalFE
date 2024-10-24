import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { ReadMoreIcon } from 'components/appIcons';
import AppModal from 'components/AppModal';
import { RecordValue } from 'components/AppTable';
import AuditReportDetails from './AuditReportDetails';
import { IAuditReport } from './AuditReport.model';

interface IAuditReportActionMenuProps {
  id: RecordValue;
  auditReport: IAuditReport;
}

const AuditReportActionMenu = ({ auditReport }: IAuditReportActionMenuProps) => {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = useCallback(() => {
    setIsDetailsOpen(true);
  }, []);
  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  const modalTitle = useMemo(
    () => `${t('labels:viewMoreDetailsAbout')} ${auditReport.auditType}`,
    [auditReport.auditType]
  );

  return (
    <>
      <Button onClick={handleOpenDetails} startIcon={<ReadMoreIcon />} sx={{ color: 'info.main' }}>
        {t('labels:details')}
      </Button>

      <AppModal title={modalTitle} open={isDetailsOpen} onClose={handleCloseDetails} size="md">
        <AuditReportDetails auditReport={auditReport}></AuditReportDetails>
      </AppModal>
    </>
  );
};

export default AuditReportActionMenu;
