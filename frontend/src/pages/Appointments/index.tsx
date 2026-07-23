import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CalendarRange, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import fundoAzul from '../../assets/fundo-azul.jpg';
import { ServiceStep } from './components/ServiceStep';
import { DateStep } from './components/DateStep';
import { TimeSlotGrid } from './components/TimeSlotGrid';
import { ConfirmationForm } from './components/ConfirmationForm';
import type { ConfirmationFormData } from './components/confirmation.schema';
import {
  confirmSchedulingAppointment,
  createSchedulingLock,
  getSchedulingAvailability,
} from '@services/scheduling';
import type { SchedulingAppointmentResponse } from '@app_types/scheduling';
import axios from 'axios';
import { getAppointmentServices } from '@services/appointment-services';

const flowMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const Appointments = () => {
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<SchedulingAppointmentResponse | null>(null);
  const servicesQuery = useQuery({
    queryKey: ['appointment-services'],
    queryFn: getAppointmentServices,
    staleTime: 1000 * 5 * 60,
  });

  const selectedService = useMemo(
    () => servicesQuery.data?.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, servicesQuery.data],
  );

  const selectedDateLabel = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '';
  const selectedDateIso = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const availabilityQuery = useQuery({
    queryKey: ['scheduling-availability', selectedServiceId, selectedDateIso],
    queryFn: () => getSchedulingAvailability(selectedServiceId ?? '', selectedDateIso),
    enabled: Boolean(selectedServiceId && selectedDate && !selectedTime && !confirmedAppointment),
    refetchInterval:
      selectedServiceId && selectedDate && !selectedTime && !confirmedAppointment ? 5000 : false,
    staleTime: 1000,
  });

  const lockMutation = useMutation({
    mutationFn: createSchedulingLock,
    onSuccess: async (_, variables) => {
      setSelectedTime(variables.time);
      await queryClient.invalidateQueries({
        queryKey: ['scheduling-availability', variables.serviceId, variables.date],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('Horário recém-reservado');
        if (selectedServiceId && selectedDateIso) {
          queryClient.invalidateQueries({
            queryKey: ['scheduling-availability', selectedServiceId, selectedDateIso],
          });
        }
        return;
      }

      toast.error('Não foi possível reservar esse horário');
    },
  });

  const appointmentMutation = useMutation({
    mutationFn: confirmSchedulingAppointment,
    onSuccess: (data) => {
      setConfirmedAppointment(data);
      toast.success('Agendamento confirmado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['scheduling-availability'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error('Seu lock expirou. Escolha o horário novamente.');
        setSelectedTime(null);
        setConfirmedAppointment(null);
        if (selectedServiceId && selectedDateIso) {
          queryClient.invalidateQueries({
            queryKey: ['scheduling-availability', selectedServiceId, selectedDateIso],
          });
        }
        return;
      }

      toast.error('Falha ao confirmar o agendamento');
    },
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmedAppointment(null);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setConfirmedAppointment(null);
  };

  const handleSlotSelect = async (time: string) => {
    if (!selectedServiceId || !selectedDateIso) {
      return;
    }

    await lockMutation.mutateAsync({
      serviceId: selectedServiceId,
      date: selectedDateIso,
      time,
    });
  };

  const handleFinalSubmit = async (formData: ConfirmationFormData) => {
    if (!selectedServiceId || !selectedDateIso || !selectedTime) {
      toast.error('Selecione serviço, data e horário antes de confirmar');
      return;
    }

    await appointmentMutation.mutateAsync({
      clientName: formData.clientName,
      clientPhone: `+55${formData.clientPhone}`,
      serviceId: selectedServiceId,
      date: selectedDateIso,
      time: selectedTime,
    });
  };

  const selectedSlots = availabilityQuery.data?.slots ?? [];

  const availabilityLoaded = Boolean(selectedServiceId && selectedDate);
  const canShowCalendar = Boolean(selectedService);
  const canShowAvailability = Boolean(selectedService && selectedDate && !selectedTime);
  const canShowConfirmation = Boolean(selectedService && selectedDate && selectedTime);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside
          className="relative overflow-hidden bg-slate-900 px-6 py-10 text-white sm:px-10 lg:px-12"
          style={{
            backgroundImage: `url(${fundoAzul})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-slate-950/75" />
          <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between gap-10">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Área do Cliente
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Seu agendamento em poucos passos, com reserva em tempo real.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
                  Escolha o serviço, visualize os horários livres, reserve a vaga temporariamente e
                  conclua a confirmação com seus dados.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: CalendarRange,
                  title: 'Calendário',
                  text: 'Seleção visual da data disponível.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Lock temporário',
                  text: 'Reserva protegida por 5 min.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Confirmação',
                  text: 'Finalização rápida com validação segura.',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <Icon className="h-5 w-5 text-blue-200" />
                    <h2 className="mt-3 text-sm font-semibold uppercase tracking-wide text-white">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-blue-100">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex items-start justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="w-full max-w-4xl space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                    Fluxo progressivo
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">Agende seu atendimento</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                    Os passos só aparecem após a conclusão da etapa anterior para manter a jornada
                    clara e sem ruído.
                  </p>
                </div>
              </div>
            </motion.div>

            <ServiceStep
              services={servicesQuery.data ?? []}
              selectedServiceId={selectedServiceId}
              onSelectService={handleServiceSelect}
            />

            <AnimatePresence mode="wait">
              {canShowCalendar && selectedService ? (
                <DateStep
                  key={`date-${selectedService.id}`}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  onChangeDate={handleDateChange}
                />
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {canShowAvailability && selectedService ? (
                <TimeSlotGrid
                  key={`slots-${selectedService.id}-${selectedDateIso}`}
                  slots={selectedSlots}
                  isLoading={availabilityQuery.isLoading}
                  isRefetching={availabilityQuery.isFetching && !availabilityQuery.isLoading}
                  isLocking={lockMutation.isPending}
                  selectedTime={selectedTime}
                  onSelectTime={handleSlotSelect}
                  onRetry={() => availabilityQuery.refetch()}
                  hasError={availabilityQuery.isError}
                />
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {canShowConfirmation && selectedService && selectedTime ? (
                confirmedAppointment ? (
                  <motion.section
                    key="success"
                    variants={flowMotion}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                          Sucesso
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-emerald-950">
                          Agendamento concluído
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                          {confirmedAppointment.clientName} confirmou {selectedService.name} em{' '}
                          {selectedDateLabel} às {confirmedAppointment.time}.
                        </p>
                      </div>
                    </div>
                  </motion.section>
                ) : (
                  <ConfirmationForm
                    key={`form-${selectedService.id}-${selectedDateIso}-${selectedTime}`}
                    selectedService={selectedService}
                    selectedDateLabel={selectedDateLabel}
                    selectedTime={selectedTime}
                    onSubmit={handleFinalSubmit}
                    isSubmitting={appointmentMutation.isPending}
                  />
                )
              ) : null}
            </AnimatePresence>

            {!availabilityLoaded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 shadow-sm"
              >
                Escolha um serviço para iniciar o fluxo.
              </motion.div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointments;
