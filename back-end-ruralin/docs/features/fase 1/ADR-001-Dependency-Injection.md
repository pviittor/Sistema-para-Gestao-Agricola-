# ADR-001: Dependency Injection com TSyringe

## Status

✅ Aceito

## Contexto

O projeto atual não utiliza Dependency Injection, o que dificulta:
- Testes unitários (dificulta criação de mocks)
- Manutenção (acoplamento forte entre componentes)
- Reutilização de código
- Evolução da arquitetura

Necessário implementar um sistema de DI robusto que seja:
- Compatível com TypeScript
- Leve e performático
- Fácil de usar
- Bem documentado

## Decisão

Implementar Dependency Injection usando **TSyringe** como biblioteca principal.

## Opções Consideradas

### 1. TSyringe ✅ (Escolhida)

**Prós**:
- Leve e performático
- Desenvolvido pela Microsoft
- Suporte nativo a decorators TypeScript
- Documentação completa
- Comunidade ativa
- Fácil de usar

**Contras**:
- Menos features avançadas que InversifyJS

### 2. InversifyJS

**Prós**:
- Muito completo e poderoso
- Muitas features avançadas
- Comunidade grande

**Contras**:
- Mais complexo
- Maior overhead
- Curva de aprendizado maior
- Mais verboso

### 3. TypeDI

**Prós**:
- Simples
- TypeScript-first

**Contras**:
- Menos popular
- Menos suporte da comunidade
- Menos recursos

## Consequências

### Positivas

- ✅ Facilita testes unitários
- ✅ Reduz acoplamento
- ✅ Melhora manutenibilidade
- ✅ Permite evolução arquitetural
- ✅ Base para outras features (Application Services, Repositories, etc.)

### Negativas

- ⚠️ Requer refatoração de código existente
- ⚠️ Adiciona dependência ao projeto
- ⚠️ Requer conhecimento de decorators

### Mitigações

- Refatoração será feita gradualmente
- Documentação completa será criada
- Treinamento da equipe será realizado

## Implementação

- Biblioteca: `tsyringe@^5.0.0`
- Metadata: `reflect-metadata@^0.2.2`
- Configuração: `experimentalDecorators: true` no tsconfig.json
- Estrutura: `src/core/di/`

## Referências

- [TSyringe GitHub](https://github.com/microsoft/tsyringe)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

---

**Data**: [Data]  
**Autor**: [Nome]  
**Aprovado por**: [Nome]
