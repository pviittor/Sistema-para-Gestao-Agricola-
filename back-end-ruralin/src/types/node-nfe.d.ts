declare module 'node-nfe' {
  export class NFe {
    constructor(xmlContent: string)
    nfeProc?: any
    NFe?: any
    infNFe?: any
    ide?: any
    emit?: any
    dest?: any
    det?: any[] | any
    total?: any
    transp?: any
    cobr?: any
    pag?: any
    infAdic?: any
  }

  export class Emitente {}
  export class Destinatario {}
  export class Transportador {}
  export class Endereco {}
  export class Item {}
  export class Icms {}
  export class Protocolo {}
  export class Impostos {}
  export class Volumes {}
  export class FormularioDeSeguranca {}
  export class Fatura {}
  export class Duplicata {}
  export class Pagamento {}
}
