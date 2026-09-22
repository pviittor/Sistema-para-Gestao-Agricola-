import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Maquina from '../../models/Maquina';
import { CreateMaquinaDto } from '../dto/maquina/CreateMaquinaDto';
import { UpdateMaquinaDto } from '../dto/maquina/UpdateMaquinaDto';
import { MaquinaResponseDto } from '../dto/maquina/MaquinaResponseDto';

/**
 * Mapper para entidade Maquina
 */
@Injectable()
export class MaquinaMapper implements IMapper<Maquina, MaquinaResponseDto, CreateMaquinaDto, UpdateMaquinaDto> {
  async toEntity(dto: CreateMaquinaDto | UpdateMaquinaDto): Promise<Partial<Maquina>> {
    const entity: any = {};

    // Identificacao
    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('chassi' in dto && dto.chassi !== undefined) {
      entity.chassi = dto.chassi;
    }
    if ('placa' in dto && dto.placa !== undefined) {
      entity.placa = dto.placa;
    }
    if ('ano' in dto && dto.ano !== undefined) {
      entity.ano = dto.ano;
    }
    if ('modelo' in dto && dto.modelo !== undefined) {
      entity.modelo = dto.modelo;
    }
    if ('serie' in dto && dto.serie !== undefined) {
      entity.serie = dto.serie;
    }
    if ('marca' in dto && dto.marca !== undefined) {
      entity.marca = dto.marca;
    }

    // Classificacao
    if ('idGrupoEquipamento' in dto && dto.idGrupoEquipamento !== undefined) {
      entity.idGrupoEquipamento = dto.idGrupoEquipamento;
    }
    if ('tipoMarcador' in dto && dto.tipoMarcador !== undefined) {
      entity.tipoMarcador = dto.tipoMarcador;
    }
    if ('combustivel' in dto && dto.combustivel !== undefined) {
      entity.combustivel = dto.combustivel;
    }
    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }

    // Aquisicao
    if ('dataAquisicao' in dto && dto.dataAquisicao !== undefined) {
      entity.dataAquisicao = dto.dataAquisicao as string;
    }
    if ('valorAquisicao' in dto && dto.valorAquisicao !== undefined) {
      entity.valorAquisicao = dto.valorAquisicao;
    }
    if ('valorAtual' in dto && dto.valorAtual !== undefined) {
      entity.valorAtual = dto.valorAtual;
    }
    if ('idFornecedor' in dto && dto.idFornecedor !== undefined) {
      entity.idFornecedor = dto.idFornecedor;
    }
    if ('notaFiscal' in dto && dto.notaFiscal !== undefined) {
      entity.notaFiscal = dto.notaFiscal;
    }
    if ('serieNotaFiscal' in dto && dto.serieNotaFiscal !== undefined) {
      entity.serieNotaFiscal = dto.serieNotaFiscal;
    }
    if ('dataNotaFiscal' in dto && dto.dataNotaFiscal !== undefined) {
      entity.dataNotaFiscal = dto.dataNotaFiscal as string;
    }

    // Depreciacao
    if ('vidaUtil' in dto && dto.vidaUtil !== undefined) {
      entity.vidaUtil = dto.vidaUtil;
    }
    if ('percsucata' in dto && dto.percsucata !== undefined) {
      entity.percsucata = dto.percsucata;
    }
    if ('depreciacaoAnual' in dto && dto.depreciacaoAnual !== undefined) {
      entity.depreciacaoAnual = dto.depreciacaoAnual;
    }
    if ('horaUtilAno' in dto && dto.horaUtilAno !== undefined) {
      entity.horaUtilAno = dto.horaUtilAno;
    }

    // Horimetros
    if ('horimetroInicial' in dto && dto.horimetroInicial !== undefined) {
      entity.horimetroInicial = dto.horimetroInicial;
    }
    if ('ultimoHorimetro' in dto && dto.ultimoHorimetro !== undefined) {
      entity.ultimoHorimetro = dto.ultimoHorimetro;
    }
    if ('horimetroAbastecimento' in dto && dto.horimetroAbastecimento !== undefined) {
      entity.horimetroAbastecimento = dto.horimetroAbastecimento;
    }
    if ('horimetroManutencao' in dto && dto.horimetroManutencao !== undefined) {
      entity.horimetroManutencao = dto.horimetroManutencao;
    }
    if ('horimetroApontamento' in dto && dto.horimetroApontamento !== undefined) {
      entity.horimetroApontamento = dto.horimetroApontamento;
    }

    // Custo
    if ('custoFixo' in dto && dto.custoFixo !== undefined) {
      entity.custoFixo = dto.custoFixo;
    }
    if ('valorCustoFixo' in dto && dto.valorCustoFixo !== undefined) {
      entity.valorCustoFixo = dto.valorCustoFixo;
    }
    if ('valorConsumoFixo' in dto && dto.valorConsumoFixo !== undefined) {
      entity.valorConsumoFixo = dto.valorConsumoFixo;
    }
    if ('custoDepreciacao' in dto && dto.custoDepreciacao !== undefined) {
      entity.custoDepreciacao = dto.custoDepreciacao;
    }
    if ('valorHoraDepreciacao' in dto && dto.valorHoraDepreciacao !== undefined) {
      entity.valorHoraDepreciacao = dto.valorHoraDepreciacao;
    }
    if ('custoManutencao' in dto && dto.custoManutencao !== undefined) {
      entity.custoManutencao = dto.custoManutencao;
    }
    if ('custoCombustivel' in dto && dto.custoCombustivel !== undefined) {
      entity.custoCombustivel = dto.custoCombustivel;
    }
    if ('valorHora' in dto && dto.valorHora !== undefined) {
      entity.valorHora = dto.valorHora;
    }

    // Combustivel
    if ('consumoEstimadoCombustivel' in dto && dto.consumoEstimadoCombustivel !== undefined) {
      entity.consumoEstimadoCombustivel = dto.consumoEstimadoCombustivel;
    }
    if ('idCombustivelMaquina' in dto && dto.idCombustivelMaquina !== undefined) {
      entity.idCombustivelMaquina = dto.idCombustivelMaquina;
    }

    // Fazenda/Operacao
    if ('idFazenda' in dto && dto.idFazenda !== undefined) {
      entity.idFazenda = dto.idFazenda;
    }
    if ('idMotorista' in dto && dto.idMotorista !== undefined) {
      entity.idMotorista = dto.idMotorista;
    }
    if ('consumoHA' in dto && dto.consumoHA !== undefined) {
      entity.consumoHA = dto.consumoHA;
    }
    if ('custoHA' in dto && dto.custoHA !== undefined) {
      entity.custoHA = dto.custoHA;
    }

    // Pesagem
    if ('tara' in dto && dto.tara !== undefined) {
      entity.tara = dto.tara;
    }
    if ('utilizarTaraPesagem' in dto && dto.utilizarTaraPesagem !== undefined) {
      entity.utilizarTaraPesagem = dto.utilizarTaraPesagem;
    }

    // Seguro
    if ('idSeguradora' in dto && dto.idSeguradora !== undefined) {
      entity.idSeguradora = dto.idSeguradora;
    }
    if ('inicioSeguro' in dto && dto.inicioSeguro !== undefined) {
      entity.inicioSeguro = dto.inicioSeguro as string;
    }
    if ('fimSeguro' in dto && dto.fimSeguro !== undefined) {
      entity.fimSeguro = dto.fimSeguro as string;
    }
    if ('aplice' in dto && dto.aplice !== undefined) {
      entity.aplice = dto.aplice;
    }

    return entity;
  }

  toDto(entity: Maquina): MaquinaResponseDto {
    const formatDate = (date: Date | string | null | undefined): string | null => {
      if (!date) return null;
      if (typeof date === 'string') {
        try {
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        } catch (e) {
          return date.split('T')[0];
        }
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return null;
    };

    const dto: MaquinaResponseDto = {
      // Identificacao
      id_mqn: entity.id_mqn,
      tenantId: entity.tenantId,
      descricao: entity.descricao,
      chassi: entity.chassi,
      placa: entity.placa,
      ano: entity.ano,
      modelo: entity.modelo,
      serie: entity.serie,
      marca: entity.marca,

      // Classificacao
      idGrupoEquipamento: entity.idGrupoEquipamento,
      tipoMarcador: entity.tipoMarcador,
      combustivel: entity.combustivel,
      tipo: entity.tipo,

      // Aquisicao
      dataAquisicao: formatDate((entity as any).dataAquisicao),
      valorAquisicao: entity.valorAquisicao != null ? Number(entity.valorAquisicao) : null,
      valorAtual: entity.valorAtual != null ? Number(entity.valorAtual) : null,
      idFornecedor: entity.idFornecedor,
      notaFiscal: entity.notaFiscal,
      serieNotaFiscal: entity.serieNotaFiscal,
      dataNotaFiscal: formatDate((entity as any).dataNotaFiscal),

      // Depreciacao
      vidaUtil: entity.vidaUtil != null ? Number(entity.vidaUtil) : null,
      percsucata: entity.percsucata != null ? Number(entity.percsucata) : null,
      depreciacaoAnual: entity.depreciacaoAnual != null ? Number(entity.depreciacaoAnual) : null,
      horaUtilAno: entity.horaUtilAno != null ? Number(entity.horaUtilAno) : null,

      // Horimetros
      horimetroInicial: entity.horimetroInicial != null ? Number(entity.horimetroInicial) : null,
      ultimoHorimetro: entity.ultimoHorimetro != null ? Number(entity.ultimoHorimetro) : null,
      horimetroAbastecimento: entity.horimetroAbastecimento != null ? Number(entity.horimetroAbastecimento) : null,
      horimetroManutencao: entity.horimetroManutencao != null ? Number(entity.horimetroManutencao) : null,
      horimetroApontamento: entity.horimetroApontamento != null ? Number(entity.horimetroApontamento) : null,

      // Custo
      custoFixo: entity.custoFixo,
      valorCustoFixo: entity.valorCustoFixo != null ? Number(entity.valorCustoFixo) : null,
      valorConsumoFixo: entity.valorConsumoFixo != null ? Number(entity.valorConsumoFixo) : null,
      custoDepreciacao: entity.custoDepreciacao,
      valorHoraDepreciacao: entity.valorHoraDepreciacao != null ? Number(entity.valorHoraDepreciacao) : null,
      custoManutencao: entity.custoManutencao,
      custoCombustivel: entity.custoCombustivel,
      valorHora: entity.valorHora != null ? Number(entity.valorHora) : null,

      // Combustivel
      consumoEstimadoCombustivel: entity.consumoEstimadoCombustivel != null ? Number(entity.consumoEstimadoCombustivel) : null,
      idCombustivelMaquina: entity.idCombustivelMaquina,

      // Fazenda/Operacao
      idFazenda: entity.idFazenda,
      idMotorista: entity.idMotorista,
      consumoHA: entity.consumoHA != null ? Number(entity.consumoHA) : null,
      custoHA: entity.custoHA != null ? Number(entity.custoHA) : null,

      // Pesagem
      tara: entity.tara != null ? Number(entity.tara) : null,
      utilizarTaraPesagem: entity.utilizarTaraPesagem,

      // Seguro
      idSeguradora: entity.idSeguradora,
      inicioSeguro: formatDate((entity as any).inicioSeguro),
      fimSeguro: formatDate((entity as any).fimSeguro),
      aplice: entity.aplice,

      // Auditoria
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).grupoEquipamento) {
      dto.grupoEquipamento = {
        id_grpequip: (entity as any).grupoEquipamento.id_grpequip,
        descricao: (entity as any).grupoEquipamento.descricao_grpequip,
      };
    }

    if ((entity as any).fornecedor) {
      dto.fornecedor = {
        id_pessoa: (entity as any).fornecedor.id_pessoa,
        nomerazao_pessoa: (entity as any).fornecedor.nomerazao_pessoa,
        cpfcnpj_pessoa: (entity as any).fornecedor.cpfcnpj_pessoa,
      };
    }

    if ((entity as any).motorista) {
      dto.motorista = {
        id_pessoa: (entity as any).motorista.id_pessoa,
        nomerazao_pessoa: (entity as any).motorista.nomerazao_pessoa,
        cpfcnpj_pessoa: (entity as any).motorista.cpfcnpj_pessoa,
      };
    }

    if ((entity as any).seguradora) {
      dto.seguradora = {
        id_pessoa: (entity as any).seguradora.id_pessoa,
        nomerazao_pessoa: (entity as any).seguradora.nomerazao_pessoa,
        cpfcnpj_pessoa: (entity as any).seguradora.cpfcnpj_pessoa,
      };
    }

    if ((entity as any).combustivelMaquina) {
      dto.combustivelProduto = {
        id_prod: (entity as any).combustivelMaquina.id_prod,
        descricao_prod: (entity as any).combustivelMaquina.descricao_prod,
      };
    }

    if ((entity as any).fazenda) {
      dto.fazenda = {
        id: (entity as any).fazenda.id,
        descricao: (entity as any).fazenda.descricao,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    return dto;
  }
}
