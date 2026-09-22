export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo (para o segundo bloco de números)
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
    .replace(/(-\d{2})\d+?$/, '$1') // Captura apenas os dois últimos dígitos
}

export const maskCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{2})(\d)/, '$1.$2') // Coloca ponto entre o segundo e o terceiro dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto entre o quinto e o sexto dígitos
    .replace(/(\d{3})(\d)/, '$1/$2') // Coloca uma barra entre o oitavo e o nono dígitos
    .replace(/(\d{4})(\d)/, '$1-$2') // Coloca um hífen depois do bloco de quatro dígitos
    .replace(/(-\d{2})\d+?$/, '$1') // Captura apenas os dois últimos dígitos
}

export const maskPhone = (value: string): string => {
  let r = value.replace(/\D/g, '')
  r = r.replace(/^0/, '')
  if (r.length > 10) {
    r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3')
  } else if (r.length > 5) {
    r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3')
  } else if (r.length > 2) {
    r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2')
  } else {
    r = r.replace(/^(\d*)/, '($1')
  }
  return r
}
