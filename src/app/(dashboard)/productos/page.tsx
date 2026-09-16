'use client';

import React, { useEffect, useState } from 'react';
import { useProductsStore } from '@/stores/products.store';
import { IProduct, ICreateProduct } from '@/interfaces/product.interface';
import { EStockStatus } from '@/enums/stock-status.enum';
import { DataTable, IDataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ProductFormDialog } from '@/components/modules/products/product-form-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function ProductosPage() {
  const {
    products,
    isLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<IProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: IProduct) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: ICreateProduct) => {
    if (productToEdit) {
      return updateProduct(productToEdit.id, formData);
    }
    return createProduct(formData);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    await deleteProduct(productToDelete.id);
    setIsDeleting(false);
    setProductToDelete(null);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStockBadge = (status?: EStockStatus, actual?: number) => {
    switch (status) {
      case EStockStatus.CRITICAL:
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{actual}</span>
            <Badge variant="destructive" className="font-mono">
              Crítico
            </Badge>
          </div>
        );
      case EStockStatus.LOW:
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{actual}</span>
            <Badge variant="warning" className="font-mono">
              Bajo
            </Badge>
          </div>
        );
      case EStockStatus.NORMAL:
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{actual}</span>
            <Badge variant="success" className="font-mono">
              Normal
            </Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{actual}</span>
            <Badge variant="secondary" className="font-mono">
              Alto
            </Badge>
          </div>
        );
    }
  };

  const columns: IDataTableColumn<IProduct>[] = [
    {
      key: 'sku',
      label: 'SKU',
      render: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
          {item.sku}
        </span>
      ),
    },
    {
      key: 'nombre',
      label: 'Producto',
      render: (item) => (
        <div>
          <p className="font-medium text-sm leading-tight">{item.nombre}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.descripcionCorta}
          </p>
        </div>
      ),
    },
    {
      key: 'precioNeto',
      label: 'Neto',
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatPrice(item.precioNeto)}
        </span>
      ),
    },
    {
      key: 'precioVenta',
      label: 'Venta (IVA 19%)',
      render: (item) => (
        <span className="font-semibold text-sm text-foreground">
          {formatPrice(item.precioVenta)}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Inventario Actual',
      render: (item) =>
        renderStockBadge(item.stockStatus, item.stockActual),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="h-8 px-2 text-xs"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setProductToDelete(item)}
            className="h-8 px-2 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Control de Productos</h2>
          <p className="text-sm text-muted-foreground">
            Catálogo con cálculo de IVA 19% y monitoreo de niveles de stock
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <DataTable<IProduct>
        data={products}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar por SKU, nombre o descripción..."
        searchFilter={(item, query) =>
          item.sku.toLowerCase().includes(query) ||
          item.nombre.toLowerCase().includes(query) ||
          item.descripcionCorta.toLowerCase().includes(query)
        }
      />

      <ProductFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        productToEdit={productToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        description={`¿Está seguro de que desea eliminar el producto "${productToDelete?.nombre}" (${productToDelete?.sku})? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

