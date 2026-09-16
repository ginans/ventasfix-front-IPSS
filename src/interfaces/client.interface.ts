export interface IClient {
  id: number;
  rutEmpresa: string;
  rubro: string;
  razonSocial: string;
  telefono: string;
  direccion: string;
  nombreContacto: string;
  emailContacto: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateClient {
  rutEmpresa: string;
  rubro: string;
  razonSocial: string;
  telefono: string;
  direccion: string;
  nombreContacto: string;
  emailContacto: string;
}

export interface IUpdateClient {
  rutEmpresa?: string;
  rubro?: string;
  razonSocial?: string;
  telefono?: string;
  direccion?: string;
  nombreContacto?: string;
  emailContacto?: string;
}

