export interface IReciboPdfService {
  gerarPdf(id: number): Promise<Buffer>;
  exportarLote(ids: number[]): Promise<Buffer>;
}
