import { motion } from 'framer-motion';
import { ChevronRight, Scissors, Sparkles, UserRound } from 'lucide-react';
import { Button } from '@components/Button';
import type { FindServicesResponse } from '@app_types/appointment-services';

interface ServiceStepProps {
  services: FindServicesResponse[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

const iconMap: Record<string, typeof Scissors> = {
  'service-cut': Scissors,
  'service-beard': UserRound,
  'service-combo': Sparkles,
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const ServiceStep = ({ services, selectedServiceId, onSelectService }: ServiceStepProps) => {
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Passo 1</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Selecione um serviço</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Escolha a experiência desejada para liberar o calendário e seguir com a reserva.
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          const ServiceIcon = iconMap[service.id] ?? Scissors;

          return (
            <Button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service.id)}
              variant="secondary"
              className={`group h-full items-stretch justify-start rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/60'
              }`}
            >
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-gray-100 p-3 text-gray-700 transition-colors group-hover:bg-white group-hover:text-blue-600">
                    <ServiceIcon className="h-5 w-5" />
                  </div>
                  <ChevronRight
                    className={`mt-1 h-4 w-4 transition-colors ${
                      isSelected ? 'text-blue-600' : 'text-gray-300'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Duração</p>
                    <p className="text-sm font-medium text-gray-900">{service.duration}</p>
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="mt-2 text-sm leading-6 text-gray-600">Selecione um serviço para continuar</p>
      </div>
    </motion.section>
  );
};
