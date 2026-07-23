import { z } from 'zod';

const phoneRegex = /^[1-9]{2}9?\d{8}$/;

export const confirmationSchema = z.object({
  clientName: z.string().trim().min(1, 'Informe o seu nome'),
  clientPhone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Use um celular válido no formato (99)999999999'),
});

export type ConfirmationFormData = z.infer<typeof confirmationSchema>;
