import { CrudAdapter } from '../lib/axios/crud-adapter';
import {
  IProduct,
  ICreateProduct,
  IUpdateProduct,
} from '../interfaces/product.interface';

export const productsApi = {
  getAll: () => CrudAdapter.getAll<IProduct>('/products'),
  getById: (id: number) => CrudAdapter.getById<IProduct>('/products', id),
  create: (product: ICreateProduct) =>
    CrudAdapter.create<ICreateProduct>('/products', product),
  update: (id: number, product: IUpdateProduct) =>
    CrudAdapter.update<IUpdateProduct>('/products', id, product),
  delete: (id: number) => CrudAdapter.delete('/products', id),
};

