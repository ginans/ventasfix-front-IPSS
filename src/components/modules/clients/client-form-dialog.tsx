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
import { IClient } from '@/interfaces/client.interface';
import { validateRut, formatRut } from '@/lib/rut';
import { Loader2 } from 'lucide-react';

const clientSchema = z.object({
  rutEmpresa: z
    .string()
    .min(1, 'El RUT de empresa es obligatorio')
    .refine(validateRut, { message: 'RUT inválido (revise el dígito verificador)' }),
  rubro: z.string().min(1, 'El giro o rubro es obligatorio'),
  razonSocial: z.string().min(1, 'La razón social es obligatoria'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  nombreContacto: z.string().min(1, 'El nombre de contacto es obligatorio'),
  emailContacto: z
    .string()
    .min(1, 'El correo de contacto es obligatorio')
    .email('Correo de contacto inválido'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<boolean>;
  clientToEdit?: IClient | null;
}

export function ClientFormDialog({
  isOpen,
  onClose,
  onSubmit,
  clientToEdit,
}: ClientFormDialogProps) {
  const isEditing = Boolean(clientToEdit);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      rutEmpresa: '',
      rubro: '',
      razonSocial: '',
      telefono: '',
      direccion: '',
      nombreContacto: '',
      emailContacto: '',
    },
  });

  useEffect(() => {
    if (clientToEdit) {
      reset({
        rutEmpresa: formatRut(clientToEdit.rutEmpresa),
        rubro: clientToEdit.rubro,
        razonSocial: clientToEdit.razonSocial,
        telefono: clientToEdit.telefono,
        direccion: clientToEdit.direccion,
        nombreContacto: clientToEdit.nombreContacto,
        emailContacto: clientToEdit.emailContacto,
      });
    } else {
      reset({
        rutEmpresa: '',
        rubro: '',
        razonSocial: '',
        telefono: '',
        direccion: '',
        nombreContacto: '',
        emailContacto: '',
      });
    }
  }, [clientToEdit, reset, isOpen]);

  const handleRutBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setValue('rutEmpresa', formatted, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente Empresa' : 'Registrar Nuevo Cliente Empresa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rutEmpresa">RUT Empresa</Label>
              <Input
                id="rutEmpresa"
                placeholder="76.086.428-5"
                {...register('rutEmpresa')}
                onBlur={handleRutBlur}
              />
              {errors.rutEmpresa && (
                <p className="text-xs text-destructive">
                  {errors.rutEmpresa.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rubro">Rubro o Giro</Label>
              <Input
                id="rubro"
                placeholder="Construcción e Ingeniería"
                {...register('rubro')}
              />
              {errors.rubro && (
                <p className="text-xs text-destructive">{errors.rubro.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="razonSocial">Razón Social</Label>
            <Input
              id="razonSocial"
              placeholder="Constructora Los Andes SpA"
              {...register('razonSocial')}
            />
            {errors.razonSocial && (
              <p className="text-xs text-destructive">
                {errors.razonSocial.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="+56 9 8765 4321"
                {...register('telefono')}
              />
              {errors.telefono && (
                <p className="text-xs text-destructive">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Av. Providencia 1234, Santiago"
                {...register('direccion')}
              />
              {errors.direccion && (
                <p className="text-xs text-destructive">
                  {errors.direccion.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nombreContacto">Nombre Contacto</Label>
              <Input
                id="nombreContacto"
                placeholder="Carlos Mendoza"
                {...register('nombreContacto')}
              />
              {errors.nombreContacto && (
                <p className="text-xs text-destructive">
                  {errors.nombreContacto.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emailContacto">Correo Contacto</Label>
              <Input
                id="emailContacto"
                type="email"
                placeholder="cmendoza@empresa.cl"
                {...register('emailContacto')}
              />
              {errors.emailContacto && (
                <p className="text-xs text-destructive">
                  {errors.emailContacto.message}
                </p>
              )}
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
              {isEditing ? 'Actualizar Cliente' : 'Registrar Empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

