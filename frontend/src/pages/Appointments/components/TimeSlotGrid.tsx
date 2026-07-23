import { motion } from 'framer-motion';
import { AlertCircle, Clock3, LoaderCircle } from 'lucide-react';
import { Button } from '@components/Button';
import type { SchedulingTimeSlot } from '@app_types/scheduling';

interface TimeSlotGridProps {
  slots: SchedulingTimeSlot[];
  isLoading: boolean;
  isRefetching: boolean;
  isLocking: boolean;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  onRetry: () => void;
  hasError: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const statusLabel: Record<SchedulingTimeSlot['status'], string> = {
  AVAILABLE: 'Disponível',
  LOCKED: 'Reservado',
  OCCUPIED: 'Ocupado',
};

export const TimeSlotGrid = ({
  slots,
  isLoading,
  isRefetching,
  isLocking,
  selectedTime,
  onSelectTime,
  onRetry,
  hasError,
}: TimeSlotGridProps) => {
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Passo 3</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Selecione um horário</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Horários ocupados ou reservados ficam desabilitados automaticamente.
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <Clock3 className="h-5 w-5" />
        </div>
      </div>

      {hasError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Não foi possível carregar os horários
          </div>
          <p className="mt-2 text-sm text-red-700/90">
            Tente novamente para atualizar a grade de disponibilidade.
          </p>
          <div className="mt-4">
            <Button variant="danger" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              {isRefetching
                ? 'Atualizando horários...'
                : 'Atualização automática a cada 5 segundos'}
            </p>
            {isLocking ? <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" /> : null}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
                  />
                ))
              : slots.map((slot) => {
                  const isDisabled = slot.status !== 'AVAILABLE';
                  const isSelected = selectedTime === slot.time;

                  return (
                    <Button
                      key={slot.time}
                      type="button"
                      disabled={isDisabled || isLocking}
                      onClick={() => onSelectTime(slot.time)}
                      variant={isSelected ? 'primary' : 'secondary'}
                      className={`h-14 items-start justify-center rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-600 shadow-sm'
                          : isDisabled
                            ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-70'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-blue-300 hover:bg-blue-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        <span className="text-base font-semibold">{slot.time}</span>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-wide opacity-80">
                        {isDisabled ? statusLabel[slot.status] : 'Reservar'}
                      </p>
                    </Button>
                  );
                })}
          </div>
        </>
      )}
    </motion.section>
  );
};
