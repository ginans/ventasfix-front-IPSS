import { create } from 'zustand';
import { usersApi } from '../api/users.api';
import { IUser, ICreateUser, IUpdateUser } from '../interfaces/user.interface';
import { toast } from 'sonner';

interface IUsersStore {
  users: IUser[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (user: ICreateUser) => Promise<boolean>;
  updateUser: (id: number, user: IUpdateUser) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
}

export const useUsersStore = create<IUsersStore>((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const data = await usersApi.getAll();
      set({ users: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createUser: async (user: ICreateUser) => {
    try {
      await usersApi.create(user);
      toast.success('Usuario registrado con éxito');
      await get().fetchUsers();
      return true;
    } catch {
      return false;
    }
  },

  updateUser: async (id: number, user: IUpdateUser) => {
    try {
      await usersApi.update(id, user);
      toast.success('Usuario actualizado con éxito');
      await get().fetchUsers();
      return true;
    } catch {
      return false;
    }
  },

  deleteUser: async (id: number) => {
    try {
      await usersApi.delete(id);
      toast.success('Usuario eliminado con éxito');
      await get().fetchUsers();
      return true;
    } catch {
      return false;
    }
  },
}));

