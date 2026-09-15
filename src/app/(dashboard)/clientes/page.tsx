'use client';

import React, { useEffect, useState } from 'react';
import { useClientsStore } from '@/stores/clients.store';
import { IClient, ICreateClient } from '@/interfaces/client.interface';
import { DataTable, IDataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ClientFormDialog } from '@/components/modules/clients/client-form-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Building, Mail, Phone } from 'lucide-react';
import { formatRut } from '@/lib/rut';

export default function ClientesPage() {
  const {
    clients,
    isLoading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  } = useClientsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<IClient | null>(null);
  const [clientToDelete, setClientToDelete] = useState<IClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleOpenCreate = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: IClient) => {
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: ICreateClient) => {
    if (clientToEdit) {
      return updateClient(clientToEdit.id, formData);
    }
    return createClient(formData);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    await deleteClient(clientToDelete.id);
    setIsDeleting(false);
    setClientToDelete(null);
  };

  const columns: IDataTableColumn<IClient>[] = [
    {
      key: 'rutEmpresa',
      label: 'RUT Empresa',
      render: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted whitespace-nowrap">
          {formatRut(item.rutEmpresa)}
        </span>
      ),
    },
    {
      key: 'razonSocial',
      label: 'Razón Social / Rubro',
      render: (item) => (
        <div>
          <p className="font-medium text-sm leading-tight">{item.razonSocial}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building className="h-3 w-3" />
            {item.rubro}
          </p>
        </div>
      ),
    },
    {
      key: 'contacto',
      label: 'Contacto Directo',
      render: (item) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{item.nombreContacto}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {item.emailContacto}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {item.telefono}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'direccion',
      label: 'Dirección',
      render: (item) => (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {item.direccion}
        </span>
      ),
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
            onClick={() => setClientToDelete(item)}
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
          <h2 className="text-2xl font-bold tracking-tight">
            Control de Clientes Empresa
          </h2>
          <p className="text-sm text-muted-foreground">
            Registro de empresas colaboradoras y personas de contacto comercial
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <DataTable<IClient>
        data={clients}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar por RUT, razón social, rubro o contacto..."
        searchFilter={(item, query) =>
          item.rutEmpresa.toLowerCase().includes(query) ||
          item.razonSocial.toLowerCase().includes(query) ||
          item.rubro.toLowerCase().includes(query) ||
          item.nombreContacto.toLowerCase().includes(query) ||
          item.emailContacto.toLowerCase().includes(query)
        }
      />

      <ClientFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        clientToEdit={clientToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(clientToDelete)}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente Empresa"
        description={`¿Está seguro de que desea eliminar la empresa "${clientToDelete?.razonSocial}" (RUT: ${clientToDelete?.rutEmpresa})? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

