export interface IApiResponse<T = undefined> {
  statusCode: number;
  message: string;
  data?: T;
  exception?: string;
}

