import * as express from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { I18nContext } from 'nestjs-i18n';

export interface Response<T> {
  data: T;
}

export interface responseValue {
  data: any;
  code: any;
  message?: string;
}

@Injectable()
export class I18nInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<express.Response>();
    const i18n = I18nContext.current(context) || I18nContext.current();

    return next.handle().pipe(
      map((data) => {
        if (data) {
          const returnValue: responseValue = {
            data: data.message ? data.data : data,
            code: response.statusCode,
            message: data.message,
          };

          if (data.message) {
            try {
              if (i18n && i18n.lang && typeof i18n.t === 'function') {
                const translated = i18n.t(`${i18n.lang}.${data.message}`);
                if (typeof translated === 'string') {
                  returnValue.message = translated.replace(/^(en\.|bn\.)/, '');
                }
              }
            } catch {
              returnValue.message = data.message;
            }
          }
          return returnValue;
        } else {
          return {
            data: null,
          };
        }
      }),
    );
  }
}
