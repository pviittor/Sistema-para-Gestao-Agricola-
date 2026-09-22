export interface IAlertaVencimentoConfigApplicationService {
  create(dto: any): Promise<any>;
  update(id: number | string, dto: any): Promise<any>;
  delete(id: number | string): Promise<boolean>;
  findByUsuario(): Promise<any[]>;
  processarAlertasVencimento(dataBase?: Date): Promise<{ lembretes_criados: number; parcelas_processadas: number }>;
}
