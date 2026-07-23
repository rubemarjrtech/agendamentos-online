import { motion } from 'framer-motion';
import { CheckCircle2, Phone, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/Button';
import { confirmationSchema, type ConfirmationFormData } from './confirmation.schema';
import type { FindServicesResponse } from '@app_types/appointment-services';

interface ConfirmationFormProps {
  selectedService: FindServicesResponse;
  selectedDateLabel: string;
  selectedTime: string;
  onSubmit: (data: ConfirmationFormData) => Promise<void>;
  isSubmitting: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const ConfirmationForm = ({
  selectedService,
  selectedDateLabel,
  selectedTime,
  onSubmit,
  isSubmitting,
}: ConfirmationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmationFormData>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      clientName: '',
      clientPhone: '',
    },
  });

  return (
    <motion.section
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Passo 4</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Confirmação final</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Confirme seus dados para concluir o agendamento com segurança.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Serviço</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{selectedService.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Data</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{selectedDateLabel}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Horário</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{selectedTime}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="mb-1 block text-sm font-medium text-gray-700">
            Nome
          </label>
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
              errors.clientName ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <UserRound className="h-4 w-4 text-gray-400" />
            <input
              id="clientName"
              type="text"
              placeholder="Seu nome completo"
              {...register('clientName')}
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>
          {errors.clientName && (
            <p className="mt-1 text-sm text-red-500">{errors.clientName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="clientPhone" className="mb-1 block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
              errors.clientPhone ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <Phone className="h-4 w-4 text-gray-400" />
            <input
              id="clientPhone"
              type="tel"
              placeholder="(99)999999999"
              {...register('clientPhone')}
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>
          {errors.clientPhone && (
            <p className="mt-1 text-sm text-red-500">{errors.clientPhone.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
        </Button>
      </form>
    </motion.section>
  );
};
