import React from 'react';
import { Box, Stack, Card, Typography, CardHeader, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Page from 'components/Page';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import useAuthService from 'hooks/useAuthService';

interface IProfileItem {
  label: string;
  data: string;
}

const ProfileItem = ({ label, data }: IProfileItem) => {
  return (
    <Stack direction="row" mb={3} spacing={2}>
      <Box sx={{ width: '40%', textAlign: 'right' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {label + ':'}
        </Typography>
      </Box>
      <Box sx={{ width: '60%' }}>
        <Typography variant="body2" sx={{ pr: 3, flexShrink: 0, color: 'text.primary' }}>
          {data}
        </Typography>
      </Box>
    </Stack>
  );
};

export const Profile = () => {
  const { authUser } = useAuthService();
  // const [userInfo, setUserInfo] = useState<IGetProfileReturn>();
  const { t } = useTranslation(['labels']);
  // const { showToast } = useToast();

  // useEffect(() => {
  //   getProfile()
  //     .then((data) => setUserInfo(data))
  //     .catch((err: IApiError) => {
  //       showToast({ message: err.description, type: 'error' });
  //     });
  // });

  return (
    <DashboardLayout>
      <Page title="Profile">
        <Container maxWidth="xl">
          <Typography variant="h4" gutterBottom>
            {t('labels:profile')}
          </Typography>
          {authUser && (
            <Card>
              <CardHeader title="" />
              <ProfileItem label={t('labels:username')} data={authUser.userName} />
              <ProfileItem label={t('labels:firstName')} data={authUser.firstName} />
              <ProfileItem label={t('labels:lastName')} data={authUser.lastName} />
              <ProfileItem label={t('labels:emailAddress')} data={authUser.emailAddress} />
              <ProfileItem label={t('labels:mobileNumber')} data={authUser.mobileNumber} />
              <ProfileItem label={t('labels:role')} data={authUser.roles[0].name} />
              <ProfileItem label={t('labels:branch')} data={authUser.branch.name} />
              <ProfileItem label={t('labels:institution')} data={authUser.institution.name} />
            </Card>
          )}
        </Container>
      </Page>
    </DashboardLayout>
  );
};
