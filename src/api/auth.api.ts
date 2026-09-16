import { apiClient } from '../lib/axios/api-client';
import { ILoginRequest, ILoginResponse } from '../interfaces/auth.interface';
import { IApiResponse } from '../interfaces/api-response.interface';

export const authApi = {
  login: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
    const response = await apiClient.post<IApiResponse<ILoginResponse>>(
      '/auth/login',
      credentials,
    );
    return response.data.data!;
  },
};

