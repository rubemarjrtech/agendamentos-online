import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter,
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Conectado ao banco com sucesso!');
    } catch (err) {
      console.log(err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Banco desconectado...');
  }
}
