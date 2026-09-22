/**
 * Converte um valor numérico em reais para sua representação por extenso em português brasileiro.
 *
 * Suporta valores de 0.01 a 999.999.999,99.
 *
 * Exemplos:
 *   1530.50 → "um mil quinhentos e trinta reais e cinquenta centavos"
 *   0.01    → "um centavo"
 *   1000000 → "um milhão de reais"
 */

const unidades = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco',
  'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'quatorze', 'quinze',
  'dezesseis', 'dezessete', 'dezoito', 'dezenove',
];

const dezenas = [
  '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
  'sessenta', 'setenta', 'oitenta', 'noventa',
];

const centenas = [
  '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
  'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
];

function converterGrupo(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const resto = n % 100;

  if (c > 0) {
    partes.push(centenas[c]);
  }

  if (resto > 0 && resto < 20) {
    partes.push(unidades[resto]);
  } else if (resto >= 20) {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (u === 0) {
      partes.push(dezenas[d]);
    } else {
      partes.push(`${dezenas[d]} e ${unidades[u]}`);
    }
  }

  return partes.join(' e ');
}

export function valorPorExtenso(valor: number): string {
  if (valor < 0) {
    throw new Error('Valor não pode ser negativo');
  }

  if (valor > 999999999.99) {
    throw new Error('Valor máximo suportado: 999.999.999,99');
  }

  // Arredondar para 2 casas decimais
  const valorArredondado = Math.round(valor * 100) / 100;
  const inteiro = Math.floor(valorArredondado);
  const centavos = Math.round((valorArredondado - inteiro) * 100);

  if (inteiro === 0 && centavos === 0) {
    return 'zero reais';
  }

  const partes: string[] = [];

  if (inteiro > 0) {
    const milhoes = Math.floor(inteiro / 1000000);
    const milhares = Math.floor((inteiro % 1000000) / 1000);
    const unidadesVal = inteiro % 1000;

    const grupos: string[] = [];

    if (milhoes > 0) {
      const textoMilhoes = converterGrupo(milhoes);
      if (milhoes === 1) {
        grupos.push(`${textoMilhoes} milhão`);
      } else {
        grupos.push(`${textoMilhoes} milhões`);
      }
    }

    if (milhares > 0) {
      if (milhares === 1) {
        grupos.push('mil');
      } else {
        grupos.push(`${converterGrupo(milhares)} mil`);
      }
    }

    if (unidadesVal > 0) {
      grupos.push(converterGrupo(unidadesVal));
    }

    // Juntar grupos com vírgula e "e" antes do último
    let textoInteiro: string;
    if (grupos.length === 1) {
      textoInteiro = grupos[0];
    } else if (grupos.length === 2) {
      // Usar "e" se o último grupo < 100 ou é múltiplo de 100
      const usarE = unidadesVal > 0 && (unidadesVal < 100 || unidadesVal % 100 === 0);
      textoInteiro = usarE ? `${grupos[0]} e ${grupos[1]}` : `${grupos[0]}, ${grupos[1]}`;
    } else {
      // 3 grupos: milhões, mil, unidades
      const ultimoGrupo = grupos[grupos.length - 1];
      const restante = grupos.slice(0, -1).join(', ');
      const usarE = unidadesVal > 0 && (unidadesVal < 100 || unidadesVal % 100 === 0);
      textoInteiro = usarE ? `${restante} e ${ultimoGrupo}` : `${restante}, ${ultimoGrupo}`;
    }

    // "de reais" quando termina em milhão/milhões sem unidades/milhares
    const usarDeReais = milhoes > 0 && milhares === 0 && unidadesVal === 0;

    if (inteiro === 1) {
      partes.push(`${textoInteiro} real`);
    } else if (usarDeReais) {
      partes.push(`${textoInteiro} de reais`);
    } else {
      partes.push(`${textoInteiro} reais`);
    }
  }

  if (centavos > 0) {
    const textoCentavos = centavos < 20
      ? unidades[centavos]
      : converterGrupo(centavos);

    if (centavos === 1) {
      partes.push(`${textoCentavos} centavo`);
    } else {
      partes.push(`${textoCentavos} centavos`);
    }
  }

  return partes.join(' e ');
}
