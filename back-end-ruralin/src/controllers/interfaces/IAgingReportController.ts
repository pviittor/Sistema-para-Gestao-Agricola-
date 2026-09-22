import { Request, Response } from 'express';

export interface IAgingReportController {
  gerarAging(req: Request, res: Response): Promise<void>;
}
