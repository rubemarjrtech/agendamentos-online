import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

async function main() {
  const services = [
    { name: 'Corte Clássico', duration: 30, active: true },
    { name: 'Barba Terapia', duration: 30, active: true },
    { name: 'Corte + Barba', duration: 30, active: true },
    { name: 'Design de Sobrancelhas', duration: 30, active: true },
    { name: 'Limpeza de Pele', duration: 30, active: true },
    { name: 'Massagem Relaxante', duration: 30, active: false },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  console.log('Seed de serviços concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
