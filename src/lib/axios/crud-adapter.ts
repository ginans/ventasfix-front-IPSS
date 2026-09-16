import { apiClient } from './api-client';
import { IApiResponse } from '../../interfaces/api-response.interface';

export class CrudAdapter {
  static async getAll<T>(endpoint: string): Promise<T[]> {
    const response = await apiClient.get<IApiResponse<T[]>>(endpoint);
    return response.data.data ?? [];
  }

  static async getById<T>(
    endpoint: string,
    id: number | string,
  ): Promise<T> {
    const response = await apiClient.get<IApiResponse<T>>(`${endpoint}/${id}`);
    return response.data.data as T;
  }

  static async create<TBody, TResponse = IApiResponse>(
    endpoint: string,
    body: TBody,
  ): Promise<TResponse> {
    const response = await apiClient.post<TResponse>(endpoint, body);
    return response.data;
  }

  static async update<TBody, TResponse = IApiResponse>(
    endpoint: string,
    id: number | string,
    body: TBody,
  ): Promise<TResponse> {
    const response = await apiClient.put<TResponse>(`${endpoint}/${id}`, body);
    return response.data;
  }

  static async delete<TResponse = IApiResponse>(
    endpoint: string,
    id: number | string,
  ): Promise<TResponse> {
    const response = await apiClient.delete<TResponse>(`${endpoint}/${id}`);
    return response.data;
  }
}

