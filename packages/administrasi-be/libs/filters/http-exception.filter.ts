import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

@Catch()
export class HttpExeptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message:
                exception instanceof HttpException
                    ? exception.getResponse()
                    : exception instanceof PrismaClientKnownRequestError ? this.prismaError(exception) : 'Internal server error',
        };

        response.status(status).json(errorResponse);
    }

    prismaError<T>(exeption: T) {
        if (exeption instanceof PrismaClientKnownRequestError) {
            switch (exeption.code) {
                case 'P2003':
                    const fieldName = exeption.meta?.field_name ?? 'unknown field';
                    return `Data masih digunakan di resource ${exeption.meta?.modelName} dengan column: ${fieldName}`
                default:
                    return exeption.message
            }
        }
    }
}
