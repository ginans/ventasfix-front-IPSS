import { create } from 'zustand';
import { dashboardApi } from '../api/dashboard.api';
import { IDashboardStats } from '../interfaces/dashboard.interface';

interface IDashboardStore {
  stats: IDashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<IDashboardStore>((set) => ({
  stats: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const data = await dashboardApi.getStats();
      set({ stats: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

