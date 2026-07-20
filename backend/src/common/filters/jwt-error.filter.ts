import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Catch(JsonWebTokenError, TokenExpiredError)
export class JwtErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = 401;
    const message = exception.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';

    return response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
