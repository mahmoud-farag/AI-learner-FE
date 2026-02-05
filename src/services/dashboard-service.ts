import { isAxiosError } from 'axios';
import axiosClient from '../utils/axiosClient';
import { IDashboardData, IResponse } from './interfaces';

const DASHBOARD_PATHS = {
  GET_DASHBOARD: '/api/dashboard',
};


interface IDashboardService {
  dashboardData: () => Promise<IResponse<IDashboardData>>;
}

class DashboardService implements IDashboardService {

  private errorHandler = (error: unknown, defaultMessage = 'Unknown Error occurred'): never => {
    if (isAxiosError(error)) {
      throw error.response?.data ?? { message: defaultMessage };
    }
    throw new Error(defaultMessage);
  }

  dashboardData = async (): Promise<IResponse<IDashboardData>> => {
    try {
      const response = await axiosClient.get(DASHBOARD_PATHS.GET_DASHBOARD);
      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while fetching dashboard data');
    }
  }
}

export default new DashboardService();