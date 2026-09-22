# Plano de Migração para Multi-Tenancy

## Resumo Executivo

Este documento detalha o plano de migração para adicionar suporte a multi-tenancy no sistema, incluindo scripts SQL, ordem de execução, validações e procedimentos de rollback.

**Data**: 2024-01-01  
**Versão**: 1.0

---

## Pré-Requisitos

### 1. Backup Completo
```bash
# Backup completo do banco de dados
mysqldump -u [user] -p [database] > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup
ls -lh backup_pre_migration_*.sql
```

### 2. Ambiente de Teste
- [ ] Criar ambiente de teste idêntico à produção
- [ ] Executar migração completa em teste
- [ ] Validar todos os cenários
- [ ] Aprovar migração para produção

### 3. Janela de Manutenção
- [ ] Agendar janela de manutenção (8-12 horas)
- [ ] Comunicar usuários com antecedência
- [ ] Preparar equipe de suporte

---

## Scripts de Migração

### Migration 1: Adicionar tenantId em usuarios

```sql
-- Adicionar coluna tenantId
ALTER TABLE usuarios
ADD COLUMN tenantId INT NULL AFTER id;

-- Criar índice
CREATE INDEX idx_usuarios_tenantId ON usuarios(tenantId);

-- Validar
SELECT COUNT(*) as total, COUNT(tenantId) as com_tenantId
FROM usuarios;
```

### Migration 2: Popular tenantId em usuarios

```sql
-- Passo 1: ROOTs recebem tenantId = id
UPDATE usuarios
SET tenantId = id
WHERE tipo = 'ROOT';

-- Validar ROOTs
SELECT id, tipo, tenantId
FROM usuarios
WHERE tipo = 'ROOT'
AND tenantId != id; -- Deve retornar 0 linhas

-- Passo 2: CLIENTs herdam tenantId do ROOT relacionado
UPDATE usuarios u
SET u.tenantId = (
  SELECT u2.tenantId
  FROM usuario_has_subUsuario uhs
  JOIN usuarios u2 ON u2.id = uhs.usuarioId
  WHERE uhs.subUsuarioId = u.id
  LIMIT 1
)
WHERE u.tipo = 'CLIENT'
AND EXISTS (
  SELECT 1 FROM usuario_has_subUsuario uhs
  WHERE uhs.subUsuarioId = u.id
);

-- Passo 3: CLIENTs sem ROOT recebem tenantId = id
UPDATE usuarios
SET tenantId = id
WHERE tipo = 'CLIENT'
AND tenantId IS NULL;

-- Validar todos os usuarios têm tenantId
SELECT COUNT(*) as sem_tenantId
FROM usuarios
WHERE tenantId IS NULL; -- Deve retornar 0
```

### Migration 3: Adicionar tenantId em tabelas dependentes

```sql
-- eventos
ALTER TABLE eventos ADD COLUMN tenantId INT NULL AFTER id;
CREATE INDEX idx_eventos_tenantId ON eventos(tenantId);

-- locais
ALTER TABLE locais ADD COLUMN tenantId INT NULL AFTER id;
CREATE INDEX idx_locais_tenantId ON locais(tenantId);

-- lembretes
ALTER TABLE lembretes ADD COLUMN tenantId INT NULL AFTER id;
CREATE INDEX idx_lembretes_tenantId ON lembretes(tenantId);

-- financeiros
ALTER TABLE financeiros ADD COLUMN tenantId INT NULL AFTER id;
CREATE INDEX idx_financeiros_tenantId ON financeiros(tenantId);

-- audit_logs
ALTER TABLE audit_logs ADD COLUMN tenantId INT NULL AFTER id;
CREATE INDEX idx_audit_logs_tenantId ON audit_logs(tenantId);

-- lembrete_data_hora
ALTER TABLE lembrete_data_hora ADD COLUMN tenantId INT NULL AFTER id;
CREATE INDEX idx_lembrete_data_hora_tenantId ON lembrete_data_hora(tenantId);

-- usuario_has_role
ALTER TABLE usuario_has_role ADD COLUMN tenantId INT NULL AFTER usuarioId;
CREATE INDEX idx_usuario_has_role_tenantId ON usuario_has_role(tenantId);
```

### Migration 4: Popular tenantId em dados relacionados

```sql
-- eventos
UPDATE eventos e
SET e.tenantId = (
  SELECT u.tenantId
  FROM usuarios u
  WHERE u.id = e.usuarioId
);

-- Validar eventos
SELECT COUNT(*) as sem_tenantId
FROM eventos WHERE tenantId IS NULL; -- Deve retornar 0

-- locais
UPDATE locais l
SET l.tenantId = (
  SELECT u.tenantId
  FROM usuarios u
  WHERE u.id = l.usuarioId
);

-- Validar locais
SELECT COUNT(*) as sem_tenantId
FROM locais WHERE tenantId IS NULL; -- Deve retornar 0

-- lembretes
UPDATE lembretes l
SET l.tenantId = (
  SELECT u.tenantId
  FROM usuarios u
  WHERE u.id = l.usuarioId
);

-- Validar lembretes
SELECT COUNT(*) as sem_tenantId
FROM lembretes WHERE tenantId IS NULL; -- Deve retornar 0

-- financeiros
UPDATE financeiros f
SET f.tenantId = (
  SELECT u.tenantId
  FROM usuarios u
  WHERE u.id = f.usuarioId
);

-- Validar financeiros
SELECT COUNT(*) as sem_tenantId
FROM financeiros WHERE tenantId IS NULL; -- Deve retornar 0

-- lembrete_data_hora
UPDATE lembrete_data_hora ldh
SET ldh.tenantId = (
  SELECT l.tenantId
  FROM lembretes l
  WHERE l.id = ldh.lembreteId
);

-- Validar lembrete_data_hora
SELECT COUNT(*) as sem_tenantId
FROM lembrete_data_hora WHERE tenantId IS NULL; -- Deve retornar 0

-- audit_logs
UPDATE audit_logs al
SET al.tenantId = (
  SELECT u.tenantId
  FROM usuarios u
  WHERE u.id = al.userId
);

-- Validar audit_logs
SELECT COUNT(*) as sem_tenantId
FROM audit_logs WHERE tenantId IS NULL; -- Deve retornar 0

-- usuario_has_role
UPDATE usuario_has_role uhr
SET uhr.tenantId = (
  SELECT u.tenantId
  FROM usuarios u
  WHERE u.id = uhr.usuarioId
);

-- Validar usuario_has_role
SELECT COUNT(*) as sem_tenantId
FROM usuario_has_role WHERE tenantId IS NULL; -- Deve retornar 0
```

### Migration 5: Validações de Consistência

```sql
-- Verificar consistência eventos -> usuarios
SELECT COUNT(*) as inconsistencias
FROM eventos e
JOIN usuarios u ON u.id = e.usuarioId
WHERE e.tenantId != u.tenantId; -- Deve retornar 0

-- Verificar consistência locais -> usuarios
SELECT COUNT(*) as inconsistencias
FROM locais l
JOIN usuarios u ON u.id = l.usuarioId
WHERE l.tenantId != u.tenantId; -- Deve retornar 0

-- Verificar consistência lembretes -> usuarios
SELECT COUNT(*) as inconsistencias
FROM lembretes l
JOIN usuarios u ON u.id = l.usuarioId
WHERE l.tenantId != u.tenantId; -- Deve retornar 0

-- Verificar consistência financeiros -> usuarios
SELECT COUNT(*) as inconsistencias
FROM financeiros f
JOIN usuarios u ON u.id = f.usuarioId
WHERE f.tenantId != u.tenantId; -- Deve retornar 0

-- Verificar consistência eventos -> locais
SELECT COUNT(*) as inconsistencias
FROM eventos e
JOIN locais l ON l.id = e.localId
WHERE e.tenantId != l.tenantId; -- Deve retornar 0

-- Verificar consistência lembrete_data_hora -> lembretes
SELECT COUNT(*) as inconsistencias
FROM lembrete_data_hora ldh
JOIN lembretes l ON l.id = ldh.lembreteId
WHERE ldh.tenantId != l.tenantId; -- Deve retornar 0
```

### Migration 6: Tornar tenantId NOT NULL

```sql
-- usuarios
ALTER TABLE usuarios MODIFY COLUMN tenantId INT NOT NULL;

-- eventos
ALTER TABLE eventos MODIFY COLUMN tenantId INT NOT NULL;

-- locais
ALTER TABLE locais MODIFY COLUMN tenantId INT NOT NULL;

-- lembretes
ALTER TABLE lembretes MODIFY COLUMN tenantId INT NOT NULL;

-- financeiros
ALTER TABLE financeiros MODIFY COLUMN tenantId INT NOT NULL;

-- audit_logs
ALTER TABLE audit_logs MODIFY COLUMN tenantId INT NOT NULL;

-- lembrete_data_hora
ALTER TABLE lembrete_data_hora MODIFY COLUMN tenantId INT NOT NULL;

-- usuario_has_role
ALTER TABLE usuario_has_role MODIFY COLUMN tenantId INT NOT NULL;
```

---

## Ordem de Execução

### Sequência Completa

1. **Backup Completo** (30 minutos)
2. **Migration 1**: Adicionar tenantId em usuarios (5 minutos)
3. **Migration 2**: Popular tenantId em usuarios (15 minutos)
4. **Migration 3**: Adicionar tenantId em tabelas dependentes (10 minutos)
5. **Migration 4**: Popular tenantId em dados relacionados (1-3 horas, depende do volume)
6. **Migration 5**: Validações de consistência (30 minutos)
7. **Migration 6**: Tornar tenantId NOT NULL (10 minutos)
8. **Validações Finais** (30 minutos)

**Tempo Total Estimado**: 3-5 horas (depende do volume de dados)

---

## Validações Pós-Migração

### Checklist Completo

- [ ] Todos os registros têm tenantId preenchido
- [ ] tenantId de usuarios ROOT = id
- [ ] tenantId de usuarios CLIENT = tenantId do ROOT relacionado
- [ ] Consistência de tenantId em todos os relacionamentos
- [ ] Índices criados corretamente
- [ ] Performance de queries não degradou
- [ ] Aplicação funcionando corretamente

### Scripts de Validação Final

```sql
-- Validação completa
SELECT 
  'usuarios' as tabela,
  COUNT(*) as total,
  COUNT(tenantId) as com_tenantId,
  COUNT(*) - COUNT(tenantId) as sem_tenantId
FROM usuarios
UNION ALL
SELECT 'eventos', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM eventos
UNION ALL
SELECT 'locais', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM locais
UNION ALL
SELECT 'lembretes', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM lembretes
UNION ALL
SELECT 'financeiros', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM financeiros
UNION ALL
SELECT 'audit_logs', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM audit_logs
UNION ALL
SELECT 'lembrete_data_hora', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM lembrete_data_hora
UNION ALL
SELECT 'usuario_has_role', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM usuario_has_role;
```

---

## Procedimentos de Rollback

Ver documento: [rollback-plan.md](./rollback-plan.md)

---

**Última Atualização**: 2024-01-01  
**Versão**: 1.0
