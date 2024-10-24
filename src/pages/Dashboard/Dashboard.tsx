import React, { useCallback, useEffect, useState } from 'react';
import { Container, Stack, Typography, Card, Grid, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import * as yup from 'yup';
import { Box } from '@mui/system';
import { SearchIcon } from 'components/appIcons';
import CustomDatePicker from 'components/CustomDatePicker';
import Page from 'components/Page';
import { TableToolbar } from 'components/TableToolbar';
import { useFormValues } from 'hooks/useFormValues';
import useToast from 'hooks/useToast';
import DashboardLayout from 'layouts/DashboardLayout/DashboardLayout';
import { IApiError } from 'models';
import { requiredOnly } from 'utils/validation';
import { formatDate } from 'utils/utils';
import { IDashboard, IGetDashboardBody } from './Dashboard.model';
import { getDashboardData } from './Dashboard.servise';

Chart.register(ArcElement, Tooltip, Legend);

const today = new Date();
const endDate = formatDate(today, true);
const startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));

const options = {
  cutout: 40,
  plugins: {
    legend: { labels: { usePointStyle: true, pointStyle: 'circle' } },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          let label = context.label || '';
          if (context.parsed != null) {
            label = context.parsed + '%';
          }
          return label;
        },
      },
    },
  },
};

const schema = yup.object().shape({
  endDate: requiredOnly('endDate'),
  startDate: requiredOnly('startDate'),
});

const Dashboard = () => {
  const { t } = useTranslation(['labels']);

  const { values, updateValueByName, errors, setExtErrors, touched, setTouched } = useFormValues<IGetDashboardBody>(
    { startDate, endDate },
    schema
  );
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(false);

  const [dashboardData, setDashboardData] = useState<IDashboard[]>([]);

  const searchDashboardData = useCallback(() => {
    setFetching(true);
    getDashboardData(values)
      .then((data) => {
        setDashboardData(data.dashboard);
      })
      .catch((err: IApiError) => {
        showToast({ message: err.description, type: 'error' });
      })
      .finally(() => setFetching(false));
  }, [values]);

  const onSearchSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      searchDashboardData();
    },
    [searchDashboardData]
  );

  useEffect(() => {
    searchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <Page title={t('labels:dashboard')}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {t('labels:dashboard')}
            </Typography>
          </Stack>

          <Card>
            <TableToolbar>
              <form style={{ width: '100%' }} onSubmit={onSearchSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <CustomDatePicker
                      name="startDate"
                      label="startDate"
                      value={values.startDate}
                      updateValueByName={updateValueByName}
                      touched={touched.startDate}
                      setTouched={setTouched}
                      error={errors?.startDate}
                      setExtErrors={setExtErrors}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomDatePicker
                      name="endDate"
                      label="endDate"
                      value={values.endDate}
                      updateValueByName={updateValueByName}
                      touched={touched.endDate}
                      setTouched={setTouched}
                      error={errors?.endDate}
                      setExtErrors={setExtErrors}
                      minDate={values.startDate ? new Date(values.startDate) : undefined}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Button type="submit" variant="contained" size="large" disabled={fetching || Boolean(errors)}>
                      <SearchIcon /> {t('labels:search')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TableToolbar>
          </Card>
        </Container>

        <Container maxWidth="xl" sx={{ marginTop: 3 }}>
          <Grid container spacing={2}>
            {dashboardData.length === 0 && <Box paddingLeft="16px">No result or Data Available</Box>}
            {dashboardData.map(({ title, period, total, volume, chart }) => (
              <Grid key={title} item xs={12} md={3}>
                <Card>
                  <Typography
                    sx={{
                      background: 'linear-gradient(135deg, #ff527a 0, #ff9575 100%);',
                      padding: 1,
                      color: '#FFFFFF',
                    }}
                  >
                    <Typography sx={{ fontSize: 16 }}>{title}</Typography>
                    <Typography sx={{ fontSize: 24 }}>
                      {total && new Intl.NumberFormat('en-GB').format(+total?.toFixed(2))}
                    </Typography>
                    <Typography sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <div>count: {volume}</div>
                      <div>{period}</div>
                    </Typography>
                  </Typography>
                  {chart && (
                    <Typography sx={{ padding: 2, display: 'flex', justifyContent: 'center' }}>
                      <Typography sx={{ width: 200 }}>
                        <Doughnut
                          data={{
                            labels: ['Failed', 'Successful'],
                            datasets: [
                              {
                                data: [chart.failureRate, chart.successRate],
                                backgroundColor: ['rgba(255, 99, 132)', 'rgba(54, 162, 235)'],
                              },
                            ],
                          }}
                          options={options as any}
                        />
                      </Typography>
                    </Typography>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export default Dashboard;
