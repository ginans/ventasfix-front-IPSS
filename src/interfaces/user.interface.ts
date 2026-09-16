export interface IUser {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateUser {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role?: string;
}

export interface IUpdateUser {
  rut?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  role?: string;
}

