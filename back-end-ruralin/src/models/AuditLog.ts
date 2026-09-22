/**
 * AuditLog - Modelo de Log de Auditoria
 * 
 * Armazena logs de auditoria de todas as operações importantes do sistema.
 * Registra informações sobre quem fez o quê, quando, e quais mudanças foram feitas.
 * 
 * Campos principais:
 * - userId: ID do usuário que realizou a ação
 * - action: Tipo de ação (CREATE, UPDATE, DELETE)
 * - entity: Nome da entidade afetada
 * - entityId: ID da entidade afetada
 * - changes: Objeto JSON com before/after (mudanças)
 * - ip: Endereço IP de origem
 * - userAgent: User agent do cliente
 * - timestamp: Data e hora da ação
 * 
 * @example
 * ```typescript
 * const auditLog = await AuditLog.create({
 *   userId: 1,
 *   action: 'UPDATE',
 *   entity: 'Usuario',
 *   entityId: 123,
 *   changes: {
 *     before: { nome: 'João' },
 *     after: { nome: 'João Silva' }
 *   },
 *   ip: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...'
 * });
 * ```
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Tipos de ação de auditoria
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT';

/**
 * Interface para atributos de AuditLog
 */
export interface AuditLogAttributes {
  id: number;
  tenantId: number;
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number | null;
  changes: {
    before?: any;
    after?: any;
  } | null;
  ip: string | null;
  userAgent: string | null;
  timestamp: Date;
}

/**
 * Interface para criação de AuditLog (id e timestamp são opcionais)
 */
export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'timestamp'> {}

/**
 * Classe do modelo AuditLog
 */
class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public tenantId!: number;
  public userId!: number;
  public action!: AuditAction;
  public entity!: string;
  public entityId!: number | null;
  public changes!: { before?: any; after?: any } | null;
  public ip!: string | null;
  public userAgent!: string | null;
  public timestamp!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicialização do modelo AuditLog
 */
AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: 'ID do tenant ao qual o log de auditoria pertence',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id',
      },
      comment: 'ID do usuário que realizou a ação',
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT'),
      allowNull: false,
      comment: 'Tipo de ação realizada',
    },
    entity: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome da entidade afetada (ex: Usuario, Evento)',
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da entidade afetada (null para ações sem entidade específica)',
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Objeto JSON com before/after das mudanças',
    },
    ip: {
      type: DataTypes.STRING(45), // IPv6 pode ter até 45 caracteres
      allowNull: true,
      comment: 'Endereço IP de origem da requisição',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent do cliente (navegador, app, etc.)',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data e hora da ação',
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    indexes: [
      // Índice composto para buscar logs de um usuário ordenados por data
      {
        fields: ['userId', 'timestamp'],
        name: 'idx_audit_logs_user_timestamp',
      },
      // Índice composto para buscar logs de uma entidade específica
      {
        fields: ['entity', 'entityId'],
        name: 'idx_audit_logs_entity',
      },
      // Índice simples para buscar logs por data
      {
        fields: ['timestamp'],
        name: 'idx_audit_logs_timestamp',
      },
      // Índice para buscar logs por ação
      {
        fields: ['action'],
        name: 'idx_audit_logs_action',
      },
      // Índice para buscar logs por tenant
      {
        fields: ['tenantId'],
        name: 'idx_audit_logs_tenantId',
      },
    ],
    comment: 'Tabela de logs de auditoria do sistema',
  }
);

// Definir relacionamento com Usuario (opcional, para facilitar queries)
AuditLog.belongsTo(Usuario, {
  foreignKey: 'userId',
  as: 'usuario',
});

export default AuditLog;
