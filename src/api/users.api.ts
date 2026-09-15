import { CrudAdapter } from '../lib/axios/crud-adapter';
import { IUser, ICreateUser, IUpdateUser } from '../interfaces/user.interface';

export const usersApi = {
  getAll: () => CrudAdapter.getAll<IUser>('/users'),
  getById: (id: number) => CrudAdapter.getById<IUser>('/users', id),
  create: (user: ICreateUser) => CrudAdapter.create<ICreateUser>('/users', user),
  update: (id: number, user: IUpdateUser) =>
    CrudAdapter.update<IUpdateUser>('/users', id, user),
  delete: (id: number) => CrudAdapter.delete('/users', id),
};

