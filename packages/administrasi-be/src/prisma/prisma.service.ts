import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const configService = new ConfigService()
        const isDevelopment = configService.get('IS_DEVELOPMENT') || true;
        super({
            log: isDevelopment == "true" ? ['query', 'info', 'warn', 'error'] : null, // Mengaktifkan logging jika IS_DEVELOPER adalah true
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
}