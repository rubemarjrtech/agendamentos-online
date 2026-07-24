import { z } from 'zod';

export const adminAuthSchema = z.object({
  credential: z.string().trim().min(1, 'Digite sua credencial'),
  password: z.string().trim().min(1, 'Digite sua senha'),
});

export type AdminAuthSchemaFormData = z.infer<typeof adminAuthSchema>;
