import { describe, it, expect } from 'vitest'
import { valorPorExtenso } from '../valorPorExtenso'

describe('valorPorExtenso', () => {
  // === Casos limites ===
  it('zero reais', () => {
    expect(valorPorExtenso(0)).toBe('zero reais')
  })

  it('valor negativo retorna string vazia', () => {
    expect(valorPorExtenso(-1)).toBe('')
  })

  it('valor acima do limite retorna mensagem', () => {
    expect(valorPorExtenso(1000000000)).toBe('Valor acima do limite suportado')
  })

  // === Centavos ===
  it('um centavo', () => {
    expect(valorPorExtenso(0.01)).toBe('um centavo')
  })

  it('dois centavos', () => {
    expect(valorPorExtenso(0.02)).toBe('dois centavos')
  })

  it('dez centavos', () => {
    expect(valorPorExtenso(0.10)).toBe('dez centavos')
  })

  it('cinquenta centavos', () => {
    expect(valorPorExtenso(0.50)).toBe('cinquenta centavos')
  })

  it('noventa e nove centavos', () => {
    expect(valorPorExtenso(0.99)).toBe('noventa e nove centavos')
  })

  // === Unidades ===
  it('um real', () => {
    expect(valorPorExtenso(1)).toBe('um real')
  })

  it('dois reais', () => {
    expect(valorPorExtenso(2)).toBe('dois reais')
  })

  it('dez reais', () => {
    expect(valorPorExtenso(10)).toBe('dez reais')
  })

  it('dezenove reais', () => {
    expect(valorPorExtenso(19)).toBe('dezenove reais')
  })

  it('vinte reais', () => {
    expect(valorPorExtenso(20)).toBe('vinte reais')
  })

  it('vinte e um reais', () => {
    expect(valorPorExtenso(21)).toBe('vinte e um reais')
  })

  // === Centenas ===
  it('cem reais', () => {
    expect(valorPorExtenso(100)).toBe('cem reais')
  })

  it('cento e um reais', () => {
    expect(valorPorExtenso(101)).toBe('cento e um reais')
  })

  it('duzentos reais', () => {
    expect(valorPorExtenso(200)).toBe('duzentos reais')
  })

  it('quinhentos e cinquenta e cinco reais', () => {
    expect(valorPorExtenso(555)).toBe('quinhentos e cinquenta e cinco reais')
  })

  it('novecentos e noventa e nove reais', () => {
    expect(valorPorExtenso(999)).toBe('novecentos e noventa e nove reais')
  })

  // === Milhares ===
  it('mil reais', () => {
    expect(valorPorExtenso(1000)).toBe('mil reais')
  })

  it('mil e um reais', () => {
    expect(valorPorExtenso(1001)).toBe('mil e um reais')
  })

  it('mil e quinhentos reais', () => {
    expect(valorPorExtenso(1500)).toBe('mil e quinhentos reais')
  })

  it('dois mil reais', () => {
    expect(valorPorExtenso(2000)).toBe('dois mil reais')
  })

  it('mil quinhentos e trinta reais e cinquenta centavos', () => {
    expect(valorPorExtenso(1530.50)).toBe('mil, quinhentos e trinta reais e cinquenta centavos')
  })

  it('dez mil reais', () => {
    expect(valorPorExtenso(10000)).toBe('dez mil reais')
  })

  it('cem mil reais', () => {
    expect(valorPorExtenso(100000)).toBe('cem mil reais')
  })

  // === Milhões ===
  it('um milhão de reais', () => {
    expect(valorPorExtenso(1000000)).toBe('um milhão de reais')
  })

  it('dois milhões de reais', () => {
    expect(valorPorExtenso(2000000)).toBe('dois milhões de reais')
  })

  it('um milhão e um reais', () => {
    expect(valorPorExtenso(1000001)).toBe('um milhão e um reais')
  })

  it('um milhão, duzentos e trinta e quatro mil, quinhentos e sessenta e sete reais', () => {
    expect(valorPorExtenso(1234567)).toBe(
      'um milhão, duzentos e trinta e quatro mil, quinhentos e sessenta e sete reais',
    )
  })

  // === Combinação inteiro + centavos ===
  it('um real e um centavo', () => {
    expect(valorPorExtenso(1.01)).toBe('um real e um centavo')
  })

  it('dez reais e vinte e cinco centavos', () => {
    expect(valorPorExtenso(10.25)).toBe('dez reais e vinte e cinco centavos')
  })

  // === Arredondamento ===
  it('arredonda para 2 casas decimais', () => {
    // 1.005 in IEEE 754 is 1.00499... so rounds to 1.00
    expect(valorPorExtenso(1.005)).toBe('um real')
  })

  it('valor máximo suportado', () => {
    expect(valorPorExtenso(999999999.99)).toContain('milhões')
  })
})
