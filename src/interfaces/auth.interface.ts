export interface IAuthUser {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  user: IAuthUser;
}

