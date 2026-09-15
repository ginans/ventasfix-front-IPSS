import { EStockStatus } from '../enums/stock-status.enum';

export interface IProduct {
  id: number;
  sku: string;
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  imagen: string;
  precioNeto: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: number;
  stockAlto: number;
  stockStatus?: EStockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProduct {
  sku: string;
  nombre: string;
  descripcionCorta: string;
  descripcionLarga: string;
  imagen: string;
  precioNeto: number;
  precioVenta?: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: number;
  stockAlto: number;
}

export interface IUpdateProduct {
  sku?: string;
  nombre?: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  imagen?: string;
  precioNeto?: number;
  precioVenta?: number;
  stockActual?: number;
  stockMinimo?: number;
  stockBajo?: number;
  stockAlto?: number;
}

