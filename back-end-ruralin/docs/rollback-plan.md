# Plano de Rollback - Migração Multi-Tenancy

## Resumo Executivo

Este documento detalha os procedimentos de rollback caso a migração para multi-tenancy falhe ou precise ser revertida.

**Data**: 2024-01-01  
**Versão**: 1.0

---

## Cenários de Rollback

### Cenário 1: Rollback Antes de NOT NULL

**Condições**:
- Migração falhou antes de tornar tenantId NOT NULL
- Colunas tenantId ainda são NULL
- Dados podem ter tenantId parcialmente preenchido

**Procedimento**:
```sql
-- Remover colunas tenantId
ALTER TABLE usuarios DROP COLUMN tenantId;
ALTER TABLE eventos DROP COLUMN tenantId;
ALTER TABLE locais DROP COLUMN tenantId;
ALTER TABLE lembretes DROP COLUMN tenantId;
ALTER TABLE financeiros DROP COLUMN tenantId;
ALTER TABLE audit_logs DROP COLUMN tenantId;
ALTER TABLE lembrete_data_hora DROP COLUMN tenantId;
ALTER TABLE usuario_has_role DROP COLUMN tenantId;

-- Se roles/permissoes foram alterados
ALTER TABLE roles DROP COLUMN tenantId;
ALTER TABLE permissoes DROP COLUMN tenantId;
ALTER TABLE role_has_permissao DROP COLUMN tenantId;
```

**Validação**:
```sql
-- Verificar que colunas foram removidas
SHOW COLUMNS FROM usuarios LIKE 'tenantId'; -- Deve retornar vazio
```

### Cenário 2: Rollback Após NOT NULL

**Condições**:
- Migração falhou após tornar tenantId NOT NULL
- Colunas tenantId são NOT NULL e preenchidas

**Procedimento**:
```sql
-- Tornar tenantId NULL novamente
ALTER TABLE usuarios MODIFY COLUMN tenantId INT NULL;
ALTER TABLE eventos MODIFY COLUMN tenantId INT NULL;
ALTER TABLE locais MODIFY COLUMN tenantId INT NULL;
ALTER TABLE lembretes MODIFY COLUMN tenantId INT NULL;
ALTER TABLE financeiros MODIFY COLUMN tenantId INT NULL;
ALTER TABLE audit_logs MODIFY COLUMN tenantId INT NULL;
ALTER TABLE lembrete_data_hora MODIFY COLUMN tenantId INT NULL;
ALTER TABLE usuario_has_role MODIFY COLUMN tenantId INT NULL;

-- Limpar tenantId
UPDATE usuarios SET tenantId = NULL;
UPDATE eventos SET tenantId = NULL;
UPDATE locais SET tenantId = NULL;
UPDATE lembretes SET tenantId = NULL;
UPDATE financeiros SET tenantId = NULL;
UPDATE audit_logs SET tenantId = NULL;
UPDATE lembrete_data_hora SET tenantId = NULL;
UPDATE usuario_has_role SET tenantId = NULL;

-- Remover colunas (mesmo procedimento do Cenário 1)
ALTER TABLE usuarios DROP COLUMN tenantId;
ALTER TABLE eventos DROP COLUMN tenantId;
-- ... outras tabelas
```

### Cenário 3: Restauração de Backup

**Condições**:
- Migração falhou completamente
- Dados corrompidos
- Rollback parcial não é possível

**Procedimento**:
```bash
# Parar aplicação
systemctl stop backend-app

# Restaurar backup
mysql -u [user] -p [database] < backup_pre_migration_YYYYMMDD_HHMMSS.sql

# Validar restauração
mysql -u [user] -p [database] -e "SELECT COUNT(*) FROM usuarios;"

# Reiniciar aplicação
systemctl start backend-app
```

---

## Procedimentos de Rollback por Fase

### Rollback Fase 1 (Preparação)
**Não necessário** - Apenas backup e validações

### Rollback Fase 2 (Adição de Colunas)
```sql
-- Remover colunas adicionadas
ALTER TABLE usuarios DROP COLUMN tenantId;
ALTER TABLE eventos DROP COLUMN tenantId;
-- ... outras tabelas
```

### Rollback Fase 3 (População)
```sql
-- Limpar tenantId
UPDATE usuarios SET tenantId = NULL;
UPDATE eventos SET tenantId = NULL;
-- ... outras tabelas
```

### Rollback Fase 4 (NOT NULL)
```sql
-- Tornar NULL novamente
ALTER TABLE usuarios MODIFY COLUMN tenantId INT NULL;
-- ... outras tabelas

-- Limpar tenantId
UPDATE usuarios SET tenantId = NULL;
-- ... outras tabelas
```

### Rollback Fase 5 (Validações)
**Não necessário** - Apenas validações, sem alterações de dados

---

## Validações Pós-Rollback

### Checklist de Validação

- [ ] Colunas tenantId removidas (ou NULL)
- [ ] Contagem de registros igual ao pré-migração
- [ ] Integridade referencial mantida
- [ ] Funcionalidades críticas funcionando
- [ ] Performance não degradou

### Scripts de Validação

```sql
-- Verificar contagem de registros
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'eventos', COUNT(*) FROM eventos
UNION ALL
SELECT 'locais', COUNT(*) FROM locais
-- ... outras tabelas

-- Verificar integridade referencial
SELECT COUNT(*) as eventos_sem_usuario
FROM eventos e
LEFT JOIN usuarios u ON u.id = e.usuarioId
WHERE u.id IS NULL; -- Deve retornar 0
```

---

## Procedimentos de Emergência

### Rollback Rápido (5 minutos)

**Quando usar**: Falha crítica durante migração

**Procedimento**:
1. Parar aplicação
2. Restaurar backup mais recente
3. Validar restauração
4. Reiniciar aplicação

### Rollback Parcial (30 minutos)

**Quando usar**: Migração parcialmente concluída, dados inconsistentes

**Procedimento**:
1. Identificar ponto de falha
2. Executar rollback da fase específica
3. Validar dados
4. Decidir se continua ou reverte tudo

---

## Contatos de Emergência

- **Tech Lead**: [contato]
- **DBA**: [contato]
- **DevOps**: [contato]

---

**Última Atualização**: 2024-01-01  
**Versão**: 1.0
