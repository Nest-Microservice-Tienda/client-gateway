import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

interface RpcError {
  status: number;
  message: string;
}

@Catch(RpcException)
export class RpcCustomExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<never> {
    const response = host.switchToHttp().getResponse();
    const { status = 500, message = 'Internal server error' } = exception.getError() as RpcError;

    response.status(status).json({
      statusCode: status,
      message,
    });

    return throwError(() => exception);
  }
}