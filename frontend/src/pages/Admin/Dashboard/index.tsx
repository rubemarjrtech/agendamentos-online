import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilLine, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import axios from 'axios';
import { Button } from '@components/Button';
import {
  deleteAdminAppointment,
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from '@services/admin';
import type { AdminAppointment, AdminAppointmentStatus } from '@app_types/admin';

const statusLabels: Record<AdminAppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const statusStyles: Record<AdminAppointmentStatus, string> = {
  SCHEDULED: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-cyan-50 text-cyan-800',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-rose-50 text-rose-700',
};

const adminStatuses: AdminAppointmentStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy');
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [hasRequestedAppointments, setHasRequestedAppointments] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  const appointmentsQuery = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => getAdminAppointments(),
    enabled: hasRequestedAppointments,
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: AdminAppointmentStatus;
    }) => updateAdminAppointmentStatus(appointmentId, { status }),
    onSuccess: async () => {
      toast.success('Status atualizado com sucesso');
      setEditingAppointmentId(null);
      await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? 'Falha ao atualizar o status');
        return;
      }

      toast.error('Falha ao atualizar o status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminAppointment,
    onSuccess: async () => {
      toast.success('Agendamento excluído');
      await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? 'Falha ao excluir o agendamento');
        return;
      }

      toast.error('Falha ao excluir o agendamento');
    },
  });

  const appointments = useMemo(
    () => appointmentsQuery.data?.appointments ?? [],
    [appointmentsQuery.data],
  );

  const handleStatusChange = async (
    appointment: AdminAppointment,
    status: AdminAppointmentStatus,
  ) => {
    if (status === appointment.status) {
      setEditingAppointmentId(null);
      return;
    }

    await updateStatusMutation.mutateAsync({ appointmentId: appointment.id, status });
  };

  const handleDelete = async (appointment: AdminAppointment) => {
    const confirmed = window.confirm(`Excluir o agendamento de ${appointment.clientName}?`);

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync(appointment.id);
  };

  const handleLoadAppointments = async () => {
    setHasRequestedAppointments(true);
    await appointmentsQuery.refetch();
  };

  const renderIdleState = !hasRequestedAppointments && !appointmentsQuery.isSuccess;
  const isLoadingAppointments = hasRequestedAppointments && appointmentsQuery.isFetching;
  const shouldShowTable = hasRequestedAppointments && appointmentsQuery.isSuccess;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800">
              Dashboard Administrativo
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Agendamentos</h1>
          </div>
          <p className="text-xl text-slate-500">
            Total: {appointmentsQuery.data?.total ?? appointments.length}
          </p>
        </div>

        {renderIdleState ? (
          <div className="flex min-h-[42vh] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 shadow-sm">
            <Button type="button" onClick={() => void handleLoadAppointments()} size="lg">
              Visualizar agendamentos
            </Button>
          </div>
        ) : isLoadingAppointments ? (
          <div className="flex min-h-[42vh] items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 py-10 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-700" />
              <p className="text-sm font-medium text-slate-600">Carregando agendamentos...</p>
            </div>
          </div>
        ) : appointmentsQuery.isError ? (
          <div className="flex min-h-[42vh] items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 py-10 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-medium text-slate-600">
                Não foi possível carregar os agendamentos.
              </p>
              <Button type="button" onClick={() => void appointmentsQuery.refetch()}>
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : shouldShowTable ? (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-white">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Nome do Cliente
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Serviço
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Data
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Horário
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {appointments.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-xl text-slate-500" colSpan={6}>
                        Nenhum agendamento encontrado.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => {
                      const isEditing = editingAppointmentId === appointment.id;

                      return (
                        <tr key={appointment.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 text-sm font-medium text-slate-900">
                            {appointment.clientName}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {appointment.serviceName}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(appointment.date)}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{appointment.time}</td>
                          <td className="px-5 py-4 text-sm">
                            {isEditing ? (
                              <div className="relative inline-block">
                                <select
                                  autoFocus
                                  value={appointment.status}
                                  disabled={updateStatusMutation.isPending}
                                  onChange={(event) => {
                                    void handleStatusChange(
                                      appointment,
                                      event.target.value as AdminAppointmentStatus,
                                    );
                                  }}
                                  onBlur={() => setEditingAppointmentId(null)}
                                  className="appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-slate-700 outline-none transition focus:ring-1 focus:ring-cyan-800"
                                >
                                  {adminStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {statusLabels[status]}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                              </div>
                            ) : (
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[appointment.status]}`}
                              >
                                {statusLabels[appointment.status]}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingAppointmentId(appointment.id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                aria-label={`Editar status de ${appointment.clientName}`}
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(appointment)}
                                disabled={deleteMutation.isPending}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label={`Excluir agendamento de ${appointment.clientName}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
