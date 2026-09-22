#Feature : Benfeitoria
##Implementações
**🎯 Objetivo**: Implementação dos objetos utilizados para o controle de safra e custos do sistema

##Premissas
###Movimento financeiro para Serviço Benfeitoria
Caso o serviço agricola vinculado ao serviço benfeitoria tenha o campo financeiro marcado, ao gerar o serviço benfeitoria, deve ser criado um movimento financeiro do tipo contas a pagar, com o valor do serviço benfeitoria, utilizando a moeda da benfeitoria,fazenda e safra vinculada a benfeitoria.

##Saldo disponivel para produto benfeitoria
Verificar se existe saldo de estoque para o produto, do tipo disponivel, para a fazenda vinculada a benfeitoria.



##Modelo de Dados
###Benfeitoria
Possui tenant
possui auditoria
public class Benfeitoria
    {
        [Key]
        public int id { get; set; }

        public string descricao { get; set; }
        public decimal valortotal { get; set; }
        public int vidautil { get; set; }
        public decimal percsucata { get; set; }
        public decimal depreciacaoano { get; set; }
        public decimal taxamanutencao { get; set; }
        public decimal manutencaoano { get; set; }

        public int idFazenda { get; set; }
        [ForeignKey("idFazenda")]
        public virtual Cadastro.Fazenda fazenda { get; set; }

        public int? idUnidadeMedida { get; set; }
        [ForeignKey("idUnidadeMedida")]
        public virtual Cadastro.UnidadeMedida unidademedida { get; set; }

        public int? idSafra { get; set; }
        [ForeignKey("idSafra")]
        public virtual Cadastro.Safra safra { get; set; }

        public DateTime? data { get; set; }
        public string observacao { get; set; }
    }

##Produto Benfeitoria
Possui tenant
possui auditoria
    public class ProdutoBenfeitoria
    {
        [Key]
        public int id { get; set; }

        public int idProduto { get; set; }
        [ForeignKey("idProduto")]
        public virtual Cadastro.Produto produto { get; set; }

        public int idBenfeitoria { get; set; }
        [ForeignKey("idBenfeitoria")]
        public virtual Patrimonio.Benfeitoria benfeitoria { get; set; }


        public DateTime data { get; set; }
        public decimal quantidade { get; set; }
        public decimal unitario { get; set; }
        public string observacao { get; set; }

        public int? idSafra { get; set; }
        [ForeignKey("idSafra")]
        public virtual Cadastro.Safra safra { get; set; }

        public virtual List<MovimentoEstoque> movimentos { get; set; }

    }


##Serviço Benfeitoria  
Possui tenant
possui auditoria
public class ServicoBenfeitoria
    {
        [Key]
        public int id { get; set; }

        public int idBenfeitoria { get; set; }
        [ForeignKey("idBenfeitoria")]
        public virtual Patrimonio.Benfeitoria benfeitoria { get; set; }

        public int idServico { get; set; }
        [ForeignKey("idServico")]
        public virtual ServicoAgricola servico { get; set; }

        public int idResponsavel { get; set; }
        [ForeignKey("idResponsavel")]
        public virtual Cadastro.Pessoa responsavel { get; set; }

        public int? idMoeda { get; set; }
        [ForeignKey("idMoeda")]
        public virtual Financeiro.Moeda moeda { get; set; }

        public DateTime data { get; set; }
        public decimal valor { get; set; }
        public decimal tempo { get; set; }

        public string observacao { get; set; }

        public int? idSafra { get; set; }
        [ForeignKey("idSafra")]
        public virtual Cadastro.Safra safra { get; set; }
    }

##Regras de negócio para Produto Benfeitoria
/// <summary>
    /// CLASSE COM OS METODOS DE NEGOCIO REFERENTES AOS PRODUTOS
    /// </summary>
    public static class BUSProdutoBenfeitoria
    {
        public static bool ValidaDadosProduto(ProdutoBenfeitoria produto)
        {
            if (produto.idProduto == -1)
                throw new S3ValidacaoException("Produto");

            if (produto.quantidade_prodb <= 0)
                throw new S3ValidacaoGenericaException("Informe uma quantidade válida.");

            if (produto.unitario_prodb <= 0)
                throw new S3ValidacaoGenericaException("Valor unitário incorreto.");

            if (produto.data_prodb == DateTime.MinValue)
                throw new S3ValidacaoException("Data");

            if(produto.idCiclo == null)
                throw new S3ValidacaoGenericaException("Ciclo");
            return true;
        }

        

        /// <summary>
        /// EXCLUI O LANÇAMENTO DO PRODUTO
        /// </summary>
        /// <param name="idProdutoBenfeitoria"></param>
        /// <returns></returns>
        public static bool ExcluiProdutoBenfeitoria(int idProdutoBenfeitoria)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    var prod = bd.produtoBenfeitoria.Consulta(q => q.id_prodb == idProdutoBenfeitoria).FirstOrDefault();
                    if (prod != null)
                    {

                        //MOVIMENTOS DO PRODUTO
                        var movimentos = bd.movimentoEstoque
                            .Consulta(q => q.idProdutoBenfeitoria == idProdutoBenfeitoria)
                            .ToList();

                        if (movimentos?.Count > 0)
                        {
                            bd.movimentoEstoque.ExcluiListaTransacao(movimentos);
                        }

                        //EXCLUSAO DO PRODUTO

                        bd.produtoBenfeitoria.ExcluirTransacao(prod);
                        bd.Salvar();
                        return true;
                    }
                }
            }

            return false;
        }

        /// <summary>
        /// CRIA A LISTA DE MOVIMENTOS E RETORNA
        /// </summary>
        /// <param name="prod"></param>
        /// <returns></returns>
        public static List<MovimentoEstoque> MontaMovimentoProdutoBenfeitoria(ProdutoBenfeitoria prod, int idFazenda)
        {
            if (prod != null)
            {
                Objects.Estoque.MovimentoEstoque movD = new Objects.Estoque.MovimentoEstoque();
                movD.idFazenda = idFazenda;
                movD.idProduto = prod.idProduto;
                movD.tipomov_move = 1;
                movD.data_move = prod.data_prodb;
                movD.quantidade_move = prod.quantidade_prodb * -1;
                movD.operacao_move = Objects.Estoque.operacaoEstoque.DISPONIVEL;

                Objects.Estoque.MovimentoEstoque movF = new Objects.Estoque.MovimentoEstoque();
                movF.idFazenda = idFazenda;
                movF.idProduto = prod.idProduto;
                movF.tipomov_move = 1;
                movF.data_move = prod.data_prodb;
                movF.quantidade_move = prod.quantidade_prodb * -1;
                movF.operacao_move = Objects.Estoque.operacaoEstoque.ESTOQUE_FISICO;

                var lstret = new List<MovimentoEstoque>();
                lstret.Add(movD);
                lstret.Add(movF);

                return lstret;
            }
            else return null;
        }


        /// <summary>
        /// INSERE OS DADOS DE BEFEITORIA JUNTAMENTE COM AS MOVIMENTAÇÕES DE ESTOQUE
        /// </summary>
        /// <param name="prod"></param>
        public static void Insere(ProdutoBenfeitoria prod)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    //VALIDA SALDO ANTES DE PROSSEGUIR COM AS OPERAÇÕES
                    var benfeitoria = bd.benfeitoria.Consulta(q => q.id_benf == prod.idBenfeitoria).FirstOrDefault();
                    if (benfeitoria != null)
                    {
                        //RETORNA O SALDO DO PRODUTO DISPONIVEL PARA A BENFEITORIAS
                        decimal saldoProduto =
                            Business.Estoque.BUSMovimentoEstoque.GetSaldoProdutoEstoque(prod.idProduto,
                                benfeitoria.idFazenda);

                        if (!Business.Estoque.BUSMovimentoEstoque.ValidaSaldoDisponivel(prod.idProduto, benfeitoria.idFazenda, prod.quantidade_prodb)) //QUANTIDADE SOLICITADA INVALIDA PARA A OPERAÇÃO
                        {
                            throw new S3ValidacaoGenericaException(
                                "A quantidade solicitada é inferior a disponível em estoque");
                        }

                        var movimentos = MontaMovimentoProdutoBenfeitoria(prod, benfeitoria.idFazenda);
                        if (movimentos?.Count > 0)
                        {
                            prod.movimentos_prodb = movimentos;


                            bd.produtoBenfeitoria.InserirTransacao(prod);
                            bd.Salvar();
                        }
                    }
                }
            }
        }

        public static List<Objects.Plantio.Views.ApontamentoProdutoExtendido> GetListaProduto(int idBenfeitoria)
        {
            using (var ctx = new AriesContext())
            {
                var query = (from aptProd in ctx.produtoBenfeitoria
                             join prod in ctx.produto on aptProd.idProduto equals prod.id_prod into _prod
                             from prod in _prod.DefaultIfEmpty()
                             where (aptProd.idBenfeitoria == idBenfeitoria)
                             select new Objects.Plantio.Views.ApontamentoProdutoExtendido()
                             {
                                 codigo = aptProd.id_prodb,
                                 data = aptProd.data_prodb,
                                 descricaoProduto = prod.descricao_prod,
                                 idProduto = prod.id_prod,
                                 quantidade = aptProd.quantidade_prodb,
                                 valor = aptProd.unitario_prodb * aptProd.quantidade_prodb,
                                 observacao = aptProd.observacao_prodb
                             }).ToList();

                return query;
            }
        }
    }


