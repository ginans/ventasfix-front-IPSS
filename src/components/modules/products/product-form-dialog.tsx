'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/interfaces/product.interface';
import { Loader2, Calculator } from 'lucide-react';

const productSchema = z.object({
  sku: z.string().min(1, 'El código SKU es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcionCorta: z.string().min(1, 'La descripción corta es obligatoria'),
  descripcionLarga: z.string().min(1, 'La descripción larga es obligatoria'),
  imagen: z.string().min(1, 'La URL de la imagen es obligatoria'),
  precioNeto: z.coerce.number().min(0, 'El precio neto no puede ser negativo'),
  precioVenta: z.coerce.number().min(0, 'El precio de venta no puede ser negativo'),
  stockActual: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo'),
  stockBajo: z.coerce.number().min(0, 'El stock bajo no puede ser negativo'),
  stockAlto: z.coerce.number().min(0, 'El stock alto no puede ser negativo'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<boolean>;
  productToEdit?: IProduct | null;
}

export function ProductFormDialog({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}: ProductFormDialogProps) {
  const isEditing = Boolean(productToEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      nombre: '',
      descripcionCorta: '',
      descripcionLarga: '',
      imagen: '',
      precioNeto: 0,
      precioVenta: 0,
      stockActual: 0,
      stockMinimo: 0,
      stockBajo: 0,
      stockAlto: 0,
    },
  });

  const precioNetoValue = watch('precioNeto');

  // Cálculo dinámico automático de IVA 19%
  const handleNetoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const neto = parseFloat(e.target.value) || 0;
    setValue('precioNeto', neto);
    setValue('precioVenta', Math.round(neto * 1.19));
  };

  useEffect(() => {
    if (productToEdit) {
      reset({
        sku: productToEdit.sku,
        nombre: productToEdit.nombre,
        descripcionCorta: productToEdit.descripcionCorta,
        descripcionLarga: productToEdit.descripcionLarga,
        imagen: productToEdit.imagen,
        precioNeto: productToEdit.precioNeto,
        precioVenta: productToEdit.precioVenta,
        stockActual: productToEdit.stockActual,
        stockMinimo: productToEdit.stockMinimo,
        stockBajo: productToEdit.stockBajo,
        stockAlto: productToEdit.stockAlto,
      });
    } else {
      reset({
        sku: '',
        nombre: '',
        descripcionCorta: '',
        descripcionLarga: '',
        imagen: '',
        precioNeto: 0,
        precioVenta: 0,
        stockActual: 0,
        stockMinimo: 0,
        stockBajo: 0,
        stockAlto: 0,
      });
    }
  }, [productToEdit, reset, isOpen]);

  const handleFormSubmit = async (data: ProductFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Producto del Catálogo' : 'Agregar Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku">Código SKU</Label>
              <Input id="sku" placeholder="FIX-001" {...register('sku')} />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre Comercial</Label>
              <Input
                id="nombre"
                placeholder="Taladro Percutor 20V"
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcionCorta">Descripción Corta</Label>
            <Input
              id="descripcionCorta"
              placeholder="Herramienta eléctrica para uso profesional..."
              {...register('descripcionCorta')}
            />
            {errors.descripcionCorta && (
              <p className="text-xs text-destructive">
                {errors.descripcionCorta.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcionLarga">Descripción Larga</Label>
            <textarea
              id="descripcionLarga"
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Especificaciones técnicas completas..."
              {...register('descripcionLarga')}
            />
            {errors.descripcionLarga && (
              <p className="text-xs text-destructive">
                {errors.descripcionLarga.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imagen">URL de la Imagen (solo una)</Label>
            <Input
              id="imagen"
              placeholder="https://images.unsplash.com/..."
              {...register('imagen')}
            />
            {errors.imagen && (
              <p className="text-xs text-destructive">{errors.imagen.message}</p>
            )}
          </div>

          {/* Precios con cálculo automático de IVA 19% */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border">
            <div className="space-y-1.5">
              <Label htmlFor="precioNeto">Precio Neto ($)</Label>
              <Input
                id="precioNeto"
                type="number"
                min="0"
                value={precioNetoValue}
                onChange={handleNetoChange}
              />
              {errors.precioNeto && (
                <p className="text-xs text-destructive">
                  {errors.precioNeto.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="precioVenta">Precio Venta (IVA 19%)</Label>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Calculator className="h-3 w-3" /> +19% auto
                </span>
              </div>
              <Input
                id="precioVenta"
                type="number"
                min="0"
                {...register('precioVenta')}
              />
              {errors.precioVenta && (
                <p className="text-xs text-destructive">
                  {errors.precioVenta.message}
                </p>
              )}
            </div>
          </div>

          {/* Gestión de Stocks */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="stockActual" className="text-xs">Stock Actual</Label>
              <Input id="stockActual" type="number" min="0" {...register('stockActual')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockMinimo" className="text-xs">Stock Mínimo</Label>
              <Input id="stockMinimo" type="number" min="0" {...register('stockMinimo')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockBajo" className="text-xs">Stock Bajo</Label>
              <Input id="stockBajo" type="number" min="0" {...register('stockBajo')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockAlto" className="text-xs">Stock Alto</Label>
              <Input id="stockAlto" type="number" min="0" {...register('stockAlto')} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

