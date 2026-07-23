import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { CalendarDays, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import type { FindServicesResponse } from '@app_types/appointment-services';

interface DateStepProps {
  selectedService: FindServicesResponse;
  selectedDate: Date | null;
  onChangeDate: (date: Date | null) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const DateStep = ({ selectedService, selectedDate, onChangeDate }: DateStepProps) => {
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Passo 2</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Escolha uma data</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            O calendário fica ativo somente após a escolha do serviço.
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <CalendarDays className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <DatePicker
            inline
            selected={selectedDate}
            onChange={onChangeDate}
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
            calendarClassName="scheduling-calendar"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Resumo</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">{selectedService.name}</p>

          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
            <Clock3 className="h-4 w-4 text-blue-600" />
            <span>
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Escolha um dia disponível'}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
