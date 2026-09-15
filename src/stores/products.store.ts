import { create } from 'zustand';
import { productsApi } from '../api/products.api';
import {
  IProduct,
  ICreateProduct,
  IUpdateProduct,
} from '../interfaces/product.interface';
import { toast } from 'sonner';

interface IProductsStore {
  products: IProduct[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (product: ICreateProduct) => Promise<boolean>;
  updateProduct: (id: number, product: IUpdateProduct) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProductsStore = create<IProductsStore>((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const data = await productsApi.getAll();
      set({ products: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createProduct: async (product: ICreateProduct) => {
    try {
      await productsApi.create(product);
      toast.success('Producto agregado con éxito');
      await get().fetchProducts();
      return true;
    } catch {
      return false;
    }
  },

  updateProduct: async (id: number, product: IUpdateProduct) => {
    try {
      await productsApi.update(id, product);
      toast.success('Producto actualizado con éxito');
      await get().fetchProducts();
      return true;
    } catch {
      return false;
    }
  },

  deleteProduct: async (id: number) => {
    try {
      await productsApi.delete(id);
      toast.success('Producto eliminado con éxito');
      await get().fetchProducts();
      return true;
    } catch {
      return false;
    }
  },
}));

