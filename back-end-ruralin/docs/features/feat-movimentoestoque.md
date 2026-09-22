#Feature : Abastecimento
##Implementações
**OBJETIVO : Produtos e Estoque

##Premissas
###Historico de preços
a cada movimento de estoque, deve ser gerado o historico de movimento de preços, quando o tipo de movimentação for (Pedido de Compra, Tomado Emprestado,Estoque Inicial)

###Produtos MultiMoeda
adaptar para controlar e permitir a movimentação de produtos em multi moeda, formando custo medio.

### Custo Medio
Adaptar para calcular o custo medio do produto em cima dos movimentos de entrada.



###

##Modelo de dados
###Movimento de Estoque
possui multitenant
possui auditoria
public class MovimentoEstoque
    {
        [Key]
        public int id { get; set; }

        public int idProduto { get; set; }
        [ForeignKey("idProduto")]
        public virtual Cadastro.Produto produto { get; set; } //referencia da tabela de produto

        /// <summary>
        /// PRODUTOR DO MOVIMENTO, QUANDO ROMANEIO
        /// </summary>
        public int? idProdutor { get; set; }
        [ForeignKey("idProdutor")]
        public virtual Cadastro.Pessoa produtororigem { get; set; } //referencia tabela de pessoa onde produtor=true


        public int idFazenda { get; set; }
        [ForeignKey("idFazenda")]
        public virtual Cadastro.Fazenda fazenda { get; set; } //reerencia tabela de fazenda


        public int? idAbastecimento { get; set; }
        [ForeignKey("idAbastecimento")]
        public virtual Estoque.Abastecimento abastecimento { get; set; } //referencia a tabela de abastecimentos


        /// <summary>
        /// Tipo de movimentação
        /// 0 - Pedido de compra
        /// 1 - Estoque Fisico
        /// 2 - Emprestado
        /// 3 - Tomado emprestimo
        /// 4 - Estoque incial
        /// 5 - Contrato Receber
        /// </summary>
        public int tipomov { get; set; }

        /// <summary>
        /// OPERAÇAO DO ESTOQUE
        /// 1 - ESTOQUE FISICO
        /// 2 - PEDIDO DE COMPRA
        /// 4 - COMPRA ENTREGA FUTURA
        /// 5 - VENDA FUTURA
        /// 6 - TRADING
        /// 7 - DISPONIVEL
        /// 9 - BALCAO
        /// 51 - TERCEIRO
        /// </summary>
        public operacaoEstoque operacao { get; set; }

        public decimal quantidade { get; set; }
        public DateTime data { get; set; }
        public decimal valor {get;set;}

    }

    public enum operacaoEstoque
    {
        ESTOQUE_FISICO = 1,
        PEDIDO_COMPRA = 2,
        COMPRA_ENTREGA_FUTURA = 4,
        VENDA_FUTURA = 5,
        TRADING = 6,
        DISPONIVEL = 7,
        DISPONIVEL_USO = 71,
        BALCAO = 9,
        TERCEIRO = 51

    }

    ###Regras de negocio de Movimento Estoque
namespace S3Tech.Aries.Business.Estoque
{
    public static class BUSMovimentoEstoque
    {

        public static void InserirMovimentacao(MovimentoEstoque mov)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    bd.movimentoEstoque.Inserir(mov);
                }
            }

        }


        /// <summary>
        /// Retorna o saldo de produtos para a operacao informada
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="data"></param>
        /// <param name="operacao"></param>
        /// <returns></returns>
        public static decimal retornaSaldoPorOperacao(int idProduto, int idFazenda, DateTime data, operacaoEstoque operacao)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {

                    var movimentos = bd.movimentoEstoque.Consulta(q => q.idProduto == idProduto && q.idFazenda == idFazenda && EntityFunctions.TruncateTime(q.data_move) <= data.Date && q.operacao_move == operacao).ToList();
                    if (movimentos != null)
                        return movimentos.Sum(q => q.quantidade_move);
                    else return 0;
                }
            }
        }

        public static decimal retornaSaldoPorOperacaoProdutor(int idProduto, int idFazenda, DateTime data, operacaoEstoque operacao, int idProdutor)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    string movimentoss = bd.movimentoEstoque.Consulta(q => q.idProduto == idProduto && q.idFazenda == idFazenda && EntityFunctions.TruncateTime(q.data_move) <= data.Date && q.operacao_move == operacao && q.idProdutor == idProdutor).ToString();
                    var movimentos = bd.movimentoEstoque.Consulta(q => q.idProduto == idProduto && q.idFazenda == idFazenda && EntityFunctions.TruncateTime(q.data_move) <= data.Date && q.operacao_move == operacao && q.idProdutor == idProdutor).ToList();
                    if (movimentos != null)
                        return movimentos.Sum(q => q.quantidade_move);
                    else return 0;
                }
            }
        }

        /// <summary>
        /// RETORNA O SALDO DISPONIVEL PARA O PRODUTOR INFORMADO
        /// </summary>
        /// <param name="idProduto">PRODUTO</param>
        /// <param name="idFazenda">DEPOSITO</param>
        /// <param name="idProdutor">PRODUTOR DE ORIGEM</param>
        /// <returns></returns>
        public static decimal RetornaSaldoProdutor(int idProduto, int idFazenda, int idProdutor)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    //RETORNA TODOS OS MOVIMENTOS QUE GERARAM ESTOQUE DISPONIVEL PARA O PRODUTOR INFORMADO
                    var movimentos = bd.movimentoEstoque.Consulta(q => q.idProduto == idProduto && q.idFazenda == idFazenda && q.idProdutor == idProdutor && q.operacao_move == operacaoEstoque.DISPONIVEL).ToList();

                    if (movimentos != null)
                        return movimentos.Sum(q => q.quantidade_move);
                    else return 0;
                }
            }

        }

        

        /// <summary>
        /// Monta a movimentação de estoque, baseada no tipo de operacao
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="idTipoOperacao"></param>
        /// <param name="quantidade"></param>
        /// <returns></returns>
        public static List<MovimentoEstoque> MontaMovimentoEstoque(int idProduto, int idFazenda, int idTipoOperacao, decimal quantidade, DateTime data, bool ignorarQuantidade = false)
        {

            var operacao = Business.Cadastro.BUSTipoOperacao.GetByID(idTipoOperacao);
            if (operacao != null)
            {
                var lstRet = new List<MovimentoEstoque>();

                //estque fisico
                if (operacao.estoqueFisico == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.ESTOQUE_FISICO
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.estoqueFisico == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSEstoqueFisico)
                    {
                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.ESTOQUE_FISICO);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : ESTOQUE FISICO";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.ESTOQUE_FISICO
                    };

                    lstRet.Add(mov);
                }

                //PEDIDO DE COMPRA
                if (operacao.pedidoCompra == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.PEDIDO_COMPRA
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.pedidoCompra == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSPedidoCompra)
                    {
                        //se nao tiver pedido compra, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.PEDIDO_COMPRA);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : PEDIDO COMPRA";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.PEDIDO_COMPRA
                    };

                    lstRet.Add(mov);
                }

                //COMPRA ENTREGA FUTURA
                if (operacao.compraEntregaFuturo == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.COMPRA_ENTREGA_FUTURA
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.compraEntregaFuturo == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSCompraEntregaFutura)
                    {
                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.COMPRA_ENTREGA_FUTURA);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : COMPRA ENTREGA FUTURA";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.COMPRA_ENTREGA_FUTURA
                    };

                    lstRet.Add(mov);
                }

                //VENDA FUTURA
                if (operacao.vendaFutura == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.VENDA_FUTURA
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.vendaFutura == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSVendaFutura)
                    {
                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.VENDA_FUTURA);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : VENDA FUTURA";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.VENDA_FUTURA
                    };

                    lstRet.Add(mov);
                }

                //TRADING
                if (operacao.trading == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.TRADING
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.trading == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSArmazemTrading)
                    {
                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.TRADING);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : TRADING";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.TRADING
                    };

                    lstRet.Add(mov);
                }

                //DISPONIVEL
                if (operacao.disponivel == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.DISPONIVEL
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.disponivel == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSDisponivel)
                    {
                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.DISPONIVEL);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : DISPONIVEL";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.DISPONIVEL
                    };

                    lstRet.Add(mov);
                }

                //BALCAO
                if (operacao.balcao == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.BALCAO
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.balcao == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSBalcao)
                    {

                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.BALCAO);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : BALCAO";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.BALCAO
                    };

                    lstRet.Add(mov);
                }

                //ARMAZENAMENTO TERCEIRO
                if (operacao.depositoTerceiro == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.TERCEIRO
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.depositoTerceiro == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSDepTerceiro)
                    {
                        //se nao tiver estoque fisico, nao retira
                        var saldo = retornaSaldoPorOperacao(idProduto, idFazenda, data, operacaoEstoque.TERCEIRO);

                        if (quantidade > saldo)
                        {
                            string fmt = "A quantidade do produto excede o limite disponivel : TERCEIRO";
                            throw new S3ValidacaoGenericaException(fmt);
                        }
                    }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.TERCEIRO
                    };

                    lstRet.Add(mov);
                }

                return lstRet;

            }
            else return null;

        }

        /// <summary>
        /// GERA O MOVIMENTO DE ESTOQUE BASEADO NO PRODUTOR INFORMADO
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="idTipoOperacao"></param>
        /// <param name="quantidade"></param>
        /// <param name="data"></param>
        /// <param name="idProdutor"></param>
        /// <returns></returns>
        public static List<MovimentoEstoque> MontaMovimentoEstoqueProdutor(int idProduto, int idFazenda, int idTipoOperacao, decimal quantidade, DateTime data, int idProdutor, bool ignorarQuantidade = false, bool contrato = false)
        {

            var operacao = Business.Cadastro.BUSTipoOperacao.GetByID(idTipoOperacao);
            if (operacao != null)
            {
                var lstRet = new List<MovimentoEstoque>();

                //estque fisico
                if (operacao.estoqueFisico == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.ESTOQUE_FISICO
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.estoqueFisico == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    //if (!ignorarQuantidade && !contrato)
                    if (!operacao.VSEstoqueFisico)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.ESTOQUE_FISICO, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {
                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE FÍSICO : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);
                            }
                        }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.ESTOQUE_FISICO
                    };

                    lstRet.Add(mov);
                }

                //PEDIDO DE COMPRA
                if (operacao.pedidoCompra == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.PEDIDO_COMPRA
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.pedidoCompra == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSPedidoCompra)
                        if (!contrato)
                        {
                            //se nao tiver pedido compra, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.PEDIDO_COMPRA, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {

                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE PEDIDO COMPRA : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);

                                //string fmt = "A quantidade do produto excede o limite disponivel : PEDIDO COMPRA";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }
                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.PEDIDO_COMPRA
                    };

                    lstRet.Add(mov);
                }

                //COMPRA ENTREGA FUTURA
                if (operacao.compraEntregaFuturo == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.COMPRA_ENTREGA_FUTURA
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.compraEntregaFuturo == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSCompraEntregaFutura)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.COMPRA_ENTREGA_FUTURA, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {

                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE COMPRA ENTREGA FUTURO : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);
                                //string fmt = "A quantidade do produto excede o limite disponivel : COMPRA ENTREGA FUTURA";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.COMPRA_ENTREGA_FUTURA
                    };

                    lstRet.Add(mov);
                }

                //VENDA FUTURA
                if (operacao.vendaFutura == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.VENDA_FUTURA
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.vendaFutura == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSVendaFutura)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.VENDA_FUTURA, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {
                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE VENDA FUTURA : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);
                                //string fmt = "A quantidade do produto excede o limite disponivel : VENDA FUTURA";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.VENDA_FUTURA
                    };

                    lstRet.Add(mov);
                }

                //TRADING
                if (operacao.trading == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.TRADING
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.trading == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSArmazemTrading)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.TRADING, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {
                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE TRADING : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);
                                //string fmt = "A quantidade do produto excede o limite disponivel : TRADING";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }


                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.TRADING
                    };

                    lstRet.Add(mov);
                }

                //DISPONIVEL
                if (operacao.disponivel == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.DISPONIVEL
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.disponivel == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    //if (!ignorarQuantidade || !operacao.VSDisponivel || !contrato)
                    if (!operacao.VSDisponivel)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.DISPONIVEL, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {
                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE DISPONÍVEL : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                //string fmt = "A quantidade do produto excede o limite disponivel : ESTOQUE FISICO";
                                throw new S3ValidacaoGenericaException(msg);

                                //string fmt = "A quantidade do produto excede o limite disponivel : DISPONIVEL";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.DISPONIVEL
                    };

                    lstRet.Add(mov);
                }

                //BALCAO
                if (operacao.balcao == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.BALCAO
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.balcao == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSBalcao)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.BALCAO, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {

                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE BALCÃO : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);

                                //string fmt = "A quantidade do produto excede o limite disponivel : BALCAO";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.BALCAO
                    };

                    lstRet.Add(mov);
                }

                //ARMAZENAMENTO TERCEIRO
                if (operacao.depositoTerceiro == Objects.Cadastro.OperacaoEstoque.adiciona)
                {
                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = quantidade,
                        operacao_move = operacaoEstoque.TERCEIRO
                    };

                    lstRet.Add(mov);
                }
                else if (operacao.depositoTerceiro == Objects.Cadastro.OperacaoEstoque.retira)
                {
                    if (!operacao.VSDepTerceiro)
                        if (!contrato)
                        {
                            //se nao tiver estoque fisico, nao retira
                            var saldo = retornaSaldoPorOperacaoProdutor(idProduto, idFazenda, data, operacaoEstoque.TERCEIRO, idProdutor);

                            if (!ignorarQuantidade && quantidade > saldo)
                            //if (quantidade > saldo)
                            {
                                string msg = "SALDO INSUFICIENTE PARA A OPERAÇÃO." + Environment.NewLine + Environment.NewLine +
                                            "Quantidade solicitada : {0:n0} " + Environment.NewLine +
                                             "Quantidade em ESTOQUE TERCEIRO : {1:n0}";

                                msg = string.Format(msg, quantidade, saldo);

                                throw new S3ValidacaoGenericaException(msg);

                                //string fmt = "A quantidade do produto excede o limite disponivel : TERCEIRO";
                                //throw new S3ValidacaoGenericaException(fmt);
                            }
                        }

                    decimal qt = quantidade;

                    if (quantidade > 0)
                        qt = qt * -1;

                    var mov = new MovimentoEstoque()
                    {
                        idProduto = idProduto,
                        idFazenda = idFazenda,
                        data_move = data,
                        quantidade_move = qt,
                        operacao_move = operacaoEstoque.TERCEIRO
                    };

                    lstRet.Add(mov);
                }

                return lstRet;

            }
            else return null;

        }

        /// <summary>
        /// GERA O MOVIMENTO DE ESTOQUE BASEADO NA FAZENDA
        /// </summary>
        /// <param name="_movimento"></param>
        /// <param name="idFazenda"></param>
        /// <param name="idProduto"></param>
        /// <param name="quantidade"></param>
        /// <returns></returns>
        [Obsolete]
        public static MovimentoEstoque GeraMovimento(EMovimentoEstoque _movimento, int idFazenda, int idProduto, decimal quantidade)
        {
            //Movimentação de entrada
            Objects.Estoque.MovimentoEstoque mov = new Objects.Estoque.MovimentoEstoque();
            mov.data_move = DateTime.Now;
            mov.tipomov_move = (int)_movimento;
            mov.idFazenda = idFazenda;
            mov.idProduto = idProduto;
            mov.quantidade_move = quantidade;

            //if (_movimento == EMovimentoEstoque.CONTRATO_RECEBER)
            //    mov.idContratoReceber = idContratoReceber;

            if (ValidaMovimentoEstoque(mov))
            {
                return mov;
            }

            return null;
        }

        

        /// <summary>
        /// Retorna a posição do estoque para cada produto
        /// </summary>
        /// <returns></returns>
        public static List<Objects.Estoque.Views.PosicaoEstoque> GetPosicaoEstoqueRelatorio()
        {
            try
            {
                using (var ctx = new AriesContext())
                {
                    using (var bd = new AriesUnitOfWork(ctx))
                    {
                        var query = (from prod in ctx.produto
                                     join unid in ctx.unidadeMedida on prod.idUnidadeMedida equals unid.id_unidade into _unid
                                     from unid in _unid.DefaultIfEmpty()
                                     select new Objects.Estoque.Views.PosicaoEstoque()
                                     {
                                         idProduto = prod.id_prod,
                                         descricaoProduto = prod.descricao_prod,
                                         idUnidadePrimaria = prod.idUnidadeMedida,
                                         siglaUnidadePrimaria = unid.abreviatura_unidade
                                     }).ToList();

                        if (query != null)
                        {
                            List<Objects.Estoque.Views.PosicaoEstoque> lstRet = new List<Objects.Estoque.Views.PosicaoEstoque>();

                            var fazendas = Business.Cadastro.BUSFazenda.GetLista();


                            foreach (var prod in query)
                            {
                                //para cada produto, obter os dados

                                var custoMedio = Business.Cadastro.BUSProduto.GetValorCustoMedio(prod.idProduto);

                                var saldos = Business.Estoque.BUSMovimentoEstoque.GetSaldoProdutoEstoque(prod.idProduto);

                                if (saldos != null)
                                {
                                    foreach (var sl in saldos)
                                    {
                                        var pos = new Objects.Estoque.Views.PosicaoEstoque()
                                        {
                                            custoMedio = custoMedio,
                                            descricaoProduto = prod.descricaoProduto,
                                            idFazenda = sl.Item1,
                                            idProduto = prod.idProduto,
                                            idUnidadePrimaria = prod.idUnidadePrimaria,
                                            siglaUnidadePrimaria = prod.siglaUnidadePrimaria,
                                            quantidade = sl.Item2,
                                            totalProduto = custoMedio * sl.Item2
                                        };


                                        //descrição da fazenda
                                        var fz = fazendas.Where(q => q.id_fazenda == sl.Item1).FirstOrDefault();
                                        if (fz != null)
                                        {
                                            pos.descricaoFazenda = fz.descricao_fazenda;
                                        }

                                        lstRet.Add(pos);
                                    }
                                }




                                //prod.quantidade = saldo;
                                //prod.custoMedio = custoMedio;
                            }

                            return lstRet;
                        }

                        return null;
                    }
                }


            }
            catch (Exception ex)
            {
                return null;
            }
        }


        public static List<Objects.Estoque.Views.KardexProduto> GetKardexProdutos(DateTime _dtInicio, DateTime _dtFim)
        {
            try
            {
                using (var ctx = new AriesContext())
                {
                    using (var bd = new AriesUnitOfWork(ctx))
                    {
                        //Obter todas as movimentações do periodo
                        // Somente ESTOQUE FÍSICO
                        //var movimentos = bd.movimentoEstoque.Consulta(q => q.tipomov_move == 1).ToList().Where(x => x.data_move.Date >= _dtInicio.Date && x.data_move.Date <= _dtFim.Date).OrderBy(q => q.data_move).ToList();

                        var movimentos = bd.movimentoEstoque.Consulta(q => q.operacao_move == operacaoEstoque.DISPONIVEL).ToList().Where(x => x.data_move.Date >= _dtInicio.Date && x.data_move.Date <= _dtFim.Date).OrderBy(q => q.data_move).ToList();

                        //RETORNAR OS DADOS DE TODOS OS MOVIMENTOS
                        //var movimentos = bd.movimentoEstoque.Consulta(x => x.data_move.Date >= _dtInicio.Date && x.data_move.Date <= _dtFim.Date).ToList().OrderBy(q => q.data_move).ToList();

                        var produtos = bd.produto.ListarTodos();
                        var fazendas = bd.fazenda.ListarTodos();
                        var parceiros = bd.pessoa.ListarTodos();
                        var configuracoes = bd.configuradorCiclo.ListarTodos();
                        var talhoes = bd.talhao.ListarTodos();
                        var unidades = bd.unidadeMedida.ListarTodos();

                        List<controleSaldoKardex> controleSaldo = new List<controleSaldoKardex>();

                        if (movimentos != null)
                        {//Se tiver movimento, gerar o relatorio

                            var lstRet = new List<Objects.Estoque.Views.KardexProduto>();

                            var movByEstoque = movimentos.DistinctBy(q => q.idFazenda).ToList();
                            //Obter o saldo anterior para cada estoque existente nas movimentações

                            if (movByEstoque != null)
                            {
                                var distintos = movimentos.DistinctBy(q => q.idProduto).ToList();

                                foreach (var est in movByEstoque)
                                {
                                    if (distintos != null)
                                    {
                                        foreach (var dst in distintos)
                                        {
                                            var produto = produtos.Where(q => q.id_prod == dst.idProduto).FirstOrDefault();

                                            //Para cada produto, obter o saldo anterior
                                            var saldoAnterior = GetSaldoProdutoEstoque(dst.idProduto, est.idFazenda, _dtInicio.AddDays(-1));
                                            var infoSaldo = new Objects.Estoque.Views.KardexProduto();
                                            var infoFazenda = fazendas.Where(q => q.id_fazenda == est.idFazenda).FirstOrDefault();

                                            if (produto != null)
                                            {
                                                var infoUnidade = unidades.Where(q => q.id_unidade == produto.idUnidadeMedida).FirstOrDefault();
                                                if (infoUnidade != null)
                                                {
                                                    infoSaldo.siglaUnidadeMedida = infoUnidade.abreviatura_unidade;
                                                }

                                                infoSaldo.idProduto = produto.id_prod;
                                                infoSaldo.descricaoProduto = produto.descricao_prod;
                                                infoSaldo.idUnidadeMedida = produto.idUnidadeMedida;
                                                infoSaldo.idFazenda = est.idFazenda;

                                                if (saldoAnterior >= 0)
                                                    infoSaldo.entrada = saldoAnterior;
                                                else
                                                    infoSaldo.saida = saldoAnterior;

                                                infoSaldo.saldo = saldoAnterior;
                                                infoSaldo.data = _dtInicio.AddDays(-1);
                                                infoSaldo.documento = "Saldo anterior";
                                                if (infoFazenda != null)
                                                    infoSaldo.descricaoFazenda = infoFazenda.descricao_fazenda;

                                                //Controle do saldo
                                                controleSaldo.Add(new controleSaldoKardex() { idFazenda = infoFazenda.id_fazenda, idProduto = produto.id_prod, saldo = saldoAnterior });

                                                lstRet.Add(infoSaldo);
                                            }

                                        }
                                    }
                                }
                            }

                            //Montar as informações por movimento
                            foreach (var mov in movimentos)
                            {
                                var produto = produtos.Where(q => q.id_prod == mov.idProduto).FirstOrDefault();
                                var info = new Objects.Estoque.Views.KardexProduto();
                                var infoFazenda = fazendas.Where(q => q.id_fazenda == mov.idFazenda).FirstOrDefault();

                                info.idProduto = produto.id_prod;
                                info.descricaoProduto = produto.descricao_prod;
                                info.idUnidadeMedida = produto.idUnidadeMedida;
                                info.idFazenda = mov.idFazenda;
                                info.idGrupo = produto.idGrupo;
                                info.idSubgrupo = produto.idSubGrupo;

                                var infoUnidade = unidades.Where(q => q.id_unidade == produto.idUnidadeMedida).FirstOrDefault();
                                if (infoUnidade != null)
                                {
                                    info.siglaUnidadeMedida = infoUnidade.abreviatura_unidade;
                                }

                                if (infoFazenda != null)
                                    info.descricaoFazenda = infoFazenda.descricao_fazenda;

                                info.data = mov.data_move;





                                if (mov.quantidade_move < 0) //Saida
                                {

                                    var controle = controleSaldo.Where(q => q.idFazenda == mov.idFazenda && q.idProduto == mov.idProduto).FirstOrDefault();
                                    if (controle != null)
                                    {
                                        controle.saldo -= (mov.quantidade_move * -1);
                                        info.saldo = controle.saldo;
                                    }

                                    info.saida = mov.quantidade_move;
                                    if (mov.idRomaneio != null)
                                    {//buscar informações de romaneio
                                        info.documento = "Romaneio";

                                        var romaneio = bd.romaneio.Consulta(q => q.id_romaneio == (int)mov.idRomaneio).FirstOrDefault();
                                        if (romaneio != null)
                                        {
                                            info.codigo = romaneio.id_romaneio.ToString().PadLeft(10, '0');
                                            info.numero = romaneio.ticket_romaneio.PadLeft(10, '0');

                                            var pRomaneio = parceiros.Where(q => q.id_pessoa == romaneio.idProdutor).FirstOrDefault();
                                            if (pRomaneio != null)
                                            {
                                                info.parceiro = pRomaneio.nomerazao_pessoa;
                                            }

                                            //config romaneio
                                            var cfg = configuracoes.Where(q => q.id_cfg == romaneio.idConfigurador).FirstOrDefault();
                                            if (cfg != null)
                                            {
                                                var tl = talhoes.Where(q => q.id_talhao == cfg.idTalhao).FirstOrDefault();
                                                if (tl != null)
                                                {
                                                    info.descricaoTalhao = tl.descricao_talhao;
                                                }
                                            }
                                        }

                                    }
                                    else if (mov.idEmprestimoItem != null)
                                    {//Buscar infomações do emprestimo
                                        info.documento = "Empréstimo";
                                        var emprestimo = bd.emprestimo.Consulta(q => q.id_emp == (int)mov.idEmprestimoItem).FirstOrDefault();
                                        if (emprestimo != null)
                                        {
                                            info.codigo = emprestimo.id_emp.ToString().PadLeft(10, '0');
                                            var parceiro = parceiros.Where(q => q.id_pessoa == emprestimo.idParceiro).FirstOrDefault();
                                            if (parceiro != null)
                                            {
                                                info.parceiro = parceiro.nomerazao_pessoa;
                                            }
                                        }
                                    }
                                    else if (mov.idAbastecimento != null)
                                    {//Buscar informações do abastecimento
                                        info.documento = "Abastecimento";

                                        var abs = bd.abastecimento.Consulta(q => q.id_abst == (int)mov.idAbastecimento).FirstOrDefault();
                                        if (abs != null)
                                        {
                                            info.codigo = abs.id_abst.ToString().PadLeft(10, '0');
                                            var operador = parceiros.Where(q => q.id_pessoa == (int)mov.idAbastecimento).FirstOrDefault();
                                            if (operador != null)
                                            {
                                                info.parceiro = operador.nomerazao_pessoa;
                                            }
                                        }
                                    }
                                    else if (mov.idApontamentoProduto != null)
                                    {//Buscar informações do apontamento de produto
                                        info.documento = "Apontamento";

                                        var apt = bd.apontamentoProduto.Consulta(q => q.id_aptprod == (int)mov.idApontamentoProduto).FirstOrDefault();
                                        if (apt != null)
                                        {
                                            var aptPai = bd.apontamento.Consulta(q => q.id_apt == apt.idApontamentoAtividade).FirstOrDefault();

                                            if (aptPai != null)
                                            {
                                                info.codigo = aptPai.id_apt.ToString().PadLeft(10, '0');

                                                var cfg = configuracoes.Where(q => q.id_cfg == aptPai.idConfiguracao).FirstOrDefault();
                                                if (cfg != null)
                                                {
                                                    var talhao = talhoes.Where(q => q.id_talhao == cfg.idTalhao).FirstOrDefault();
                                                    if (talhao != null)
                                                    {
                                                        info.descricaoTalhao = talhao.descricao_talhao;
                                                    }
                                                }
                                            }
                                        }

                                    }
                                    else if (mov.idApontamentoMaquina != null)
                                    {//Buscar informações do apontamento de maquina
                                        info.documento = "Apt. Máquina";

                                        var aptmaq = bd.manutencaoMaquinaProduto.Consulta(q => q.id_mntprod == (int)mov.idApontamentoMaquina).FirstOrDefault();
                                        if (aptmaq != null)
                                        {
                                            var manut = bd.manutencaoMaquina.Consulta(q => q.id_mntmaq == aptmaq.idManutencao).FirstOrDefault();
                                            if (manut != null)
                                            {
                                                info.codigo = manut.id_mntmaq.ToString().PadLeft(10, '0');
                                            }


                                        }
                                    }
                                    else if (mov.idAcertoItem != null)
                                    {
                                        info.documento = "Acerto Estoque";

                                        var acerto = bd.acertoEstoque.Consulta(q => q.id_acerto == (int)mov.idAcertoItem).FirstOrDefault();
                                        if (acerto != null)
                                        {
                                            info.codigo = acerto.id_acerto.ToString().PadLeft(10, '0');
                                        }
                                    }
                                    else
                                    {
                                        info.documento = "Movimento";
                                    }

                                }
                                else
                                { //Entrada
                                    info.entrada = mov.quantidade_move;

                                    var controle = controleSaldo.Where(q => q.idFazenda == mov.idFazenda && q.idProduto == mov.idProduto).FirstOrDefault();
                                    if (controle != null)
                                    {
                                        controle.saldo += mov.quantidade_move;
                                        info.saldo = controle.saldo;
                                    }

                                    if (mov.idRomaneio != null)
                                    {
                                        info.documento = "Romaneio";


                                        var romaneio = bd.romaneio.Consulta(q => q.id_romaneio == (int)mov.idRomaneio).FirstOrDefault();
                                        if (romaneio != null)
                                        {
                                            info.codigo = romaneio.id_romaneio.ToString().PadLeft(10, '0');
                                            info.numero = romaneio.ticket_romaneio.PadLeft(10, '0');

                                            var pRomaneio = parceiros.Where(q => q.id_pessoa == romaneio.idProdutor).FirstOrDefault();
                                            if (pRomaneio != null)
                                            {
                                                info.parceiro = pRomaneio.nomerazao_pessoa;
                                            }

                                            //config romaneio
                                            var cfg = configuracoes.Where(q => q.id_cfg == romaneio.idConfigurador).FirstOrDefault();
                                            if (cfg != null)
                                            {
                                                var tl = talhoes.Where(q => q.id_talhao == cfg.idTalhao).FirstOrDefault();
                                                if (tl != null)
                                                {
                                                    info.descricaoTalhao = tl.descricao_talhao;
                                                }
                                            }
                                        }


                                    }
                                    else if (mov.idNotaEntradaItem != null)
                                    {
                                        info.documento = "Nota Entrada";

                                        var nota = bd.notaEntradaItem.Consulta(q => q.id_nei == (int)mov.idNotaEntradaItem).FirstOrDefault();
                                        if (nota != null)
                                        {
                                            var nPai = bd.notaEntrada.Consulta(q => q.id_ne == nota.idNotaEntrada).FirstOrDefault();
                                            if (nPai != null)
                                            {
                                                info.codigo = nPai.id_ne.ToString().PadLeft(10, '0');
                                                info.numero = nPai.numero_ne.ToString().PadLeft(10, '0');

                                                var parceiro = parceiros.Where(q => q.id_pessoa == nPai.idFornecedor).FirstOrDefault();
                                                if (parceiro != null)
                                                {
                                                    info.parceiro = parceiro.nomerazao_pessoa;
                                                }
                                            }


                                        }
                                    }
                                    else if (mov.idEmprestimoItem != null)
                                    {
                                        info.documento = "Empréstimo";

                                        var emprestimo = bd.emprestimo.Consulta(q => q.id_emp == (int)mov.idEmprestimoItem).FirstOrDefault();
                                        if (emprestimo != null)
                                        {
                                            info.codigo = emprestimo.id_emp.ToString().PadLeft(10, '0');
                                            var parceiro = parceiros.Where(q => q.id_pessoa == emprestimo.idParceiro).FirstOrDefault();
                                            if (parceiro != null)
                                            {
                                                info.parceiro = parceiro.nomerazao_pessoa;
                                            }
                                        }
                                    }
                                    else if (mov.idAcertoItem != null)
                                    {
                                        info.documento = "Acerto Estoque";
                                        var acerto = bd.acertoEstoque.Consulta(q => q.id_acerto == (int)mov.idAcertoItem).FirstOrDefault();
                                        if (acerto != null)
                                        {
                                            info.codigo = acerto.id_acerto.ToString().PadLeft(10, '0');
                                        }
                                    }
                                    else
                                    {
                                        info.documento = "Movimento";
                                    }
                                }
                                lstRet.Add(info);
                            }


                            return lstRet;

                        }

                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }




        public static List<Objects.Estoque.Views.MovimentoEstoqueAgrupado> GetPosicaoEstoqueProduto(int idProduto, int idFazenda, DateTime _data)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda)).ToList().Where(q => q.data_move.Date <= _data).ToList();
                    var dadosProd = Business.Cadastro.BUSProduto.GetInformacaoProdutoPedidoU(bd, idProduto);

                    if (dadosProd.idUnidadeSecundaria != null)
                    {
                        //var dUnid = Business.Cadastro.BUSUnidadeMedida.GetByID((int)dadosProd.idUnidadeSecundaria);
                        var dUnid = bd.unidadeMedida.Consulta(q => q.id_unidade == (int)dadosProd.idUnidadeSecundaria).FirstOrDefault();

                        if (dUnid != null)
                            dadosProd.unidadeSecundaria = dUnid.abreviatura_unidade;
                    }

                    var ret = (from row in dados
                               group row by new { row.tipomov_move } into g
                               select new Objects.Estoque.Views.MovimentoEstoqueAgrupado()
                               {
                                   idProduto = idProduto,
                                   saldo = g.Sum(s => s.quantidade_move),
                                   tipoMovimentacao = g.Key.tipomov_move,
                                   unidadePrimaria = dadosProd.unidademedida,
                                   unidadeSecundaria = dadosProd.unidadeSecundaria,
                                   fator = dadosProd.conversao,
                                   valorconversao = dadosProd.quantidadeconversao,
                                   prateleira = dadosProd.prateleira,
                                   coluna = dadosProd.coluna
                               }).ToList();

                    return ret;
                }
            }

        }


        public static List<Objects.Estoque.Views.ViewPosicaoEstoque> GetPosicaoEstoqueExtrato(DateTime _data)
        {

            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    //Obter todas as movimentações do periodo
                    // Somente ESTOQUE FÍSICO
                    //var movimentos = bd.movimentoEstoque.Consulta(q => q.tipomov_move == 1).ToList().Where(x => x.data_move.Date >= _dtInicio.Date && x.data_move.Date <= _dtFim.Date).OrderBy(q => q.data_move).ToList();

                    var movimentos = bd.movimentoEstoque.Consulta(x => x.data_move <= _data).ToList().OrderBy(q => q.data_move).ToList();

                    //RETORNAR OS DADOS DE TODOS OS MOVIMENTOS
                    //var movimentos = bd.movimentoEstoque.Consulta(x => x.data_move.Date >= _dtInicio.Date && x.data_move.Date <= _dtFim.Date).ToList().OrderBy(q => q.data_move).ToList();

                    var produtos = bd.produto.ListarTodos();
                    var fazendas = bd.fazenda.ListarTodos();

                    //var parceiros = bd.pessoa.ListarTodos();
                    //var configuracoes = bd.configuradorCiclo.ListarTodos();
                    //var talhoes = bd.talhao.ListarTodos();


                    var unidades = bd.unidadeMedida.ListarTodos();

                    List<controleSaldoKardex> controleSaldo = new List<controleSaldoKardex>();

                    if (movimentos != null)
                    {//Se tiver movimento, gerar o relatorio

                        var lstRet = new List<Objects.Estoque.Views.ViewPosicaoEstoque>();

                        var movByEstoque = movimentos.DistinctBy(q => q.idFazenda).ToList();
                        //Obter o saldo anterior para cada estoque existente nas movimentações

                        //if (movByEstoque != null)
                        //{
                        //    var distintos = movimentos.DistinctBy(q => q.idProduto).ToList();

                        //    foreach (var est in movByEstoque)
                        //    {
                        //        if (distintos != null)
                        //        {
                        //            foreach (var dst in distintos)
                        //            {
                        //                var produto = produtos.FirstOrDefault(q => q.id_prod == dst.idProduto);

                        //                //Para cada produto, obter o saldo anterior
                        //                var saldoAnterior = GetSaldoProdutoEstoque(dst.idProduto, est.idFazenda, _data.AddDays(-1));

                        //                var infoSaldo = new Objects.Estoque.Views.ViewPosicaoEstoque();
                        //                var infoFazenda = fazendas.FirstOrDefault(q => q.id_fazenda == est.idFazenda);

                        //                if (produto != null)
                        //                {
                        //                    var infoUnidade = unidades.FirstOrDefault(q => q.id_unidade == produto.idUnidadeMedida);

                        //                    if (infoUnidade != null)
                        //                    {
                        //                        infoSaldo.siglaUnidadeMedida = infoUnidade.abreviatura_unidade;
                        //                    }

                        //                    infoSaldo.produto = produto.descricao_prod;

                        //                    infoSaldo.quantidade = saldoAnterior;

                        //                    //infoSaldo.saldo = saldoAnterior;
                        //                    infoSaldo.movimento = _data.AddDays(-1);
                        //                    infoSaldo.operacao = "SALDO ANTERIOR";


                        //                    //Controle do saldo
                        //                    controleSaldo.Add(new controleSaldoKardex() { idFazenda = infoFazenda.id_fazenda, idProduto = produto.id_prod, saldo = saldoAnterior });

                        //                    lstRet.Add(infoSaldo);
                        //                }

                        //            }
                        //        }
                        //    }
                        //}

                        //Montar as informações por movimento
                        foreach (var mov in movimentos)
                        {
                            var produto = produtos.FirstOrDefault(q => q.id_prod == mov.idProduto);
                            var info = new Objects.Estoque.Views.ViewPosicaoEstoque();
                            var infoFazenda = fazendas.FirstOrDefault(q => q.id_fazenda == mov.idFazenda);

                            info.produto = produto.descricao_prod;


                            var infoUnidade = unidades.FirstOrDefault(q => q.id_unidade == produto.idUnidadeMedida);
                            if (infoUnidade != null)
                            {
                                info.siglaUnidadeMedida = infoUnidade.abreviatura_unidade;
                            }



                            info.movimento = mov.data_move;
                            info.estoque = ((Objects.Estoque.operacaoEstoque)mov.operacao_move).ToString();





                            if (mov.quantidade_move < 0) //Saida
                            {
                                info.operacao = "S";

                                info.quantidade = mov.quantidade_move;


                                if (mov.idRomaneio != null)
                                {//buscar informações de romaneio
                                 //var romaneio = bd.romaneio.Consulta(q => q.id_romaneio == (int)mov.idRomaneio).FirstOrDefault();
                                 //if (romaneio != null)
                                 //{
                                    info.codigo = mov.idRomaneio.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "ROMANEIO", info.codigo);
                                    //}

                                }
                                else if (mov.idEmprestimoItem != null)
                                {//Buscar infomações do emprestimo

                                    //var emprestimo = bd.emprestimo.Consulta(q => q.id_emp == (int)mov.idEmprestimoItem).FirstOrDefault();
                                    //if (emprestimo != null)
                                    //{
                                    info.codigo = mov.idEmprestimoItem.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "EMPRÉSTIMO", info.codigo);
                                    //}
                                }
                                else if (mov.idAbastecimento != null)
                                {//Buscar informações do abastecimento

                                    //var abs = bd.abastecimento.Consulta(q => q.id_abst == (int)mov.idAbastecimento).FirstOrDefault();
                                    //if (abs != null)
                                    //{
                                    info.codigo = mov.idAbastecimento.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "ABASTECIMENTO", info.codigo);

                                    //}
                                }
                                else if (mov.idApontamentoProduto != null)
                                {//Buscar informações do apontamento de produto
                                 //var apt = bd.apontamentoProduto.Consulta(q => q.id_aptprod == (int)mov.idApontamentoProduto).FirstOrDefault();
                                 //if (apt != null)
                                 //{

                                    info.codigo = mov.idApontamentoProduto.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "APT_PRODUTO", info.codigo);


                                    //}

                                }
                                else if (mov.idApontamentoMaquina != null)
                                {//Buscar informações do apontamento de maquina

                                    //var aptmaq = bd.manutencaoMaquinaProduto.Consulta(q => q.id_mntprod == (int)mov.idApontamentoMaquina).FirstOrDefault();
                                    //if (aptmaq != null)
                                    //{

                                    info.codigo = mov.idApontamentoMaquina.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "APT_MAQ", info.codigo);
                                    //}
                                }
                                else if (mov.idAcertoItem != null)
                                {

                                    //var acerto = bd.acertoEstoque.Consulta(q => q.id_acerto == (int)mov.idAcertoItem).FirstOrDefault();
                                    //if (acerto != null)
                                    //{
                                    info.codigo = mov.idAcertoItem.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "ACERTO_ESTOQUE", info.codigo);


                                    //}
                                }
                                else
                                {
                                    info.codigo = mov.id_move.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "MOV", info.codigo);
                                }

                            }
                            else
                            { //Entrada

                                info.operacao = "E";

                                info.quantidade = mov.quantidade_move;



                                if (mov.idRomaneio != null)
                                {

                                    //var romaneio = bd.romaneio.Consulta(q => q.id_romaneio == (int)mov.idRomaneio).FirstOrDefault();
                                    //if (romaneio != null)
                                    //{
                                    info.codigo = mov.idRomaneio.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "ROMANEIO", info.codigo);
                                    //}


                                }
                                else if (mov.idNotaEntradaItem != null)
                                {

                                    var nota = bd.notaEntradaItem.Consulta(q => q.id_nei == (int)mov.idNotaEntradaItem).FirstOrDefault();
                                    if (nota != null)
                                    {
                                        var nPai = bd.notaEntrada.Consulta(q => q.id_ne == nota.idNotaEntrada).FirstOrDefault();
                                        if (nPai != null)
                                        {
                                            info.codigo = nPai.numero_ne.ToString().PadLeft(10, '0');
                                            info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "NOTA_ENTRADA", info.codigo);
                                        }
                                    }
                                }
                                else if (mov.idEmprestimoItem != null)
                                {

                                    //var emprestimo = bd.emprestimo.Consulta(q => q.id_emp == (int)mov.idEmprestimoItem).FirstOrDefault();
                                    //if (emprestimo != null)
                                    //{
                                    info.codigo = mov.idEmprestimoItem.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "EMPRÉSTIMO", info.codigo);
                                    //}
                                }
                                else if (mov.idAcertoItem != null)
                                {

                                    //var acerto = bd.acertoEstoque.Consulta(q => q.id_acerto == (int)mov.idAcertoItem).FirstOrDefault();
                                    //if (acerto != null)
                                    //{
                                    info.codigo = mov.idAcertoItem.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "ACERTO_ESTOQUE", info.codigo);
                                    //}
                                }
                                else
                                {
                                    info.codigo = mov.id_move.ToString().PadLeft(10, '0');
                                    info.referencia = string.Format("{0:dd/MM/yyyy} - [{1}:{2}]", mov.data_move, "MOVIMENTO", info.codigo);


                                }
                            }
                            lstRet.Add(info);
                        }

                        return lstRet;

                    }
                }
                return null;
            }


        }


        /// <summary>
        /// VERIFICA O SALDO DISPONIVEL DO PRODUTO E VALIDA A QUANTIDADE DISPONIVEL
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="quantidade"></param>
        /// <returns></returns>
        public static bool ValidaSaldoDisponivel(int idProduto, int idFazenda, decimal quantidade)
        {
            var saldo = GetSaldoProdutoEntregue(idProduto, idFazenda);
            return saldo < quantidade;
        }

        public static bool ValidaSaldoDisponivelAtualizacao(int idProduto, int idFazenda, decimal quantidade, decimal quantidadeAtualizada)
        {
            var saldo = GetSaldoProdutoEntregue(idProduto, idFazenda);

            //A QUANTIDADE ANTERIOR, COMPOE O SALDO DO PRODUTO
            saldo += quantidadeAtualizada;
            return saldo >= quantidade;
        }

        /// <summary>
        /// ROTINA QUE GERA O MOVIMENTO DE ESTOQUE BASEADO NA FORMA DE UTILIZAÇÃO
        /// PODE SER VIA ESTOQUE DISPONIVEL OU ESTOQUE DE USO
        /// </summary>
        /// <param name="idFazenda"></param>
        /// <param name="idProduto"></param>
        /// <param name="data"></param>
        /// <param name="quantidade"></param>
        /// <returns></returns>
        public static List<MovimentoEstoque> GeraMovimentoEstoqueNovo(int idFazenda, int idProduto, DateTime data,
            decimal quantidade)
        {
            try
            {

                //SEMPRE SERA GERADO ESTOQUE FISICO + ESTOQUE DE USO OU DISPONIVEL
                var lstRetorno = new List<MovimentoEstoque>();

                Objects.Estoque.MovimentoEstoque movF = new Objects.Estoque.MovimentoEstoque();
                movF.idFazenda = idFazenda;
                movF.idProduto = idProduto;
                movF.tipomov_move = 1;
                movF.data_move = data;
                movF.quantidade_move = quantidade;
                movF.operacao_move = Objects.Estoque.operacaoEstoque.ESTOQUE_FISICO;

                lstRetorno.Add(movF);

                if (Business.Sistema.BUSConfiguracao.ValidaChaveLogica("PRODUTO.ESTOQUEINTERMEDIARIO"))
                {
                    Objects.Estoque.MovimentoEstoque movUso = new Objects.Estoque.MovimentoEstoque();
                    movUso.idFazenda = idFazenda;
                    movUso.idProduto = idProduto;
                    movUso.tipomov_move = 1;
                    movUso.data_move = data;
                    movUso.quantidade_move = quantidade;
                    movUso.operacao_move = Objects.Estoque.operacaoEstoque.DISPONIVEL_USO;

                    lstRetorno.Add(movUso);
                }
                else
                {
                    Objects.Estoque.MovimentoEstoque movD = new Objects.Estoque.MovimentoEstoque();
                    movD.idFazenda = idFazenda;
                    movD.idProduto = idProduto;
                    movD.tipomov_move = 1;
                    movD.data_move = data;
                    movD.quantidade_move = quantidade;
                    movD.operacao_move = Objects.Estoque.operacaoEstoque.DISPONIVEL;

                    lstRetorno.Add(movD);
                }


                return lstRetorno;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static decimal GetSaldoProdutoEstoque(int idProduto, int idFazenda)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    if (Business.Sistema.BUSConfiguracao.ValidaChaveLogica("ESTOQUE.UTILIZARESTOQUEUNIFICADO"))
                    {
                        //RETORNA O SALDO DISPONIVEL PARA O PRODUTO E FAZENDA INFORMADA
                        var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && q.operacao_move == operacaoEstoque.DISPONIVEL).ToList();

                        //var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.tipomov_move == 1).ToList();

                        var soma = dados.Sum(q => q.quantidade_move);
                        return soma;
                    }
                    else
                    {
                        //RETORNA O SALDO DISPONIVEL PARA O PRODUTO E FAZENDA INFORMADA
                        var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.operacao_move == operacaoEstoque.DISPONIVEL).ToList();

                        //var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.tipomov_move == 1).ToList();

                        var soma = dados.Sum(q => q.quantidade_move);
                        return soma;

                    }
                }
            }
        }

        /// <summary>
        /// VERIFICA PARA O PRODUTO INFORMADO SE EXISTE ESTOQUE DISPONIVEL E  SE CONFIGURADO PARA UTILIZACAO NEGATIVA
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="quantidade"></param>
        /// <returns></returns>
        public static SaldoProdutoRetorno ProdutoDisponivel(int idProduto, int idFazenda, decimal quantidade)
        {

            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {

                    //RETORNA SE PODE USAR ESTOQUE NEGATIVO
                    bool usarEstoqueNegativo =
                        Business.Sistema.BUSConfiguracao.ValidaChaveLogica("ESTOQUE.PERMITESALDONEGATIVO");


                    //RETORNA O SALDO DISPONIVEL PARA O PRODUTO E FAZENDA INFORMADA
                    var dados = bd.movimentoEstoque
                        .Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) &&
                                       q.operacao_move == operacaoEstoque.DISPONIVEL)
                        .ToList();

                    //var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.tipomov_move == 1).ToList();

                    var soma = dados.Sum(q => q.quantidade_move);
                    bool produtoDisponivel = (!(soma <= 0) && quantidade <= soma);

                    if (usarEstoqueNegativo)
                        produtoDisponivel = true;

                    SaldoProdutoRetorno saldoProduto = new SaldoProdutoRetorno()
                    {
                        saldo = soma,
                        disponivelEstoque = produtoDisponivel
                    };


                    return saldoProduto;

                }
            }

        }


        /// <summary>
        /// RETORNA SE ESTA DISPONIVEL E QUANTIDADE DO PRODUTO EM ESTOQUE
        /// 
        /// A FUNÇÃO DEVE VALIDAR SE UTILIZARA O ESTOQUE DISPONIVEL OU O ESTOQUE INTERMEDIARIO
        /// 
        /// O ESTOQUE INTERMEDIARIO SOMENTE É VALIDADO NO ESTOQUE DISPONIVEL
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <returns></returns>
        public static SaldoProdutoRetorno ProdutoDisponivelUso(int idProduto, int idFazenda, decimal quantidade)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {

                    //RETORNA SE PODE USAR ESTOQUE NEGATIVO
                    bool usarEstoqueNegativo =
                        Business.Sistema.BUSConfiguracao.ValidaChaveLogica("ESTOQUE.PERMITESALDONEGATIVO");

                    if (Business.Sistema.BUSConfiguracao.ValidaChaveLogica("PRODUTO.ESTOQUEINTERMEDIARIO"))
                    {
                        //VALIDAR A QUANTIDADE USANDO O ESTOQUE INTERMEDIARIO

                        List<MovimentoEstoque> dados = null;

                        if (Business.Sistema.BUSConfiguracao.ValidaChaveLogica("ESTOQUE.UTILIZARESTOQUEUNIFICADO"))
                        {
                            //UTILIZACAO DO ESTOQUE UNIFICADO, VALIDO PARA TODA A FAZENDA

                            dados = bd.movimentoEstoque
                            .Consulta(q => (q.idProduto == idProduto) &&
                                           q.operacao_move == operacaoEstoque.DISPONIVEL_USO)
                            .ToList();

                        }
                        else
                        {
                            //NAO UTILIZAR ESTOQUE UNIFICADO, E OBTER O SALDO POR FAZENDA

                            dados = bd.movimentoEstoque
                            .Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) &&
                                           q.operacao_move == operacaoEstoque.DISPONIVEL_USO)
                            .ToList();
                        }



                        //RETORNA O SALDO DISPONIVEL PARA O PRODUTO E FAZENDA INFORMADA


                        var soma = dados.Sum(q => q.quantidade_move);

                        //VALIDAR SE USAR ESTOQUE NEGATIVO SOMENTE PARA O INTERMEDIARIO OU TAMBEM PARA O ESTOQUE DE USO


                        bool produtoDisponivel = (quantidade >= soma);

                        SaldoProdutoRetorno saldoProduto = new SaldoProdutoRetorno()
                        {
                            saldo = soma,
                            disponivelEstoque = produtoDisponivel,
                            estoqueIntermediario = true
                        };


                        return saldoProduto;

                    }
                    else
                    {

                        List<MovimentoEstoque> dados = null;

                        if (Business.Sistema.BUSConfiguracao.ValidaChaveLogica("ESTOQUE.UTILIZARESTOQUEUNIFICADO"))
                        {
                            //RETORNA O SALDO DISPONIVEL PARA O PRODUTO E FAZENDA UNIFICADA
                            dados = bd.movimentoEstoque
                            .Consulta(q => (q.idProduto == idProduto) &&
                                           q.operacao_move == operacaoEstoque.DISPONIVEL)
                            .ToList();
                        }
                        else
                        {
                            //RETORNA O SALDO DISPONIVEL PARA O PRODUTO E FAZENDA
                            dados = bd.movimentoEstoque
                            .Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) &&
                                           q.operacao_move == operacaoEstoque.DISPONIVEL)
                            .ToList();
                        }




                        //var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.tipomov_move == 1).ToList();

                        var soma = dados.Sum(q => q.quantidade_move);
                        bool produtoDisponivel = (!(soma <= 0) && quantidade <= soma);

                        if (usarEstoqueNegativo)
                            produtoDisponivel = true;

                        SaldoProdutoRetorno saldoProduto = new SaldoProdutoRetorno()
                        {
                            saldo = soma,
                            disponivelEstoque = produtoDisponivel
                        };


                        return saldoProduto;
                    }
                }
            }
        }

        /// <summary>
        /// RETORNA O SALDO FISICO DO PRODUTO
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="_dataReferencia"></param>
        /// <returns></returns>
        public static decimal GetSaldoProdutoEstoque(int idProduto, int idFazenda, DateTime _dataReferencia)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {

                    var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.operacao_move == operacaoEstoque.ESTOQUE_FISICO).ToList().Where(x => (x.data_move.Date < _dataReferencia.Date)).ToList();
                    if (dados != null)
                    {
                        var soma = dados.Sum(q => q.quantidade_move);
                        return soma;
                    }
                    else
                        return 0;
                }
            }
        }

        /// <summary>
        /// RETORNA O SALDO DE ESTOQUE DE ACORDO COM A OPERACAO SELECIONADA
        /// POR PADRAO SERA RETORNADO O ESTOQUE DISPONIVEL
        /// </summary>
        /// <param name="idProduto"></param>
        /// <param name="idFazenda"></param>
        /// <param name="_dataReferencia"></param>
        /// <param name="codigoOperacao"></param>
        /// <returns></returns>
        public static decimal GetSaldoProdutoEstoqueDisponivel(int idProduto, int idFazenda, DateTime _dataReferencia, int codigoOperacao = 7)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && (q.idFazenda == idFazenda) && q.operacao_move == (operacaoEstoque)codigoOperacao).ToList().Where(x => (x.data_move.Date <= _dataReferencia.Date)).ToList();
                    if (dados != null)
                    {
                        var soma = dados.Sum(q => q.quantidade_move);
                        return soma;
                    }
                    else
                        return 0;
                }
            }
        }

        public static List<Tuple<int, decimal>> GetSaldoProdutoEstoque(int idProduto)
        {
            using (var banco = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(banco))
                {
                    var dados = bd.movimentoEstoque.Consulta(q => (q.idProduto == idProduto) && q.tipomov_move == 1).ToList();

                    var estoque = from p in dados
                                  group p by p.idFazenda into g
                                  select new
                                  {
                                      _fazenda = g.Key,
                                      _quantidade = g.Sum(x => x.quantidade_move)
                                  };

                    if (estoque != null)
                    {
                        List<Tuple<int, decimal>> lstRet = new List<Tuple<int, decimal>>();

                        foreach (var est in estoque)
                        {
                            lstRet.Add(new Tuple<int, decimal>(est._fazenda, est._quantidade));
                        }

                        return lstRet;
                    }

                    return null;

                    //var soma = dados.Sum(q => q.quantidade_move);
                    //return soma;
                }
            }

        }

      


        /// <summary>
        /// RELATORIO COM A POSIÇÃO DO ESTOQUE DISPONVEIL, SEPARADO POR DEPÓSITO
        /// </summary>
        /// <returns></returns>
        public static List<VWPosicaoEstoqueDisponivelPorEstoque> RelatorioEstoqueDisponivelPorDeposito(List<int> lstProduto = null, List<int> lstGrupo = null, bool pedidos = true, bool emprestimos = true)
        {
            using (var ctx = new Data.Context.AriesContext())
            {
                using (var bd = new Data.UnitOfWork.AriesUnitOfWork(ctx))
                {
                    var query = (from mov in ctx.movimentoEstoque
                                 join prod in ctx.produto on mov.idProduto equals prod.id_prod into _prod
                                 from prod in _prod.DefaultIfEmpty()
                                 join pativo in ctx.principioAtivo on prod.idPrincipioAtivo equals pativo.id_principio into _pativo
                                 from pativo in _pativo.DefaultIfEmpty()
                                 join grupo in ctx.grupo on prod.idGrupo equals grupo.id_grupo into _grupo
                                 from grupo in _grupo.DefaultIfEmpty()
                                 join faz in ctx.fazenda on mov.idFazenda equals faz.id_fazenda into _faz
                                 from faz in _faz.DefaultIfEmpty()
                                 join unid in ctx.unidadeMedida on prod.idUnidadeMedida equals unid.id_unidade into _unid
                                 from unid in _unid.DefaultIfEmpty()
                                 where (mov.operacao_move == operacaoEstoque.DISPONIVEL)
                                 orderby prod.descricao_prod
                                 select new VWPosicaoEstoqueDisponivelPorEstoque()
                                 {
                                     codigoMovimento = mov.id_move,
                                     dataMovimento = mov.data_move,
                                     produto = prod.descricao_prod,
                                     deposito = faz.descricao_fazenda,
                                     quantidade = mov.quantidade_move,
                                     grupo = grupo.descricao_grupo,
                                     idProduto = prod.id_prod,
                                     idGrupo = prod.idGrupo,
                                     principioAtivo = pativo.descricao_principio

                                 }).ToList();

                    var queryEmprestimos = (from mov in ctx.movimentoEstoque
                                            join prod in ctx.produto on mov.idProduto equals prod.id_prod into _prod
                                            from prod in _prod.DefaultIfEmpty()
                                            join pativo in ctx.principioAtivo on prod.idPrincipioAtivo equals pativo.id_principio into _pativo
                                            from pativo in _pativo.DefaultIfEmpty()
                                            join grupo in ctx.grupo on prod.idGrupo equals grupo.id_grupo into _grupo
                                            from grupo in _grupo.DefaultIfEmpty()
                                            join faz in ctx.fazenda on mov.idFazenda equals faz.id_fazenda into _faz
                                            from faz in _faz.DefaultIfEmpty()
                                            join unid in ctx.unidadeMedida on prod.idUnidadeMedida equals unid.id_unidade into _unid
                                            from unid in _unid.DefaultIfEmpty()
                                            where (mov.operacao_move == operacaoEstoque.DISPONIVEL && (mov.idEmprestimoItem != null || mov.idEmprestimoDevolucao != null))
                                            orderby prod.descricao_prod
                                            select new VWPosicaoEstoqueDisponivelPorEstoque()
                                            {
                                                codigoMovimento = mov.id_move,
                                                dataMovimento = mov.data_move,
                                                produto = prod.descricao_prod,
                                                deposito = "EMPRESTADO",
                                                quantidade = mov.quantidade_move < 0 ? mov.quantidade_move * -1 : mov.quantidade_move,
                                                grupo = grupo.descricao_grupo,
                                                idProduto = prod.id_prod,
                                                idGrupo = prod.idGrupo,
                                                principioAtivo = pativo.descricao_principio,
                                                emprestimo = mov.idEmprestimoItem.HasValue,
                                                devolucao = mov.idEmprestimoDevolucao.HasValue
                                            }).ToList();

                    var queryPedidos = (from mov in ctx.movimentoEstoque
                                        join prod in ctx.produto on mov.idProduto equals prod.id_prod into _prod
                                        from prod in _prod.DefaultIfEmpty()
                                        join pativo in ctx.principioAtivo on prod.idPrincipioAtivo equals pativo.id_principio into _pativo
                                        from pativo in _pativo.DefaultIfEmpty()
                                        join grupo in ctx.grupo on prod.idGrupo equals grupo.id_grupo into _grupo
                                        from grupo in _grupo.DefaultIfEmpty()
                                        join faz in ctx.fazenda on mov.idFazenda equals faz.id_fazenda into _faz
                                        from faz in _faz.DefaultIfEmpty()
                                        join unid in ctx.unidadeMedida on prod.idUnidadeMedida equals unid.id_unidade into _unid
                                        from unid in _unid.DefaultIfEmpty()
                                        where (mov.operacao_move == operacaoEstoque.PEDIDO_COMPRA && mov.idPedidoItem != null)
                                        orderby prod.descricao_prod
                                        select new VWPosicaoEstoqueDisponivelPorEstoque()
                                        {
                                            codigoMovimento = mov.id_move,
                                            dataMovimento = mov.data_move,
                                            produto = prod.descricao_prod,
                                            deposito = "PEDIDO",
                                            quantidade = mov.quantidade_move,
                                            grupo = grupo.descricao_grupo,
                                            idProduto = prod.id_prod,
                                            idGrupo = prod.idGrupo,
                                            principioAtivo = pativo.descricao_principio

                                        }).ToList();


                    if (lstProduto != null && lstGrupo != null) //CONSULTA COM OR
                    {
                        var resultado = query.Where(q => lstProduto.Contains(q.idProduto) ||
                                                         lstGrupo.Contains(q.idGrupo))
                            .ToList();

                        //TRABALHANDO COM DADOS DOS EMPRESTIMOS

                        if (queryEmprestimos?.Count > 0)
                        {
                            foreach (var item in queryEmprestimos)
                            {
                                if (item.devolucao)
                                    item.quantidade *= -1;
                            }
                        }

                        if (emprestimos)
                            resultado.AddRange(queryEmprestimos.Where(q => lstProduto.Contains(q.idProduto) ||
                                                                lstGrupo.Contains(q.idGrupo))
                                .ToList());
                        if (pedidos)
                            resultado.AddRange(queryPedidos.Where(q => lstProduto.Contains(q.idProduto) ||
                                                                           lstGrupo.Contains(q.idGrupo))
                                .ToList());


                        return resultado.OrderBy(q => q.produto).ToList();
                    }
                    else if (lstProduto != null)
                    {
                        var resultado = query.Where(q => lstProduto.Contains(q.idProduto))
                            .ToList();

                        if (emprestimos)
                            resultado.AddRange(queryEmprestimos.Where(q => lstProduto.Contains(q.idProduto))
                                .ToList());

                        if (pedidos)
                            resultado.AddRange(queryPedidos.Where(q => lstProduto.Contains(q.idProduto))
                                .ToList());

                        return resultado.OrderBy(q => q.produto).ToList();
                    }
                    else if (lstGrupo != null)
                    {
                        var resultado = query.Where(q => lstGrupo.Contains(q.idGrupo))
                            .ToList();

                        if (emprestimos)
                            resultado.AddRange(queryEmprestimos.Where(q => lstGrupo.Contains(q.idGrupo))
                                .ToList());

                        if (pedidos)
                            resultado.AddRange(queryPedidos.Where(q => lstGrupo.Contains(q.idGrupo))
                                .ToList());

                        return resultado.OrderBy(q => q.produto).ToList();
                    }
                    else return null;
                    //query.AddRange(queryEmprestimos);



                    //return query;
                }
            }
        }
    }

    public class controleSaldoKardex
    {
        public int idFazenda { get; set; }
        public int idProduto { get; set; }
        public decimal saldo { get; set; }

    }

    public class SaldoProdutoRetorno
    {
        public decimal saldo { get; set; }
        public bool disponivelEstoque { get; set; }
        public bool estoqueIntermediario { get; set; }
    }
}