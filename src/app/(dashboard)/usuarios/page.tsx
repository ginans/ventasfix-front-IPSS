'use client';

import React, { useEffect, useState } from 'react';
import { useUsersStore } from '@/stores/users.store';
import { usePermissions } from '@/hooks/use-permissions';
import { IUser, ICreateUser } from '@/interfaces/user.interface';
import { DataTable, IDataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { UserFormDialog } from '@/components/modules/users/user-form-dialog';
import { Button } from '@/components/ui/button';
import { AppBadge } from '@/components/shared/app-badge';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { formatRut } from '@/lib/rut';

export default function UsuariosPage() {
  const { isViewer, canWrite } = usePermissions();

  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } =
    useUsersStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: IUser) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: {
    rut: string;
    nombre: string;
    apellido: string;
    email: string;
    password?: string;
  }) => {
    if (userToEdit) {
      return updateUser(userToEdit.id, formData);
    }
    return createUser(formData as ICreateUser);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    await deleteUser(userToDelete.id);
    setIsDeleting(false);
    setUserToDelete(null);
  };

  const columns: IDataTableColumn<IUser>[] = [
    {
      key: 'rut',
      label: 'RUT',
      render: (item) => (
        <span className="font-mono text-xs whitespace-nowrap">{formatRut(item.rut)}</span>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre Completo',
      render: (item) => (
        <span className="font-medium">
          {item.nombre} {item.apellido}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Correo Electrónico',
      render: (item) => (
        <span className="text-muted-foreground">{item.email}</span>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      render: (item) => (
        <AppBadge
          category="user"
          status={item.role || 'ADMIN'}
        />
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (item) =>
        isViewer ? (
          <span className="text-xs text-muted-foreground italic flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            Solo lectura
          </span>
        ) : (
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
              onClick={() => setUserToDelete(item)}
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
          <h2 className="text-2xl font-bold tracking-tight">Control de Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Gestión y mantenedor de administradores con credenciales corporativas
          </p>
        </div>
        {canWrite && (
          <Button onClick={handleOpenCreate} className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      <DataTable<IUser>
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar por nombre, rut o correo..."
        searchFilter={(item, query) =>
          item.nombre.toLowerCase().includes(query) ||
          item.apellido.toLowerCase().includes(query) ||
          item.rut.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query)
        }
      />

      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        userToEdit={userToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        description={`¿Está seguro de que desea eliminar al administrador ${userToDelete?.nombre} ${userToDelete?.apellido}? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

