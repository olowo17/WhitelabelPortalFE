import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { IPendingRequest } from 'pages/AdminManagement/PendingRequests/PendingRequests.model';

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

interface IPendingRequestDetails {
  request: IPendingRequest;
}

const PendingRequestDetails: React.FC<IPendingRequestDetails> = ({ request: { additionalInfo } }) => {
  const getContent = () => {
    try {
      const entries = Object.entries<any>(JSON.parse(additionalInfo));
      return entries.map(([label, data], key) => <DetailsItem key={key} label={label} data={data} />);
    } catch {
      return <Typography sx={{ margin: 3 }}>Can&apos;t get additional details. Please, try again</Typography>;
    }
  };
  // const requestFor = useMemo(() => description.match(/(?<=for:\s).*(?=,)/gm), [description]);
  // const requestFrom = useMemo(() => description.match(/(?<=from:\s).*(?=$)/gm), [description]);

  return (
    <>
      {getContent()}
      {/* <Divider />
      {requestFor && <DetailsItem label={'for'} data={requestFor} />}
      {requestFrom && <DetailsItem label={'from'} data={requestFrom} />} */}
    </>
  );
};

export default PendingRequestDetails;
