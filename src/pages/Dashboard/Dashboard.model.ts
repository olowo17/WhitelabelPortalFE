export interface IChart {
  successRate: number;
  failureRate: number;
}

export interface IDashboard {
  title: string;
  period: string;
  total: number;
  volume: number;
  chart: IChart;
}

export interface IGetDashboardReturn {
  code: number;
  dashboard: IDashboard[];
  description: string;
}

export interface IGetDashboardBody {
  startDate: string;
  endDate: string;
}
