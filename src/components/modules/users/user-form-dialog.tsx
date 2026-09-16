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
import { IUser } from '@/interfaces/user.interface';
import { validateRut, formatRut } from '@/lib/rut';
import { Loader2 } from 'lucide-react';

const userSchema = z.object({
  rut: z
    .string()
    .min(1, 'El RUT es obligatorio')
    .refine(validateRut, { message: 'RUT inválido (revise el dígito verificador)' }),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Correo electrónico inválido')
    .refine((val) => val.endsWith('@ventasfix.cl'), {
      message: 'El correo debe terminar en @ventasfix.cl',
    }),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'La contraseña debe tener al menos 6 caracteres',
    }),
  role: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<boolean>;
  userToEdit?: IUser | null;
}

export function UserFormDialog({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
}: UserFormDialogProps) {
  const isEditing = Boolean(userToEdit);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      rut: '',
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      role: 'VIEWER',
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        rut: formatRut(userToEdit.rut),
        nombre: userToEdit.nombre,
        apellido: userToEdit.apellido,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role || 'ADMIN',
      });
    } else {
      reset({
        rut: '',
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        role: 'VIEWER',
      });
    }
  }, [userToEdit, reset, isOpen]);

  const handleRutBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setValue('rut', formatted, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: UserFormData) => {
    // Si estamos creando y la clave está vacía, no permitir
    if (!isEditing && (!data.password || data.password.trim() === '')) {
      return;
    }
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Usuario Administrador' : 'Nuevo Usuario Administrador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="Juan" {...register('nombre')} />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" placeholder="Pérez" {...register('apellido')} />
              {errors.apellido && (
                <p className="text-xs text-destructive">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rut">RUT Chileno</Label>
            <Input
              id="rut"
              placeholder="12.345.678-5"
              {...register('rut')}
              onBlur={handleRutBlur}
            />
            {errors.rut && (
              <p className="text-xs text-destructive">{errors.rut.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo Institucional (@ventasfix.cl)</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ventasfix.cl"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Contraseña {isEditing && '(Opcional si no desea cambiarla)'}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-1.5">
              <Label htmlFor="role">Rol del Usuario</Label>
              <select
                id="role"
                {...register('role')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ADMIN">Administrador (Control Total)</option>
                <option value="VIEWER">Visualizador (Solo Lectura)</option>
              </select>
            </div>
          ) : (
            <div className="p-3 bg-muted/60 rounded-md text-xs text-muted-foreground flex items-center justify-between border">
              <span>Rol inicial por defecto:</span>
              <span className="font-semibold text-foreground">Visualizador (Solo Lectura)</span>
            </div>
          )}

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
              {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

