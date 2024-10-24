import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, IconButton, MenuItem } from '@mui/material';
import PendingRequestDetails from 'pages/AdminManagement/PendingRequests/PendingRequestDetails';
import { MoreVertIcon, ReadMoreIcon, ThumbDownAltIcon, ThumbUpAltIcon } from 'components/appIcons';
import AppModal from 'components/AppModal';
import { IPendingRequest } from './PendingRequests.model';

interface IPendingRequestsActionMenuProps {
  request: IPendingRequest;
  doApproveRequest: (request: IPendingRequest) => void;
  doDeclineRequest: (request: IPendingRequest) => void;
}

const PendingRequestsActionMenu: React.FC<IPendingRequestsActionMenuProps> = ({
  request,
  doApproveRequest,
  doDeclineRequest,
}) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenMenu = useCallback(() => {
    setIsOpen(true);
  }, []);
  const handleCloseMenu = useCallback(() => {
    setIsOpen(false);
  }, []);
  const handleOpenDetails = useCallback(() => {
    setIsDetailsOpen(true);
  }, []);
  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);
  const handleApprove = () => doApproveRequest(request);
  const declineApprove = () => doDeclineRequest(request);

  const modalTitle = useMemo(
    () => request.description?.match(/(?<=^).*(?=\s-)/gm)?.[0] || t('labels:details'),
    [request.description]
  );

  return (
    <>
      <IconButton ref={ref} onClick={handleOpenMenu}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleOpenDetails} sx={{ color: 'info.main' }}>
          <ReadMoreIcon /> {t('labels:details')}
        </MenuItem>
        {/* TODO: add loading visuals when approving or declining */}
        <MenuItem onClick={handleApprove} sx={{ color: 'success.main' }}>
          <ThumbUpAltIcon /> {t('labels:approve')}
        </MenuItem>
        <MenuItem onClick={declineApprove} sx={{ color: 'error.main' }}>
          <ThumbDownAltIcon /> {t('labels:decline')}
        </MenuItem>
      </Menu>

      {/* TODO: Add translations */}
      <AppModal title={modalTitle} open={isDetailsOpen} onClose={handleCloseDetails} size="md">
        <PendingRequestDetails request={request}></PendingRequestDetails>
      </AppModal>
    </>
  );
};

export default PendingRequestsActionMenu;
