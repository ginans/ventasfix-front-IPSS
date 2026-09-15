import { CrudAdapter } from '../lib/axios/crud-adapter';
import {
  IClient,
  ICreateClient,
  IUpdateClient,
} from '../interfaces/client.interface';

export const clientsApi = {
  getAll: () => CrudAdapter.getAll<IClient>('/clients'),
  getById: (id: number) => CrudAdapter.getById<IClient>('/clients', id),
  create: (client: ICreateClient) =>
    CrudAdapter.create<ICreateClient>('/clients', client),
  update: (id: number, client: IUpdateClient) =>
    CrudAdapter.update<IUpdateClient>('/clients', id, client),
  delete: (id: number) => CrudAdapter.delete('/clients', id),
};

