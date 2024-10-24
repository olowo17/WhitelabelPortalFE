import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { IAuditReport } from './AuditReport.model';

interface IDetailsItem {
  label: string;
  data: any;
}

const DetailsItem = ({ label, data }: IDetailsItem) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="left" m={3} spacing={2}>
      <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 110 }} noWrap>
          {label + ':'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ pr: 3, flexShrink: 0, color: 'text.primary' }}>
          {String(data)}
        </Typography>
      </Box>
    </Stack>
  );
};

interface IAuditReportDetails {
  auditReport: IAuditReport;
}

const AuditReportDetails = ({ auditReport: { details } }: IAuditReportDetails) => {
  const getContent = () => {
    try {
      return <DetailsItem label="Details" data={details} />;
    } catch {
      return <Typography sx={{ margin: 3 }}>Can&apos;t get additional details. Please, try again</Typography>;
    }
  };

  return <>{getContent()}</>;
};

export default AuditReportDetails;
