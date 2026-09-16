import { apiClient } from '../lib/axios/api-client';
import { IDashboardStats } from '../interfaces/dashboard.interface';
import { IApiResponse } from '../interfaces/api-response.interface';

export const dashboardApi = {
  getStats: async (): Promise<IDashboardStats> => {
    const response = await apiClient.get<IApiResponse<IDashboardStats>>(
      '/dashboard/stats',
    );
    return response.data.data!;
  },
};

