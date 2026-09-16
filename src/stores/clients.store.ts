import { create } from 'zustand';
import { clientsApi } from '../api/clients.api';
import {
  IClient,
  ICreateClient,
  IUpdateClient,
} from '../interfaces/client.interface';
import { toast } from 'sonner';

interface IClientsStore {
  clients: IClient[];
  isLoading: boolean;
  fetchClients: () => Promise<void>;
  createClient: (client: ICreateClient) => Promise<boolean>;
  updateClient: (id: number, client: IUpdateClient) => Promise<boolean>;
  deleteClient: (id: number) => Promise<boolean>;
}

export const useClientsStore = create<IClientsStore>((set, get) => ({
  clients: [],
  isLoading: false,

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const data = await clientsApi.getAll();
      set({ clients: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createClient: async (client: ICreateClient) => {
    try {
      await clientsApi.create(client);
      toast.success('Cliente empresa registrado con éxito');
      await get().fetchClients();
      return true;
    } catch {
      return false;
    }
  },

  updateClient: async (id: number, client: IUpdateClient) => {
    try {
      await clientsApi.update(id, client);
      toast.success('Cliente empresa actualizado con éxito');
      await get().fetchClients();
      return true;
    } catch {
      return false;
    }
  },

  deleteClient: async (id: number) => {
    try {
      await clientsApi.delete(id);
      toast.success('Cliente empresa eliminado con éxito');
      await get().fetchClients();
      return true;
    } catch {
      return false;
    }
  },
}));

