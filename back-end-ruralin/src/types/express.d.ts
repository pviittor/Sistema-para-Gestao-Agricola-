import 'express';
import { RequestContext } from '../core/context/RequestContext';

declare module 'express' {
  export interface Request {
    userId?: number;
    tenantId?: number;
    context?: RequestContext;
  }
}
