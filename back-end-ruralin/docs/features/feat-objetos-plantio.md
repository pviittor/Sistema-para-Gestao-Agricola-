#Feature : Objetos de Safra
##Implementações
**🎯 Objetivo**: Implementação dos objetos utilizados para o controle de safra e custos do sistema

##Premissas
###Apontamento de Produto
Ao gerar um apontamento de produto, deve ser criada um movimento de estoque do tipo disponivel,  relacionado ao apontamento, registrando a quantidade, valor.

###Apontamento de Maquina
ao gerar um apontamento de maquina, deve ser atualizado o horimetro atual da maquina, no cadastro da tabela de maquinas. incrementando a quantidade de horas utilizadas (horafim - horainicio), atualizando o horimetro no cadastro.




##Modelo de dados
###Talhao
Possui tenant
possui auditoria
    public class Talhao
    {
        [Key]
        public int id { get; set; }
        public string descricao { get; set; }
        public int idFazenda { get; set; }
        [ForeignKey("idFazenda")]
        public virtual Fazenda fazenda { get; set; } //referencia da tabela de fazenda
        public decimal area { get; set; }
    }

###Configurador de Safra
Possui tenant
possui auditoria
public class ConfiguradorCiclo
    {
        [Key]
        public int id { get; set; }

        public int idTalhao { get; set; }
        [ForeignKey("idTalhao")]
        public virtual Cadastro.Talhao talhao { get; set; } //referencia tabela talhao

        public int idCiclo { get; set; }
        [ForeignKey("idCiclo")]
        public virtual Cadastro.Ciclo ciclo { get; set; } //referencia tabela safra

        public int idCultura { get; set; }
        [ForeignKey("idCultura")]
        public virtual Cadastro.Cultura cultura { get; set; } //referencia tabela cultura

        public int? IdVariedadeCiclo { get; set; }
        [ForeignKey("IdVariedadeCiclo")]
        public virtual Cadastro.Produto variedadeciclo { get; set; } //referencia tabela de produto

        [Column(TypeName = "datetime2")]
        public DateTime? inicioplantio { get; set; }
        [Column(TypeName = "datetime2")]
        public DateTime? fimplantio { get; set; }
        [Column(TypeName = "datetime2")]
        public DateTime? previsaocolheita { get; set; }
        [Column(TypeName = "datetime2")]
        public DateTime? iniciocolheita { get; set; }
        [Column(TypeName = "datetime2")]
        public DateTime? fimcolheita { get; set; }

        public string observacao { get; set; }

        /// <summary>
        /// Area plantada, utilizado para produtividade do talhão
        /// </summary>
        public decimal? areaplantada { get; set; }
        public decimal? estimativaproducao { get; set; }


    }

###Atividade Agricola
Possui Tenant
possui auditoria
public class AtividadeAgricola
    {
        [Key]
        public int id { get; set; }
        public string descricao { get; set; }

        /// <summary>
        /// 0 - Atividade de produção
        /// 1 - Manutencao de Maquinas
        /// 2 - Atividades Administrativas
        /// </summary>
        public int tipo { get; set; }


        public virtual List<AtividadeOperacao> operacoesAtividade { get; set; }
    }

    ###Operações da Atividade
    possui tenant
    possui auditoria
        public class AtividadeOperacao
    {
        [Key]
        public int id { get; set; }

        public string descricao { get; set; }

        public int idAtividade { get; set; }
        [ForeignKey("idAtividade")]
        public virtual AtividadeAgricola atividade { get; set; } //referencia tabela atividade agricola

        public bool financeiro { get; set; } //caso marcado, ira gerar um registro financeiro, contas a pagar

    }

    ###Apontamento
    possui tenant
    possui auditoria
        public class Apontamento
    {
        [Key]
        public int id { get; set; }


        public int idConfiguracao { get; set; }
        [ForeignKey("idConfiguracao")]
        public virtual Plantio.ConfiguradorCiclo configuracao { get; set; }

        public int idAtividade { get; set; }
        [ForeignKey("idAtividade")]
        public virtual AtividadeAgricola atividade_aptativ { get; set; }

        public int idOperacao { get; set; }
        [ForeignKey("idOperacao")]
        public virtual AtividadeOperacao operacao_aptativ { get; set; }

        public DateTime? datainicio_aptativ { get; set; } //apontamentoe em data futura, serao considerados como planejados

    }

    ###Apontamento Maquina
    possui tenant
    possui auditoria
    public class ApontamentoMaquinas
    {
        [Key]
        public int id { get; set; }

        public int idApontamento { get; set; }
        [ForeignKey("idApontamento")]
        public virtual Apontamento apontamento { get; set; }

        public int idMaquina { get; set; }
        [ForeignKey("idMaquina")]
        public virtual Cadastro.Maquina maquina { get; set; }

        public int? idImplemento { get; set; }
        [ForeignKey("idImplemento")]
        public virtual Cadastro.Maquina implemento { get; set; } //implemento vinculado a maquina, no caso outra maquina cadastrada

        public int? idOperador { get; set; }
        [ForeignKey("idOperador")]
        public virtual Cadastro.Pessoa operador { get; set; } //referencia tabela de pessoa, onde operador = true

        /// <summary>
        /// INFORMAÇÕES DO ABASTECIMENTO
        /// </summary>
        public int? idAbastecimento { get; set; }
        [ForeignKey("idAbastecimento")]
        public virtual Estoque.Abastecimento abastecimento { get; set; }


        public DateTime data { get; set; }

        public decimal horainicio { get; set; }
        public decimal horafim { get; set; }
        public decimal horatotal { get; set; }
        public decimal valorhora { get; set; }
        public decimal valorhoraimpl { get; set; }
        public decimal vazao { get; set; }
        public decimal habomba { get; set; }
        public decimal velocidade { get; set; }
        public decimal pulv { get; set; }

        

        /// <summary>
        /// CONSUMO ESTIMADO DA OPERAÇÃO
        /// </summary>
        public decimal consumoEstimado { get; set; }


        /// <summary>
        /// ESTIMATIVA DO CONSUMO DA MAQUINA NA ATIVIDADE
        /// </summary>
        public decimal estimativaCombustivelUtilizado { get; set; }

        public bool informouAbastecimento { get; set; }


        #region APONTAMENTOD DE CONSUMO MAQUINA

        public decimal consumoHRMaquina { get; set; }
        public decimal consumoHRImplemento { get; set; }

        public decimal consumoHAMaquina { get; set; }
        public decimal consumoHAImplemento { get; set; }

        public decimal custoHAMaquina { get; set; }
        public decimal custoHAImplemento { get; set; }

        public decimal custoHRMaquina { get; set; }
        public decimal custoHRImplemento { get; set; }

        public decimal areaTrabalhada { get; set; }
        #endregion
    }

    ###Apontamento de Produtos
    possui tenant
    possui auditoria
        public class ApontamentoProduto
    {
        [Key]
        public int id { get; set; }

        public int idApontamento { get; set; }
        [ForeignKey("idApontamento")]
        public virtual Apontamento apontamento { get; set; }

        public int idProduto { get; set; }
        [ForeignKey("idProduto")]
        public virtual Cadastro.Produto produto { get; set; }

        public decimal quantidade { get; set; }
        public decimal valor { get; set; } //obter custo medio do produto
        public decimal temperatura { get; set; }
        public decimal umidade { get; set; }
        public int periodo { get; set; }
        public DateTime data { get; set; }
        public int numero { get; set; }
        public string observacao { get; set; }
        public decimal area { get; set; }
        public decimal dosagem { get; set; }
        public bool produtoConvertidoMoeda { get; set; }


        public virtual List<MovimentoEstoque> listaMovimentos { get; set; }
        //public virtual Estoque.MovimentoEstoque movimento { get; set; }
    }

    ###Serviço Agricola
    possui tenant
    possui auditoria
        public class ServicoAgricola
    {
        [Key]
        public int id { get; set; }

        public string descricao { get; set; }
        public bool financeiro { get; set; } //caso marcado, ira gerar um registro financeiro, contas a pagar
        public string observacao { get; set; }
    }
##Apontamento de Serviço Agricola
possui tenant
possui auditoria
 public class ApontamentoServico
    {
        [Key]
        public int id { get; set; }

        public int idApontamento { get; set; }
        [ForeignKey("idApontamento")]
        public virtual Apontamento apontamento { get; set; }

        public int idServico { get; set; }
        [ForeignKey("idServico")]
        public virtual ServicoAgricola servico { get; set; }

        public int idResponsavel { get; set; }
        [ForeignKey("idResponsavel")]
        public virtual Cadastro.Pessoa responsavel { get; set; }

        public int? idMoeda { get; set; }
        [ForeignKey("idMoeda")]
        public virtual Financeiro.Moeda moeda { get; set; }

        public int? idPagar { get; set; }
        [ForeignKey("idPagar")]
        public virtual Financeiro.Pagar pagar { get; set; }

        public DateTime data { get; set; }
        public decimal valor { get; set; }
        public decimal tempo { get; set; }

        public string observacao_aptserv { get; set; }
    }
###Regras de negocio de apontamento
    public class BUSCustoProducao
    {

        /// <summary>
        /// RELATORIO DE CONSUMO DE COMBUSTIVEL POR MAQUINAS    
        /// </summary>
        /// <param name="idCiclo"></param>
        /// <param name="idTalhao"></param>
        /// <param name="idFazenda"></param>
        /// <param name="idCultura"></param>
        /// <returns></returns>
        public static List<VWInformacaoConsumoApontamento> GetRelatorioConsumoCustoProducao(int idCiclo = 1,
            int? idTalhao = null, int? idFazenda = null, int? idCultura = null)
        {
            using (var ctx = new AriesContext())
            {
                using (var bd = new AriesUnitOfWork(ctx))
                {
                    var consulta = (from aptAt in ctx.apontamentoAtividade
                                    join atAgro in ctx.atividadeAgricola on aptAt.idAtividade equals atAgro.id_atv into _atAgro
                                    from atAgro in _atAgro.DefaultIfEmpty()
                                    join atOpe in ctx.atividadeOperacao on aptAt.idOperacao equals atOpe.id_op into _atOpe
                                    from atOpe in _atOpe.DefaultIfEmpty()
                                    join apt in ctx.apontamento on aptAt.idApontamento equals apt.id_apt into _apt
                                    from apt in _apt.DefaultIfEmpty()
                                    join cfgCiclo in ctx.configuradorCiclo on apt.idConfiguracao equals cfgCiclo.id_cfg into _cfgCiclo
                                    from cfgCiclo in _cfgCiclo.DefaultIfEmpty()
                                    join talhao in ctx.talhao on cfgCiclo.idTalhao equals talhao.id_talhao into _talhao
                                    from talhao in _talhao.DefaultIfEmpty()
                                    join ciclo in ctx.ciclo on cfgCiclo.idCiclo equals ciclo.id_ciclo into _ciclo
                                    from ciclo in _ciclo.DefaultIfEmpty()
                                    join cultura in ctx.cultura on cfgCiclo.idCultura equals cultura.id_clt into _cultura
                                    from cultura in _cultura.DefaultIfEmpty()
                                    join fazenda in ctx.fazenda on talhao.idFazenda equals fazenda.id_fazenda into _fazenda
                                    from fazenda in _fazenda.DefaultIfEmpty()
                                    where cfgCiclo.idCiclo == idCiclo
                                    select new
                                    {
                                        codigo = aptAt.id_aptativ,
                                        idApontamento = aptAt.idApontamento,
                                        idAtividade = aptAt.idAtividade,
                                        idOperacao = aptAt.idOperacao,
                                        descricaoOperacao = atOpe.descricao_op,
                                        descricaoAtividade = atAgro.descricao_atv,
                                        descricaoTalhao = talhao.descricao_talhao,
                                        //areaTalhao = talhao.area_talhao,
                                        areaTalhao = cfgCiclo.areaplantada_cfg,
                                        descricaoCiclo = ciclo.descricao_ciclo,
                                        descricaoCultura = cultura.descricao_clt,
                                        descricaoFazenda = fazenda.descricao_fazenda,
                                        idFazenda = fazenda.id_fazenda,
                                        idCiclo = cfgCiclo.idCiclo,
                                        idTalhao = cfgCiclo.idTalhao,
                                        idCultura = cfgCiclo.idCultura
                                    }
                                    ).ToList();

                    if (idFazenda.HasValue)
                        consulta = consulta.Where(q => q.idFazenda == idFazenda.Value).ToList();

                    if (idTalhao.HasValue)
                        consulta = consulta.Where(q => q.idTalhao == idTalhao.Value).ToList();

                    if (idCultura.HasValue)
                        consulta = consulta.Where(q => q.idCultura == idCultura.Value).ToList();


                    var lstRet = new List<VWInformacaoConsumoApontamento>();
                    //Para cada registro, retornar os apontamentos efetuados
                    foreach (var ap in consulta)
                    {

                        var lstMaquina = (from aMaq in ctx.apontamentoMaquinas
                                          join maq in ctx.maquina on aMaq.idMaquina equals maq.id_mqn into _maq
                                          from maq in _maq.DefaultIfEmpty()
                                          join imp in ctx.maquina on aMaq.idImplemento equals imp.id_mqn into _imp
                                          from imp in _imp.DefaultIfEmpty()
                                          where aMaq.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aMaq.id_aptmaq,
                                              idMaquina = aMaq.id_aptmaq,
                                              descricaoMaquina = maq.descricao_mqn,
                                              valor = aMaq.valorhora_aptmaq,
                                              horasTrabalhadas = aMaq.horatotal_aptmaq,
                                              custoMaquina = aMaq.valorhora_aptmaq,
                                              custoImplemento = aMaq.valorhoraimpl_aptmaq,
                                              dataOperacao = aMaq.data_aptmaq,
                                              A_AreaTrabalhada = aMaq.areaTrabalhada_aptmaq,
                                              B_TotalHoras = aMaq.horatotal_aptmaq,
                                              C_ConsumoHRMaquina = aMaq.consumoHRMaquina_aptmaq,
                                              D_ConsumoHRImplemento = aMaq.consumoHRImplemento_aptmaq,
                                              E_ConsumoHAMaquina = aMaq.consumoHAMaquina_aptmaq,
                                              F_ConsumoHAImplemento = aMaq.consumoHAImplemento_aptmaq,
                                              G_CustoHAMaquina = aMaq.custoHAMaquina_aptmaq,
                                              H_CustoHAImplemento = aMaq.custoHAImplemento_aptmaq,
                                              I_CustoHoraMaquina = aMaq.valorhora_aptmaq,
                                              J_CustoHRImplemento = aMaq.valorhoraimpl_aptmaq,
                                              descricaoImplemento = imp.descricao_mqn
                                          }
                                          ).ToList();


                        foreach (var m in lstMaquina)
                        {
                            var reg = new VWInformacaoConsumoApontamento()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = m.A_AreaTrabalhada > 0 ? (decimal)m.A_AreaTrabalhada : ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                //areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                descricaoApontamento = string.Format("{0} - {1}", m.idMaquina.ToString().PadLeft(10, '0'), m.descricaoMaquina),
                                unitario = m.custoImplemento + m.custoMaquina,
                                quantidade = m.horasTrabalhadas,
                                dataOperacao = m.dataOperacao,
                                valorMaquina = (m.custoImplemento + m.custoMaquina) * m.horasTrabalhadas,
                                idTalhao = ap.idTalhao,
                                descricaoImplemento = m.descricaoImplemento
                            };

                            if (m.A_AreaTrabalhada > 0)
                            {
                                reg.areaTalhao = m.A_AreaTrabalhada;
                            }
                            else
                            {
                                if (ap.areaTalhao.HasValue)
                                    reg.areaTalhao = ap.areaTalhao.Value;
                                else
                                    reg.areaTalhao = 0;
                            }

                            decimal K_TotalConsumoHR = (m.C_ConsumoHRMaquina + m.D_ConsumoHRImplemento);
                            decimal L_TotalConsumoHA = (m.E_ConsumoHAMaquina + m.F_ConsumoHAImplemento) * reg.areaTalhao;
                            decimal M_CustoTotalHA = (m.G_CustoHAMaquina + m.H_CustoHAImplemento) * reg.areaTalhao;
                            decimal N_CustoFinal = ((m.I_CustoHoraMaquina + m.J_CustoHRImplemento) * m.B_TotalHoras) + M_CustoTotalHA;

                            reg.consumoTotalHR = K_TotalConsumoHR;
                            reg.consumoTotalHA = L_TotalConsumoHA;
                            reg.custoTotalHA = M_CustoTotalHA;
                            reg.custoTotalHR = N_CustoFinal;

                            reg.uConsumoHRMaquina = m.C_ConsumoHRMaquina;
                            reg.uConsumoHRImplemento = m.D_ConsumoHRImplemento;
                            reg.uConsumoHAMaquina = m.E_ConsumoHAMaquina;
                            reg.uConsumoHAImplemento = m.F_ConsumoHAImplemento;
                            reg.uCustoHAMaquina = m.G_CustoHAMaquina;
                            reg.uCustoHAImplemento = m.H_CustoHAImplemento;
                            reg.uCustoHRMaquina = m.I_CustoHoraMaquina;
                            reg.uCustoHRImplemento = m.J_CustoHRImplemento;






                            reg.valorMaquina = N_CustoFinal;

                            lstRet.Add(reg);
                        }

                    }


                    if (lstRet?.Count > 0)
                    {
                        var talhaoDistinto = lstRet.Select(m => new { m.idFazenda, m.idTalhao })
                            .Distinct()
                            .ToList();

                        foreach (var t in talhaoDistinto)
                        {
                            var produto = lstRet.Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda)
                                .FirstOrDefault();

                            if (produto != null)
                            {
                                var areaTalhao = consulta
                                    .Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda &&
                                                q.areaTalhao > 0)
                                    .FirstOrDefault();


                                if (areaTalhao != null)
                                {
                                    produto.fixTalhao = areaTalhao.areaTalhao.HasValue
                                        ? (decimal)areaTalhao.areaTalhao
                                        : 0;
                                }
                            }
                        }
                    }





                    return lstRet.OrderBy(q => q.dataOperacao).ToList();




                }
            }


        }

        /// <summary>
        /// COM O OBJETO RETORNADO DO BANCO DE DADOS, EFETUA O TRATAMENTO E EXIBIÇÃO DAS INFORMAÇÕES
        /// </summary>
        /// <param name="_dados"></param>
        /// <returns></returns>
        public static Objects.Plantio.Relatorio.VW_DadosFechamento GerarInformacoesFechamentoSafra(List<Objects.Plantio.Relatorio.rptCustoProducao> _dados)
        {
            var ret = new VW_DadosFechamento()
            {
                _dadosSafra = _dados
            };



            return ret;


        }

        public static List<Objects.Plantio.Relatorio.rptCustoProducao> GetRelatorioCustoProducao(int idCiclo = 1,
            int? idTalhao = null, int? idFazenda = null, int? idCultura = null, int? idGrupo = null, int? idSub = null)
        {
            using (var ctx = new AriesContext())
            {
                using (var bd = new AriesUnitOfWork(ctx))
                {
                    var consulta = (from aptAt in ctx.apontamentoAtividade
                                    join atAgro in ctx.atividadeAgricola on aptAt.idAtividade equals atAgro.id_atv into _atAgro
                                    from atAgro in _atAgro.DefaultIfEmpty()
                                    join atOpe in ctx.atividadeOperacao on aptAt.idOperacao equals atOpe.id_op into _atOpe
                                    from atOpe in _atOpe.DefaultIfEmpty()
                                    join apt in ctx.apontamento on aptAt.idApontamento equals apt.id_apt into _apt
                                    from apt in _apt.DefaultIfEmpty()
                                    join cfgCiclo in ctx.configuradorCiclo on apt.idConfiguracao equals cfgCiclo.id_cfg into _cfgCiclo
                                    from cfgCiclo in _cfgCiclo.DefaultIfEmpty()
                                    join talhao in ctx.talhao on cfgCiclo.idTalhao equals talhao.id_talhao into _talhao
                                    from talhao in _talhao.DefaultIfEmpty()
                                    join ciclo in ctx.ciclo on cfgCiclo.idCiclo equals ciclo.id_ciclo into _ciclo
                                    from ciclo in _ciclo.DefaultIfEmpty()
                                    join cultura in ctx.cultura on cfgCiclo.idCultura equals cultura.id_clt into _cultura
                                    from cultura in _cultura.DefaultIfEmpty()
                                    join fazenda in ctx.fazenda on talhao.idFazenda equals fazenda.id_fazenda into _fazenda
                                    from fazenda in _fazenda.DefaultIfEmpty()
                                    where cfgCiclo.idCiclo == idCiclo
                                    select new
                                    {
                                        codigo = aptAt.id_aptativ,
                                        idApontamento = aptAt.idApontamento,
                                        idAtividade = aptAt.idAtividade,
                                        idOperacao = aptAt.idOperacao,
                                        descricaoOperacao = atOpe.descricao_op,
                                        descricaoAtividade = atAgro.descricao_atv,
                                        descricaoTalhao = talhao.descricao_talhao,
                                        //areaTalhao = talhao.area_talhao,
                                        areaTalhao = cfgCiclo.areaplantada_cfg,
                                        descricaoCiclo = ciclo.descricao_ciclo,
                                        descricaoCultura = cultura.descricao_clt,
                                        descricaoFazenda = fazenda.descricao_fazenda,
                                        idFazenda = fazenda.id_fazenda,
                                        idCiclo = cfgCiclo.idCiclo,
                                        idTalhao = cfgCiclo.idTalhao,
                                        idCultura = cfgCiclo.idCultura
                                    }
                                    ).ToList();

                    if (idFazenda.HasValue)
                        consulta = consulta.Where(q => q.idFazenda == idFazenda.Value).ToList();

                    if (idTalhao.HasValue)
                        consulta = consulta.Where(q => q.idTalhao == idTalhao.Value).ToList();

                    if (idCultura.HasValue)
                        consulta = consulta.Where(q => q.idCultura == idCultura.Value).ToList();





                    var lstRet = new List<Objects.Plantio.Relatorio.rptCustoProducao>();
                    //Para cada registro, retornar os apontamentos efetuados
                    foreach (var ap in consulta)
                    {
                        //var lstProdutos = bd.apontamentoProduto.Consulta(q => q.idApontamentoAtividade == ap.codigo).ToList();

                        var lstProduto = (from aProd in ctx.apontamentoProduto
                                          join prod in ctx.produto on aProd.idProduto equals prod.id_prod into _prod
                                          from prod in _prod.DefaultIfEmpty()
                                          where aProd.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aProd.id_aptprod,
                                              idProduto = aProd.idProduto,
                                              descricaoProduto = prod.descricao_prod,
                                              totalProduto = aProd.valor_aptprod * aProd.quantidade_aptprod,
                                              quantidadeProduto = aProd.quantidade_aptprod,
                                              unitarioProduto = aProd.valor_aptprod,
                                              data = aProd.data_aptprod,
                                              grupo = prod.idGrupo,
                                              subgrupo = prod.idSubGrupo,
                                              codigoMoeda = prod.idIndexador,
                                              prodConvertido = aProd.produtoConvertidoMoeda_aptprod
                                          }).ToList();

                        if (idGrupo.HasValue)
                            lstProduto = lstProduto.Where(q => q.grupo == idGrupo.Value).ToList();

                        if (idSub.HasValue)
                            lstProduto = lstProduto.Where(q => q.subgrupo == idSub.Value).ToList();



                        var lstServico = (from aServ in ctx.apontamentoServico
                                          join serv in ctx.servicoAgricola on aServ.idServico equals serv.id_srv into _serv
                                          from serv in _serv.DefaultIfEmpty()
                                          where aServ.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aServ.id_aptsrv,
                                              idServico = aServ.idServico,
                                              descricaoServico = serv.descricao_srv,
                                              valorServico = aServ.valor_aptsrv,
                                              dataServico = aServ.data_aptsrv,
                                              quantidadeTonelada = aServ.quantidadeTon_aptsrv,
                                              unitarioTonelada = aServ.unitarioTon_aptsrv
                                          }
                                          ).ToList();



                        foreach (var p in lstProduto)
                        {
                            var reg = new Objects.Plantio.Relatorio.rptCustoProducao()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                descricaoApontamento = string.Format("{0} - {1}", p.idProduto.ToString().PadLeft(10, '0'), p.descricaoProduto),
                                valorProduto = p.totalProduto,
                                unitario = p.unitarioProduto,
                                quantidade = p.quantidadeProduto,
                                dataOperacao = p.data,
                                idTalhao = ap.idTalhao,
                                idGrupo = p.grupo,
                                idSubgrupo = p.subgrupo,
                                idProduto = p.idProduto
                            };

                            if (p.codigoMoeda.HasValue && !p.prodConvertido)
                            {
                                //SE TIVER MOEDA. BUSCAR A COTACAO DA TABELA
                                var historicoPreco = Business.Estoque.BUSHistoricoPreco.GetHistoricoProduto(bd, p.idProduto, p.codigoMoeda.Value, p.data);

                                if (historicoPreco != null)
                                {
                                    var dadosCotacao = Business.Financeiro.BUSMoedaCotacao.GetDadosCotacao(historicoPreco.idCotacaoMoeda.Value);

                                    if (dadosCotacao != null)
                                    {
                                        reg.unitario = p.unitarioProduto * dadosCotacao.valor_cotacao;

                                        reg.valorProduto = (p.unitarioProduto * dadosCotacao.valor_cotacao) * p.quantidadeProduto;

                                        reg.unitario = p.unitarioProduto * dadosCotacao.valor_cotacao;


                                        reg.descricaoApontamento += string.Format(" (U:{0} / C:{1})", p.unitarioProduto, dadosCotacao.valor_cotacao);
                                    }
                                }
                            }


                            lstRet.Add(reg);
                        }

          
                        foreach (var s in lstServico)
                        {
                            var reg = new Objects.Plantio.Relatorio.rptCustoProducao()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                
                                valorServico = s.valorServico,
                                quantidade = 1,
                                unitario = s.valorServico,
                                idTalhao = ap.idTalhao,
                                dataOperacao = s.dataServico
                            };

                            if(s.unitarioTonelada > 0 || s.quantidadeTonelada > 0)
                            {
                                string _infoTonelada = "  (Q. TON : {0} | U. TON (R$) {1:c4})";

                                reg.descricaoApontamento = string.Format("{0} - {1}", s.idServico.ToString().PadLeft(10, '0'), s.descricaoServico + string.Format(_infoTonelada,s.quantidadeTonelada,s.unitarioTonelada));
                            }
                            else
                            {
                                reg.descricaoApontamento = string.Format("{0} - {1}", s.idServico.ToString().PadLeft(10, '0'), s.descricaoServico);
                            }

                            lstRet.Add(reg);
                        }
                    }


                    if (lstRet?.Count > 0)
                    {
                        var talhaoDistinto = lstRet.Select(m => new { m.idFazenda, m.idTalhao })
                            .Distinct()
                            .ToList();

                        foreach (var t in talhaoDistinto)
                        {
                            var produto = lstRet.Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda)
                                .FirstOrDefault();

                            if (produto != null)
                            {
                                var areaTalhao = consulta
                                    .Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda &&
                                                q.areaTalhao > 0)
                                    .FirstOrDefault();


                                if (areaTalhao != null)
                                {
                                    produto.fixTalhao = areaTalhao.areaTalhao.HasValue
                                        ? (decimal)areaTalhao.areaTalhao
                                        : 0;
                                }
                            }
                        }
                    }





                    return lstRet.OrderBy(q => q.dataOperacao).ToList();



                    return null;
                }
            }
        }

        /// <summary>
        /// RETORNA OS DADOS DE SAFRA DE ACORDO COM A CICLO,FAZENDA E CULTURA
        /// </summary>
        /// <param name="idCiclo"></param>
        /// <param name="idFazenda"></param>
        /// <param name="idCultura"></param>
        /// <returns></returns>
        public static List<Objects.Plantio.Relatorio.rptCustoProducao> GetAcompanhamentoSafra(int idCiclo = 1,
             int? idFazenda = null, int? idCultura = null)
        {
            using (var ctx = new AriesContext())
            {
                using (var bd = new AriesUnitOfWork(ctx))
                {
                    var consulta = (from aptAt in ctx.apontamentoAtividade
                                    join atAgro in ctx.atividadeAgricola on aptAt.idAtividade equals atAgro.id_atv into _atAgro
                                    from atAgro in _atAgro.DefaultIfEmpty()
                                    join atOpe in ctx.atividadeOperacao on aptAt.idOperacao equals atOpe.id_op into _atOpe
                                    from atOpe in _atOpe.DefaultIfEmpty()
                                    join apt in ctx.apontamento on aptAt.idApontamento equals apt.id_apt into _apt
                                    from apt in _apt.DefaultIfEmpty()
                                    join cfgCiclo in ctx.configuradorCiclo on apt.idConfiguracao equals cfgCiclo.id_cfg into _cfgCiclo
                                    from cfgCiclo in _cfgCiclo.DefaultIfEmpty()
                                    join talhao in ctx.talhao on cfgCiclo.idTalhao equals talhao.id_talhao into _talhao
                                    from talhao in _talhao.DefaultIfEmpty()
                                    join ciclo in ctx.ciclo on cfgCiclo.idCiclo equals ciclo.id_ciclo into _ciclo
                                    from ciclo in _ciclo.DefaultIfEmpty()
                                    join cultura in ctx.cultura on cfgCiclo.idCultura equals cultura.id_clt into _cultura
                                    from cultura in _cultura.DefaultIfEmpty()
                                    join fazenda in ctx.fazenda on talhao.idFazenda equals fazenda.id_fazenda into _fazenda
                                    from fazenda in _fazenda.DefaultIfEmpty()
                                    where cfgCiclo.idCiclo == idCiclo && cfgCiclo.idCultura == idCultura && talhao.idFazenda == idFazenda
                                    select new
                                    {
                                        codigo = aptAt.id_aptativ,
                                        idApontamento = aptAt.idApontamento,
                                        idAtividade = aptAt.idAtividade,
                                        idOperacao = aptAt.idOperacao,
                                        descricaoOperacao = atOpe.descricao_op,
                                        descricaoAtividade = atAgro.descricao_atv,
                                        descricaoTalhao = talhao.descricao_talhao,
                                        //areaTalhao = talhao.area_talhao,
                                        areaTalhao = cfgCiclo.areaplantada_cfg,
                                        descricaoCiclo = ciclo.descricao_ciclo,
                                        descricaoCultura = cultura.descricao_clt,
                                        descricaoFazenda = fazenda.descricao_fazenda,
                                        idFazenda = fazenda.id_fazenda,
                                        idCiclo = cfgCiclo.idCiclo,
                                        idTalhao = cfgCiclo.idTalhao,
                                        idCultura = cfgCiclo.idCultura
                                    }
                                    ).ToList();

                   





                    var lstRet = new List<Objects.Plantio.Relatorio.rptCustoProducao>();
                    //Para cada registro, retornar os apontamentos efetuados
                    foreach (var ap in consulta)
                    {
                        //var lstProdutos = bd.apontamentoProduto.Consulta(q => q.idApontamentoAtividade == ap.codigo).ToList();

                        var lstProduto = (from aProd in ctx.apontamentoProduto
                                          join prod in ctx.produto on aProd.idProduto equals prod.id_prod into _prod
                                          from prod in _prod.DefaultIfEmpty()
                                          where aProd.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aProd.id_aptprod,
                                              idProduto = aProd.idProduto,
                                              descricaoProduto = prod.descricao_prod,
                                              totalProduto = aProd.valor_aptprod * aProd.quantidade_aptprod,
                                              quantidadeProduto = aProd.quantidade_aptprod,
                                              unitarioProduto = aProd.valor_aptprod,
                                              data = aProd.data_aptprod,
                                              grupo = prod.idGrupo,
                                              subgrupo = prod.idSubGrupo,
                                              codigoMoeda = prod.idIndexador,
                                              prodConvertido = aProd.produtoConvertidoMoeda_aptprod
                                          }).ToList();


                        var lstServico = (from aServ in ctx.apontamentoServico
                                          join serv in ctx.servicoAgricola on aServ.idServico equals serv.id_srv into _serv
                                          from serv in _serv.DefaultIfEmpty()
                                          where aServ.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aServ.id_aptsrv,
                                              idServico = aServ.idServico,
                                              descricaoServico = serv.descricao_srv,
                                              valorServico = aServ.valor_aptsrv
                                          }
                                          ).ToList();



                        foreach (var p in lstProduto)
                        {
                            var reg = new Objects.Plantio.Relatorio.rptCustoProducao()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                descricaoApontamento = string.Format("{0} - {1}", p.idProduto.ToString().PadLeft(10, '0'), p.descricaoProduto),
                                valorProduto = p.totalProduto,
                                unitario = p.unitarioProduto,
                                quantidade = p.quantidadeProduto,
                                dataOperacao = p.data,
                                idTalhao = ap.idTalhao,
                                idGrupo = p.grupo,
                                idSubgrupo = p.subgrupo,
                                idProduto = p.idProduto
                            };

                            if (p.codigoMoeda.HasValue && !p.prodConvertido)
                            {
                                //SE TIVER MOEDA. BUSCAR A COTACAO DA TABELA
                                var historicoPreco = Business.Estoque.BUSHistoricoPreco.GetHistoricoProduto(bd, p.idProduto, p.codigoMoeda.Value, p.data);

                                if (historicoPreco != null)
                                {
                                    var dadosCotacao = Business.Financeiro.BUSMoedaCotacao.GetDadosCotacao(historicoPreco.idCotacaoMoeda.Value);

                                    if (dadosCotacao != null)
                                    {
                                        reg.unitario = p.unitarioProduto * dadosCotacao.valor_cotacao;

                                        reg.valorProduto = (p.unitarioProduto * dadosCotacao.valor_cotacao) * p.quantidadeProduto;

                                        reg.unitario = p.unitarioProduto * dadosCotacao.valor_cotacao;


                                        reg.descricaoApontamento += string.Format(" (U:{0} / C:{1})", p.unitarioProduto, dadosCotacao.valor_cotacao);
                                    }
                                }
                            }


                            lstRet.Add(reg);
                        }

                        

                        foreach (var s in lstServico)
                        {
                            var reg = new Objects.Plantio.Relatorio.rptCustoProducao()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                descricaoApontamento = string.Format("{0} - {1}", s.idServico.ToString().PadLeft(10, '0'), s.descricaoServico),
                                valorServico = s.valorServico,
                                quantidade = 1,
                                unitario = s.valorServico,
                                idTalhao = ap.idTalhao
                            };

                            lstRet.Add(reg);
                        }
                    }


                    if (lstRet?.Count > 0)
                    {
                        var talhaoDistinto = lstRet.Select(m => new { m.idFazenda, m.idTalhao })
                            .Distinct()
                            .ToList();

                        foreach (var t in talhaoDistinto)
                        {
                            var produto = lstRet.Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda)
                                .FirstOrDefault();

                            if (produto != null)
                            {
                                var areaTalhao = consulta
                                    .Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda &&
                                                q.areaTalhao > 0)
                                    .FirstOrDefault();


                                if (areaTalhao != null)
                                {
                                    produto.fixTalhao = areaTalhao.areaTalhao.HasValue
                                        ? (decimal)areaTalhao.areaTalhao
                                        : 0;
                                }
                            }
                        }
                    }





                    return lstRet.OrderBy(q => q.dataOperacao).ToList();



                }
            }
        }

        /// <summary>
        /// RETORNA OS DADOS DE FECHAMENTO DE CUSTO DE PRODUCAO CALCULADO COM RESUMO
        /// SOLICITADO SANDRO HENKES
        /// </summary>
        /// <param name="idCiclo"></param>
        /// <param name="idTalhao"></param>
        /// <param name="idFazenda"></param>
        /// <param name="idCultura"></param>
        /// <param name="idGrupo"></param>
        /// <param name="idSub"></param>
        /// <returns></returns>
        public static VW_DadosFechamento GetRelatorioCustoProducaoDash(int idCiclo = 1,
            int? idTalhao = null, int? idFazenda = null, int? idCultura = null, int? idGrupo = null, int? idSub = null)
        {
            using (var ctx = new AriesContext())
            {
                using (var bd = new AriesUnitOfWork(ctx))
                {
                    var consulta = (from aptAt in ctx.apontamentoAtividade
                                    join atAgro in ctx.atividadeAgricola on aptAt.idAtividade equals atAgro.id_atv into _atAgro
                                    from atAgro in _atAgro.DefaultIfEmpty()
                                    join atOpe in ctx.atividadeOperacao on aptAt.idOperacao equals atOpe.id_op into _atOpe
                                    from atOpe in _atOpe.DefaultIfEmpty()
                                    join apt in ctx.apontamento on aptAt.idApontamento equals apt.id_apt into _apt
                                    from apt in _apt.DefaultIfEmpty()
                                    join cfgCiclo in ctx.configuradorCiclo on apt.idConfiguracao equals cfgCiclo.id_cfg into _cfgCiclo
                                    from cfgCiclo in _cfgCiclo.DefaultIfEmpty()
                                    join talhao in ctx.talhao on cfgCiclo.idTalhao equals talhao.id_talhao into _talhao
                                    from talhao in _talhao.DefaultIfEmpty()
                                    join ciclo in ctx.ciclo on cfgCiclo.idCiclo equals ciclo.id_ciclo into _ciclo
                                    from ciclo in _ciclo.DefaultIfEmpty()
                                    join cultura in ctx.cultura on cfgCiclo.idCultura equals cultura.id_clt into _cultura
                                    from cultura in _cultura.DefaultIfEmpty()
                                    join fazenda in ctx.fazenda on talhao.idFazenda equals fazenda.id_fazenda into _fazenda
                                    from fazenda in _fazenda.DefaultIfEmpty()
                                    where cfgCiclo.idCiclo == idCiclo
                                    select new
                                    {
                                        codigo = aptAt.id_aptativ,
                                        idApontamento = aptAt.idApontamento,
                                        idAtividade = aptAt.idAtividade,
                                        idOperacao = aptAt.idOperacao,
                                        descricaoOperacao = atOpe.descricao_op,
                                        descricaoAtividade = atAgro.descricao_atv,
                                        descricaoTalhao = talhao.descricao_talhao,
                                        //areaTalhao = talhao.area_talhao,
                                        areaTalhao = cfgCiclo.areaplantada_cfg,
                                        descricaoCiclo = ciclo.descricao_ciclo,
                                        descricaoCultura = cultura.descricao_clt,
                                        descricaoFazenda = fazenda.descricao_fazenda,
                                        idFazenda = fazenda.id_fazenda,
                                        idCiclo = cfgCiclo.idCiclo,
                                        idTalhao = cfgCiclo.idTalhao,
                                        idCultura = cfgCiclo.idCultura
                                    }
                                    ).ToList();

                    if (idFazenda.HasValue)
                        consulta = consulta.Where(q => q.idFazenda == idFazenda.Value).ToList();

                    if (idTalhao.HasValue)
                        consulta = consulta.Where(q => q.idTalhao == idTalhao.Value).ToList();

                    if (idCultura.HasValue)
                        consulta = consulta.Where(q => q.idCultura == idCultura.Value).ToList();





                    var lstRet = new List<Objects.Plantio.Relatorio.rptCustoProducao>();
                    //Para cada registro, retornar os apontamentos efetuados
                    foreach (var ap in consulta)
                    {
                        //var lstProdutos = bd.apontamentoProduto.Consulta(q => q.idApontamentoAtividade == ap.codigo).ToList();

                        var lstProduto = (from aProd in ctx.apontamentoProduto
                                          join prod in ctx.produto on aProd.idProduto equals prod.id_prod into _prod
                                          from prod in _prod.DefaultIfEmpty()
                                          where aProd.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aProd.id_aptprod,
                                              idProduto = aProd.idProduto,
                                              descricaoProduto = prod.descricao_prod,
                                              totalProduto = aProd.valor_aptprod * aProd.quantidade_aptprod,
                                              quantidadeProduto = aProd.quantidade_aptprod,
                                              unitarioProduto = aProd.valor_aptprod,
                                              data = aProd.data_aptprod,
                                              grupo = prod.idGrupo,
                                              subgrupo = prod.idSubGrupo,
                                              codigoMoeda = prod.idIndexador,
                                              prodConvertido = aProd.produtoConvertidoMoeda_aptprod
                                          }).ToList();

                        if (idGrupo.HasValue)
                            lstProduto = lstProduto.Where(q => q.grupo == idGrupo.Value).ToList();

                        if (idSub.HasValue)
                            lstProduto = lstProduto.Where(q => q.subgrupo == idSub.Value).ToList();


                        var lstServico = (from aServ in ctx.apontamentoServico
                                          join serv in ctx.servicoAgricola on aServ.idServico equals serv.id_srv into _serv
                                          from serv in _serv.DefaultIfEmpty()
                                          where aServ.idApontamentoAtividade == ap.codigo
                                          select new
                                          {
                                              codigo = aServ.id_aptsrv,
                                              idServico = aServ.idServico,
                                              descricaoServico = serv.descricao_srv,
                                              valorServico = aServ.valor_aptsrv
                                          }
                                          ).ToList();



                        foreach (var p in lstProduto)
                        {
                            var reg = new Objects.Plantio.Relatorio.rptCustoProducao()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                descricaoApontamento = string.Format("{0} - {1}", p.idProduto.ToString().PadLeft(10, '0'), p.descricaoProduto),
                                valorProduto = p.totalProduto,
                                unitario = p.unitarioProduto,
                                quantidade = p.quantidadeProduto,
                                dataOperacao = p.data,
                                idTalhao = ap.idTalhao,
                                idGrupo = p.grupo,
                                idSubgrupo = p.subgrupo,
                                idProduto = p.idProduto
                            };

                            if (p.codigoMoeda.HasValue && !p.prodConvertido)
                            {
                                //SE TIVER MOEDA. BUSCAR A COTACAO DA TABELA
                                var historicoPreco = Business.Estoque.BUSHistoricoPreco.GetHistoricoProduto(bd, p.idProduto, p.codigoMoeda.Value, p.data);

                                if (historicoPreco != null)
                                {
                                    var dadosCotacao = Business.Financeiro.BUSMoedaCotacao.GetDadosCotacao(historicoPreco.idCotacaoMoeda.Value);

                                    if (dadosCotacao != null)
                                    {
                                        reg.unitario = p.unitarioProduto * dadosCotacao.valor_cotacao;

                                        reg.valorProduto = (p.unitarioProduto * dadosCotacao.valor_cotacao) * p.quantidadeProduto;

                                        reg.unitario = p.unitarioProduto * dadosCotacao.valor_cotacao;


                                        reg.descricaoApontamento += string.Format(" (U:{0} / C:{1})", p.unitarioProduto, dadosCotacao.valor_cotacao);
                                    }
                                }
                            }


                            lstRet.Add(reg);
                        }

                       
                        foreach (var s in lstServico)
                        {
                            var reg = new Objects.Plantio.Relatorio.rptCustoProducao()
                            {
                                idCiclo = ap.idCiclo,
                                descricaoCiclo = ap.descricaoCiclo,
                                idFazenda = ap.idFazenda,
                                descricaoFazenda = ap.descricaoFazenda,
                                areaTalhao = ap.areaTalhao.HasValue ? (decimal)ap.areaTalhao : 0,
                                descricaoTalhao = ap.descricaoTalhao,
                                descricaoCultura = ap.descricaoCultura,
                                idAtividade = ap.idAtividade,
                                descricaoAtividade = ap.descricaoAtividade,
                                idOperacao = ap.idOperacao,
                                descricaoOperacao = ap.descricaoOperacao,
                                descricaoApontamento = string.Format("{0} - {1}", s.idServico.ToString().PadLeft(10, '0'), s.descricaoServico),
                                valorServico = s.valorServico,
                                quantidade = 1,
                                unitario = s.valorServico,
                                idTalhao = ap.idTalhao
                            };

                            lstRet.Add(reg);
                        }
                    }


                    if (lstRet?.Count > 0)
                    {
                        var talhaoDistinto = lstRet.Select(m => new { m.idFazenda, m.idTalhao })
                            .Distinct()
                            .ToList();

                        foreach (var t in talhaoDistinto)
                        {
                            var produto = lstRet.Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda)
                                .FirstOrDefault();

                            if (produto != null)
                            {
                                var areaTalhao = consulta
                                    .Where(q => q.idTalhao == t.idTalhao && q.idFazenda == t.idFazenda &&
                                                q.areaTalhao > 0)
                                    .FirstOrDefault();


                                if (areaTalhao != null)
                                {
                                    produto.fixTalhao = areaTalhao.areaTalhao.HasValue
                                        ? (decimal)areaTalhao.areaTalhao
                                        : 0;
                                }
                            }
                        }
                    }



                    var ret = new VW_DadosFechamento();
                    ret._dadosSafra = lstRet.OrderBy(q => q.dataOperacao).ToList();

                    //TODO EFETUAR O CALCULO DE RESUMO DA SAFRA AGRUPADO POR OPERACAO E ATIVIDADE
                    //O
                    //SANDRO
                    











                    return ret;





                }
            }
        }



    }

