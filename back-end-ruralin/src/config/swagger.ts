import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuração do Swagger/OpenAPI
 * 
 * Define as informações básicas da API e configura a geração automática
 * de documentação a partir de comentários JSDoc nos arquivos de rotas e controllers.
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RuralIn API',
    version: '1.0.0',
    description: 'API RESTful para o sistema RuralIn - Gestão de propriedades rurais',
    contact: {
      name: 'Equipe RuralIn',
      email: 'suporte@ruralin.com.br',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'Servidor de desenvolvimento',
    },
    {
      url: 'https://api.ruralin.com.br',
      description: 'Servidor de produção',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido através do endpoint /api/auth/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                example: 'Dados de entrada inválidos',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
          path: {
            type: 'string',
            example: '/api/usuarios',
          },
          requestId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
      PaginatedResult: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
        },
      },
      CreateLoginDto: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'usuario@example.com',
            description: 'Email ou username do usuário',
          },
          senha: {
            type: 'string',
            format: 'password',
            minLength: 6,
            example: 'senha123',
            description: 'Senha do usuário',
          },
        },
      },
      AuthResponseDto: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              email: {
                type: 'string',
                example: 'usuario@example.com',
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              apiUrl: {
                type: 'string',
                nullable: true,
                example: 'https://api.example.com',
              },
            },
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Token JWT de acesso (expira em 15 minutos)',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Refresh token para renovação (expira em 7 dias)',
          },
        },
      },
      RefreshTokenDto: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Refresh token obtido no login',
          },
        },
      },
      RefreshResponseDto: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Novo token JWT de acesso',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Novo refresh token',
          },
        },
      },
      CreateUsuarioDto: {
        type: 'object',
        required: ['nome', 'username', 'email', 'senha', 'tipo'],
        properties: {
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'João Silva',
            description: 'Nome completo do usuário',
          },
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            example: 'joao.silva',
            description: 'Username único do usuário',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'joao@example.com',
            description: 'Email único do usuário',
          },
          senha: {
            type: 'string',
            format: 'password',
            minLength: 6,
            example: 'Senha123',
            description: 'Senha do usuário (mínimo 6 caracteres)',
          },
          whatsapp: {
            type: 'string',
            nullable: true,
            example: '+5511999999999',
            description: 'Número de WhatsApp',
          },
          tipo: {
            type: 'string',
            enum: ['ROOT', 'CLIENT'],
            example: 'CLIENT',
            description: 'Tipo do usuário',
          },
          apiKey: {
            type: 'string',
            nullable: true,
            example: 'key123',
            description: 'API Key do usuário',
          },
          apiUrl: {
            type: 'string',
            nullable: true,
            example: 'https://api.example.com',
            description: 'URL da API do usuário',
          },
          roleIds: {
            type: 'array',
            items: {
              type: 'integer',
            },
            nullable: true,
            example: [1, 2],
            description: 'IDs das roles a serem associadas ao usuário',
          },
        },
      },
      UpdateUsuarioDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
          },
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
          },
          email: {
            type: 'string',
            format: 'email',
          },
          senha: {
            type: 'string',
            format: 'password',
            minLength: 6,
          },
          whatsapp: {
            type: 'string',
            nullable: true,
          },
          tipo: {
            type: 'string',
            enum: ['ROOT', 'CLIENT'],
          },
          apiKey: {
            type: 'string',
            nullable: true,
          },
          apiUrl: {
            type: 'string',
            nullable: true,
          },
          roleIds: {
            type: 'array',
            items: {
              type: 'integer',
            },
            nullable: true,
            description: 'IDs das roles a serem associadas ao usuário',
          },
          subUsuarios: {
            type: 'array',
            items: {
              type: 'object',
            },
            nullable: true,
            description: 'Array de sub-usuários para atualização',
          },
        },
      },
      UsuarioResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          nome: {
            type: 'string',
            example: 'João Silva',
          },
          username: {
            type: 'string',
            example: 'joao.silva',
          },
          email: {
            type: 'string',
            example: 'joao@example.com',
          },
          whatsapp: {
            type: 'string',
            nullable: true,
            example: '+5511999999999',
          },
          tipo: {
            type: 'string',
            enum: ['ROOT', 'CLIENT'],
            example: 'CLIENT',
          },
          apiKey: {
            type: 'string',
            nullable: true,
            example: 'key123',
          },
          apiUrl: {
            type: 'string',
            nullable: true,
            example: 'https://api.example.com',
          },
          roleIds: {
            type: 'array',
            items: {
              type: 'integer',
            },
            nullable: true,
            example: [1, 2],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
        },
      },
      UsuarioDetailResponseDto: {
        allOf: [
          {
            $ref: '#/components/schemas/UsuarioResponseDto',
          },
          {
            type: 'object',
            properties: {
              roles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1,
                    },
                    nome: {
                      type: 'string',
                      example: 'Administrador',
                    },
                  },
                },
                nullable: true,
              },
              subUsuarios: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/UsuarioResponseDto',
                },
                nullable: true,
              },
            },
          },
        ],
      },
      CreateGrupoProdutoDto: {
        type: 'object',
        required: ['descricao_grupo'],
        properties: {
          descricao_grupo: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Fertilizantes',
            description: 'Descrição do grupo de produto',
          },
          abreviacao_grupo: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            example: 'FERT',
            description: 'Abreviação do grupo de produto',
          },
        },
      },
      UpdateGrupoProdutoDto: {
        type: 'object',
        properties: {
          descricao_grupo: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Fertilizantes Atualizado',
          },
          abreviacao_grupo: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            example: 'FERT',
          },
        },
      },
      GrupoProdutoResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_grupo: {
            type: 'string',
            example: 'Fertilizantes',
          },
          abreviacao_grupo: {
            type: 'string',
            nullable: true,
            example: 'FERT',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
        },
      },
      CreateSubGrupoProdutoDto: {
        type: 'object',
        required: ['descricao_sub', 'idGrupo'],
        properties: {
          descricao_sub: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Fertilizantes Nitrogenados',
            description: 'Descrição do subgrupo de produto',
          },
          idGrupo: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do grupo de produto ao qual o subgrupo pertence',
          },
        },
      },
      UpdateSubGrupoProdutoDto: {
        type: 'object',
        properties: {
          descricao_sub: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Fertilizantes Nitrogenados Atualizado',
          },
          idGrupo: {
            type: 'integer',
            minimum: 1,
            example: 1,
          },
        },
      },
      SubGrupoProdutoResponseDto: {
        type: 'object',
        properties: {
          id_sub: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_sub: {
            type: 'string',
            example: 'Fertilizantes Nitrogenados',
          },
          idGrupo: {
            type: 'integer',
            example: 1,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          grupo: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              descricao_grupo: {
                type: 'string',
                example: 'Fertilizantes',
              },
              abreviacao_grupo: {
                type: 'string',
                nullable: true,
                example: 'FERT',
              },
            },
          },
        },
      },
      CreatePrincipioAtivoDto: {
        type: 'object',
        required: ['descricao_principio'],
        properties: {
          descricao_principio: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Nitrogênio',
            description: 'Descrição do princípio ativo',
          },
          classe_principio: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            nullable: true,
            example: 'Macronutriente',
            description: 'Classe do princípio ativo',
          },
        },
      },
      UpdatePrincipioAtivoDto: {
        type: 'object',
        properties: {
          descricao_principio: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Nitrogênio Atualizado',
          },
          classe_principio: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            nullable: true,
            example: 'Macronutriente',
          },
        },
      },
      PrincipioAtivoResponseDto: {
        type: 'object',
        properties: {
          id_principio: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_principio: {
            type: 'string',
            example: 'Nitrogênio',
          },
          classe_principio: {
            type: 'string',
            nullable: true,
            example: 'Macronutriente',
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
        },
      },
      CreatePessoaDto: {
        type: 'object',
        required: ['tipo_pessoa'],
        properties: {
          nomerazao_pessoa: {
            type: 'string',
            nullable: true,
            example: 'João Silva',
            description: 'Nome (PF) ou razão social (PJ)',
          },
          nomefantasia_pessoa: {
            type: 'string',
            nullable: true,
            example: 'João Silva ME',
            description: 'Nome fantasia (principalmente PJ)',
          },
          cpfcnpj_pessoa: {
            type: 'string',
            nullable: true,
            example: '12345678901',
            description: 'CPF (PF) ou CNPJ (PJ) - deve ser único',
          },
          nascimento_pessoa: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '1990-01-15',
            description: 'Data de nascimento (PF) ou fundação (PJ)',
          },
          contato_pessoa: {
            type: 'string',
            nullable: true,
            example: 'Maria Silva',
            description: 'Nome do contato',
          },
          email_pessoa: {
            type: 'string',
            format: 'email',
            nullable: true,
            example: 'joao@example.com',
            description: 'Email de contato',
          },
          tipo_pessoa: {
            type: 'integer',
            enum: [1, 2],
            example: 1,
            description: '1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)',
          },
          cliente_pessoa: {
            type: 'boolean',
            default: false,
            example: true,
            description: 'Indica se é cliente',
          },
          produtor_pessoa: {
            type: 'boolean',
            default: false,
            example: false,
          },
          fornecedor_pessoa: {
            type: 'boolean',
            default: false,
            example: false,
          },
          endereco_pessoa: {
            type: 'string',
            nullable: true,
            example: 'Rua das Flores, 123',
          },
          cep_pessoa: {
            type: 'string',
            nullable: true,
            example: '12345-678',
          },
          telefone1_pessoa: {
            type: 'string',
            nullable: true,
            example: '(11) 98765-4321',
          },
        },
      },
      UpdatePessoaDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          nomerazao_pessoa: {
            type: 'string',
            nullable: true,
          },
          email_pessoa: {
            type: 'string',
            format: 'email',
            nullable: true,
          },
          telefone1_pessoa: {
            type: 'string',
            nullable: true,
          },
        },
      },
      PessoaResponseDto: {
        type: 'object',
        properties: {
          id_pessoa: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          nomerazao_pessoa: {
            type: 'string',
            nullable: true,
            example: 'João Silva',
          },
          nomefantasia_pessoa: {
            type: 'string',
            nullable: true,
          },
          cpfcnpj_pessoa: {
            type: 'string',
            nullable: true,
            example: '12345678901',
          },
          tipo_pessoa: {
            type: 'integer',
            example: 1,
            description: '1 = PF, 2 = PJ',
          },
          email_pessoa: {
            type: 'string',
            nullable: true,
            example: 'joao@example.com',
          },
          cliente_pessoa: {
            type: 'boolean',
            example: true,
          },
          produtor_pessoa: {
            type: 'boolean',
            example: false,
          },
          fornecedor_pessoa: {
            type: 'boolean',
            example: false,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
        },
      },
      CreateUnidadeMedidaDto: {
        type: 'object',
        required: ['descricao_unidade'],
        properties: {
          descricao_unidade: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Quilograma',
            description: 'Descrição da unidade de medida',
          },
          abreviatura_unidade: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
            nullable: true,
            example: 'kg',
            description: 'Abreviatura da unidade de medida',
          },
        },
      },
      UpdateUnidadeMedidaDto: {
        type: 'object',
        properties: {
          descricao_unidade: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Quilograma Atualizado',
          },
          abreviatura_unidade: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
            nullable: true,
            example: 'KG',
          },
        },
      },
      UnidadeMedidaResponseDto: {
        type: 'object',
        properties: {
          id_unidade: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_unidade: {
            type: 'string',
            example: 'Quilograma',
          },
          abreviatura_unidade: {
            type: 'string',
            nullable: true,
            example: 'kg',
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
        },
      },
      CreateMoedaDto: {
        type: 'object',
        required: ['descricao_moeda'],
        properties: {
          descricao_moeda: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Real Brasileiro',
            description: 'Descrição da moeda',
          },
          simbolo_moeda: {
            type: 'string',
            minLength: 1,
            maxLength: 10,
            nullable: true,
            example: 'R$',
            description: 'Símbolo da moeda',
          },
          codigoIntegracaoBancoCentral: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            nullable: true,
            example: 'BRL001',
            description: 'Código de integração com Banco Central',
          },
          siglabc_moeda: {
            type: 'string',
            minLength: 1,
            maxLength: 10,
            nullable: true,
            example: 'BRL',
            description: 'Sigla da moeda no Banco Central',
          },
        },
      },
      UpdateMoedaDto: {
        type: 'object',
        properties: {
          descricao_moeda: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
          },
          simbolo_moeda: {
            type: 'string',
            minLength: 1,
            maxLength: 10,
            nullable: true,
          },
          codigoIntegracaoBancoCentral: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            nullable: true,
          },
          siglabc_moeda: {
            type: 'string',
            minLength: 1,
            maxLength: 10,
            nullable: true,
          },
        },
      },
      MoedaResponseDto: {
        type: 'object',
        properties: {
          id_moeda: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_moeda: {
            type: 'string',
            example: 'Real Brasileiro',
          },
          simbolo_moeda: {
            type: 'string',
            nullable: true,
            example: 'R$',
          },
          codigoIntegracaoBancoCentral: {
            type: 'string',
            nullable: true,
            example: 'BRL001',
          },
          siglabc_moeda: {
            type: 'string',
            nullable: true,
            example: 'BRL',
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
        },
      },
      CreateMoedaCotacaoDto: {
        type: 'object',
        required: ['idMoeda', 'data_cotacao', 'valor_cotacao', 'fechamento_cotaca'],
        properties: {
          idMoeda: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID da moeda relacionada',
          },
          data_cotacao: {
            type: 'string',
            format: 'date',
            example: '2026-01-16',
            description: 'Data da cotação',
          },
          valor_cotacao: {
            type: 'number',
            minimum: 0,
            example: 5.25,
            description: 'Valor da cotação',
          },
          fechamento_cotaca: {
            type: 'boolean',
            example: true,
            description: 'Indica se é fechamento oficial (preço de ajuste)',
          },
        },
      },
      UpdateMoedaCotacaoDto: {
        type: 'object',
        properties: {
          idMoeda: {
            type: 'integer',
            minimum: 1,
          },
          data_cotacao: {
            type: 'string',
            format: 'date',
          },
          valor_cotacao: {
            type: 'number',
            minimum: 0,
          },
          fechamento_cotaca: {
            type: 'boolean',
          },
        },
      },
      MoedaCotacaoResponseDto: {
        type: 'object',
        properties: {
          id_cotacao: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          idMoeda: {
            type: 'integer',
            example: 1,
          },
          data_cotacao: {
            type: 'string',
            format: 'date',
            example: '2026-01-16',
          },
          valor_cotacao: {
            type: 'number',
            example: 5.25,
          },
          fechamento_cotaca: {
            type: 'boolean',
            example: true,
          },
          moeda: {
            type: 'object',
            nullable: true,
            properties: {
              id_moeda: {
                type: 'integer',
                example: 1,
              },
              descricao_moeda: {
                type: 'string',
                example: 'Real Brasileiro',
              },
              simbolo_moeda: {
                type: 'string',
                nullable: true,
                example: 'R$',
              },
              siglabc_moeda: {
                type: 'string',
                nullable: true,
                example: 'BRL',
              },
            },
          },
        },
      },
      CreateProdutoDto: {
        type: 'object',
        required: [
          'descricao_prod',
          'idUnidadeMedida',
          'pesoliquido_prod',
          'idGrupo',
          'idSubGrupo',
          'precomedio_prod',
          'valorultimaentrada_prod',
          'combustivel_prod',
          'custoUltimoCusto_prod',
          'valorUltimoCusto_prod',
        ],
        properties: {
          descricao_prod: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Fertilizante NPK 10-10-10',
            description: 'Descrição do produto',
          },
          idUnidadeMedida: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID da unidade de medida',
          },
          pesoliquido_prod: {
            type: 'number',
            minimum: 0,
            example: 50.0,
            description: 'Peso líquido do produto',
          },
          idGrupo: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do grupo de produto',
          },
          idSubGrupo: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do subgrupo de produto',
          },
          idPrincipioAtivo: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: 1,
            description: 'ID do princípio ativo',
          },
          idFabricante: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: 1,
            description: 'ID do fabricante (pessoa)',
          },
          precomedio_prod: {
            type: 'number',
            minimum: 0,
            example: 150.00,
            description: 'Preço médio do produto',
          },
          valorultimaentrada_prod: {
            type: 'number',
            minimum: 0,
            example: 145.50,
            description: 'Valor da última entrada do produto',
          },
          dataultimaentrada_prod: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2026-01-16',
            description: 'Data da última entrada do produto',
          },
          combustivel_prod: {
            type: 'boolean',
            example: false,
            description: 'Indica se o produto é combustível',
          },
          custoUltimoCusto_prod: {
            type: 'boolean',
            example: false,
            description: 'Indica se o produto utiliza o último custo',
          },
          valorUltimoCusto_prod: {
            type: 'number',
            minimum: 0,
            example: 145.50,
            description: 'Valor do último custo do produto',
          },
          atualizacaoCusto_prod: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2026-01-16',
            description: 'Data de atualização do custo',
          },
          observacao_prod: {
            type: 'string',
            nullable: true,
            example: 'Produto para uso agrícola',
            description: 'Observações sobre o produto',
          },
          idIndexador: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: 1,
            description: 'ID do indexador (moeda)',
          },
        },
      },
      UpdateProdutoDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          descricao_prod: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
          },
          idUnidadeMedida: {
            type: 'integer',
            minimum: 1,
          },
          pesoliquido_prod: {
            type: 'number',
            minimum: 0,
          },
          idGrupo: {
            type: 'integer',
            minimum: 1,
          },
          idSubGrupo: {
            type: 'integer',
            minimum: 1,
          },
          precomedio_prod: {
            type: 'number',
            minimum: 0,
          },
          valorultimaentrada_prod: {
            type: 'number',
            minimum: 0,
          },
          combustivel_prod: {
            type: 'boolean',
          },
          custoUltimoCusto_prod: {
            type: 'boolean',
          },
          valorUltimoCusto_prod: {
            type: 'number',
            minimum: 0,
          },
        },
      },
      ProdutoResponseDto: {
        type: 'object',
        properties: {
          id_prod: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_prod: {
            type: 'string',
            example: 'Fertilizante NPK 10-10-10',
          },
          idUnidadeMedida: {
            type: 'integer',
            example: 1,
          },
          pesoliquido_prod: {
            type: 'number',
            example: 50.0,
          },
          idGrupo: {
            type: 'integer',
            example: 1,
          },
          idSubGrupo: {
            type: 'integer',
            example: 1,
          },
          precomedio_prod: {
            type: 'number',
            example: 150.00,
          },
          valorultimaentrada_prod: {
            type: 'number',
            example: 145.50,
          },
          combustivel_prod: {
            type: 'boolean',
            example: false,
          },
          custoUltimoCusto_prod: {
            type: 'boolean',
            example: false,
          },
          valorUltimoCusto_prod: {
            type: 'number',
            example: 145.50,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          unidadeMedida: {
            type: 'object',
            nullable: true,
            properties: {
              id_unidade: {
                type: 'integer',
                example: 1,
              },
              descricao_unidade: {
                type: 'string',
                example: 'Quilograma',
              },
            },
          },
          grupo: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              descricao_grupo: {
                type: 'string',
                example: 'Fertilizantes',
              },
            },
          },
        },
      },
      CreateCulturaDto: {
        type: 'object',
        required: ['descricao_clt', 'idProduto'],
        properties: {
          descricao_clt: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Soja',
            description: 'Descrição da cultura',
          },
          idProduto: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do produto relacionado (id_prod)',
          },
        },
      },
      UpdateCulturaDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          descricao_clt: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
          },
          idProduto: {
            type: 'integer',
            minimum: 1,
          },
        },
      },
      CulturaResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_clt: {
            type: 'string',
            example: 'Soja',
          },
          idProduto: {
            type: 'integer',
            example: 1,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
          produto: {
            type: 'object',
            nullable: true,
            properties: {
              id_prod: {
                type: 'integer',
                example: 1,
              },
              descricao_prod: {
                type: 'string',
                example: 'Fertilizante NPK 10-10-10',
              },
            },
          },
        },
      },
      CreateServicoAgricolaDto: {
        type: 'object',
        required: ['descricao_srv', 'financeiro_srv'],
        properties: {
          descricao_srv: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Aplicação de Defensivo',
            description: 'Descrição do serviço agrícola',
          },
          financeiro_srv: {
            type: 'boolean',
            example: true,
            description: 'Indica se o serviço gera movimento financeiro (futuro)',
          },
          observacao_srv: {
            type: 'string',
            nullable: true,
            example: 'Serviço que gera movimento financeiro',
            description: 'Observações sobre o serviço',
          },
        },
      },
      UpdateServicoAgricolaDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          descricao_srv: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
          },
          financeiro_srv: {
            type: 'boolean',
          },
          observacao_srv: {
            type: 'string',
            nullable: true,
          },
        },
      },
      ServicoAgricolaResponseDto: {
        type: 'object',
        properties: {
          id_srv: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          descricao_srv: {
            type: 'string',
            example: 'Aplicação de Defensivo',
          },
          financeiro_srv: {
            type: 'boolean',
            example: true,
          },
          observacao_srv: {
            type: 'string',
            nullable: true,
            example: 'Serviço que gera movimento financeiro',
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-16T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
        },
      },
      CreatePlanoContaGerencialDto: {
        type: 'object',
        required: ['item', 'descricao', 'tipo'],
        properties: {
          item: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            pattern: '^\\d+\\.(\\d+\\.(\\d+\\.\\d+)?)?$',
            example: '1.0.0.0',
            description: 'Sequência lógica de números indicando os níveis da conta (ex: 1.0.0.0, 1.1.0.0, 1.1.1.0, 1.1.2.0)',
          },
          descricao: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Receita',
            description: 'Descrição da conta (livre digitação)',
          },
          tipo: {
            type: 'string',
            enum: ['SINTETICA', 'ANALITICA'],
            example: 'SINTETICA',
            description: 'Tipo da conta: Sintética ou Analítica',
          },
          classificacao: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            example: 'Receitas Operacionais',
            description: 'Classificação da conta (cadastro de classificação)',
          },
          contaPaiId: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: 1,
            description: 'ID da conta pai (para hierarquia). NULL para contas de primeiro nível',
          },
          nivel: {
            type: 'integer',
            minimum: 1,
            maximum: 4,
            nullable: true,
            example: 1,
            description: 'Nível hierárquico da conta (1 a 4). Calculado automaticamente se não fornecido',
          },
          ativo: {
            type: 'boolean',
            default: true,
            example: true,
            description: 'Se a conta está ativa',
          },
        },
      },
      UpdatePlanoContaGerencialDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          item: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            pattern: '^\\d+\\.(\\d+\\.(\\d+\\.\\d+)?)?$',
            example: '1.1.0.0',
            description: 'Sequência lógica de números indicando os níveis da conta',
          },
          descricao: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Receita de Vendas',
            description: 'Descrição da conta',
          },
          tipo: {
            type: 'string',
            enum: ['SINTETICA', 'ANALITICA'],
            example: 'SINTETICA',
            description: 'Tipo da conta: Sintética ou Analítica',
          },
          classificacao: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            example: 'Receitas Operacionais',
            description: 'Classificação da conta',
          },
          contaPaiId: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: 1,
            description: 'ID da conta pai (para hierarquia)',
          },
          nivel: {
            type: 'integer',
            minimum: 1,
            maximum: 4,
            nullable: true,
            example: 2,
            description: 'Nível hierárquico da conta (1 a 4)',
          },
          ativo: {
            type: 'boolean',
            example: true,
            description: 'Se a conta está ativa',
          },
        },
      },
      PlanoContaGerencialResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          item: {
            type: 'string',
            example: '1.0.0.0',
          },
          descricao: {
            type: 'string',
            example: 'Receita',
          },
          tipo: {
            type: 'string',
            enum: ['SINTETICA', 'ANALITICA'],
            example: 'SINTETICA',
          },
          classificacao: {
            type: 'string',
            nullable: true,
            example: 'Receitas Operacionais',
          },
          contaPaiId: {
            type: 'integer',
            nullable: true,
            example: null,
          },
          nivel: {
            type: 'integer',
            example: 1,
          },
          ativo: {
            type: 'boolean',
            example: true,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
          contaPai: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              item: {
                type: 'string',
                example: '1.0.0.0',
              },
              descricao: {
                type: 'string',
                example: 'Receita',
              },
              tipo: {
                type: 'string',
                enum: ['SINTETICA', 'ANALITICA'],
                example: 'SINTETICA',
              },
              nivel: {
                type: 'integer',
                example: 1,
              },
            },
          },
          contasFilhas: {
            type: 'array',
            nullable: true,
            items: {
              $ref: '#/components/schemas/PlanoContaGerencialResponseDto',
            },
            description: 'Contas filhas na hierarquia (quando incluído na query)',
          },
        },
      },
      CreateConsultoriaDto: {
        type: 'object',
        required: ['razaoSocial', 'cnpj', 'email'],
        properties: {
          razaoSocial: {
            type: 'string',
            maxLength: 255,
            example: 'Consultoria ABC Ltda',
            description: 'Razão social da consultoria',
          },
          nomeFantasia: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            example: 'ABC Consultoria',
            description: 'Nome fantasia da consultoria',
          },
          cnpj: {
            type: 'string',
            pattern: '^\\d{14}$|^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$',
            example: '12345678000190',
            description: 'CNPJ da consultoria (14 dígitos ou formato XX.XXX.XXX/XXXX-XX)',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 255,
            example: 'contato@abcconsultoria.com.br',
            description: 'Email de contato da consultoria',
          },
          telefone: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            example: '(11) 98765-4321',
            description: 'Telefone de contato da consultoria',
          },
          limiteTenants: {
            type: 'integer',
            minimum: 1,
            default: 10,
            example: 20,
            description: 'Limite de tenants permitidos para esta consultoria',
          },
        },
      },
      UpdateConsultoriaDto: {
        type: 'object',
        properties: {
          razaoSocial: {
            type: 'string',
            maxLength: 255,
            example: 'Consultoria ABC Ltda',
            description: 'Razão social da consultoria',
          },
          nomeFantasia: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            example: 'ABC Consultoria',
            description: 'Nome fantasia da consultoria',
          },
          cnpj: {
            type: 'string',
            pattern: '^\\d{14}$|^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$',
            example: '12345678000190',
            description: 'CNPJ da consultoria (14 dígitos ou formato XX.XXX.XXX/XXXX-XX)',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 255,
            example: 'contato@abcconsultoria.com.br',
            description: 'Email de contato da consultoria',
          },
          telefone: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            example: '(11) 98765-4321',
            description: 'Telefone de contato da consultoria',
          },
          limiteTenants: {
            type: 'integer',
            minimum: 1,
            example: 20,
            description: 'Limite de tenants permitidos para esta consultoria',
          },
        },
      },
      ConsultoriaResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            nullable: true,
            example: null,
          },
          razaoSocial: {
            type: 'string',
            example: 'Consultoria ABC Ltda',
          },
          nomeFantasia: {
            type: 'string',
            nullable: true,
            example: 'ABC Consultoria',
          },
          cnpj: {
            type: 'string',
            example: '12345678000190',
          },
          email: {
            type: 'string',
            example: 'contato@abcconsultoria.com.br',
          },
          telefone: {
            type: 'string',
            nullable: true,
            example: '(11) 98765-4321',
          },
          ativo: {
            type: 'boolean',
            example: true,
          },
          dataAtivacao: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          dataDesativacao: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
          },
          limiteTenants: {
            type: 'integer',
            example: 20,
          },
          tenantCount: {
            type: 'integer',
            example: 5,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
        },
      },
      CreateTenantDto: {
        type: 'object',
        required: ['nome', 'slug'],
        properties: {
          nome: {
            type: 'string',
            maxLength: 255,
            example: 'Meu Tenant',
            description: 'Nome do tenant',
          },
          slug: {
            type: 'string',
            maxLength: 255,
            pattern: '^[a-z0-9-]+$',
            example: 'meu-tenant',
            description: 'Slug único do tenant (apenas letras minúsculas, números e hífens)',
          },
          configuracoes: {
            type: 'object',
            nullable: true,
            example: { tema: 'claro', idioma: 'pt-BR' },
            description: 'Configurações específicas do tenant (JSON)',
          },
          limiteUsuarios: {
            type: 'integer',
            minimum: 1,
            default: 50,
            example: 100,
            description: 'Limite de usuários permitidos para este tenant',
          },
        },
      },
      UpdateTenantDto: {
        type: 'object',
        properties: {
          nome: {
            type: 'string',
            maxLength: 255,
            example: 'Meu Tenant Atualizado',
            description: 'Nome do tenant',
          },
          slug: {
            type: 'string',
            maxLength: 255,
            pattern: '^[a-z0-9-]+$',
            example: 'meu-tenant-atualizado',
            description: 'Slug único do tenant (apenas letras minúsculas, números e hífens)',
          },
          configuracoes: {
            type: 'object',
            nullable: true,
            example: { tema: 'escuro', idioma: 'en-US' },
            description: 'Configurações específicas do tenant (JSON)',
          },
          limiteUsuarios: {
            type: 'integer',
            minimum: 1,
            example: 100,
            description: 'Limite de usuários permitidos para este tenant',
          },
        },
      },
      TenantResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          consultoriaId: {
            type: 'integer',
            example: 1,
          },
          nome: {
            type: 'string',
            example: 'Meu Tenant',
          },
          slug: {
            type: 'string',
            example: 'meu-tenant',
          },
          ativo: {
            type: 'boolean',
            example: true,
          },
          dataAtivacao: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T10:00:00.000Z',
          },
          dataDesativacao: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
          },
          configuracoes: {
            type: 'object',
            nullable: true,
            example: { tema: 'claro', idioma: 'pt-BR' },
          },
          limiteUsuarios: {
            type: 'integer',
            example: 100,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T10:00:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T10:00:00.000Z',
          },
        },
      },
      CreateEstadoDto: {
        type: 'object',
        required: ['sigla', 'nome'],
        properties: {
          sigla: {
            type: 'string',
            minLength: 2,
            maxLength: 2,
            example: 'SP',
            description: 'Sigla do estado (ex: SP, RJ, MG)',
          },
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 100,
            example: 'São Paulo',
            description: 'Nome completo do estado',
          },
          codigoIBGE: {
            type: 'integer',
            minimum: 1,
            maximum: 99,
            nullable: true,
            example: 35,
            description: 'Código do estado no IBGE',
          },
          ativo: {
            type: 'boolean',
            default: true,
            example: true,
            description: 'Se o estado está ativo',
          },
        },
      },
      UpdateEstadoDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          sigla: {
            type: 'string',
            minLength: 2,
            maxLength: 2,
            example: 'SP',
            description: 'Sigla do estado',
          },
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 100,
            example: 'São Paulo',
            description: 'Nome completo do estado',
          },
          codigoIBGE: {
            type: 'integer',
            minimum: 1,
            maximum: 99,
            nullable: true,
            example: 35,
            description: 'Código do estado no IBGE',
          },
          ativo: {
            type: 'boolean',
            example: true,
            description: 'Se o estado está ativo',
          },
        },
      },
      EstadoResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          sigla: {
            type: 'string',
            example: 'SP',
          },
          nome: {
            type: 'string',
            example: 'São Paulo',
          },
          codigoIBGE: {
            type: 'integer',
            nullable: true,
            example: 35,
          },
          ativo: {
            type: 'boolean',
            example: true,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
        },
      },
      CreateMunicipioDto: {
        type: 'object',
        required: ['nome', 'idEstado'],
        properties: {
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'São Paulo',
            description: 'Nome do município',
          },
          idEstado: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do estado ao qual o município pertence',
          },
          codigoIBGE: {
            type: 'integer',
            minimum: 1000000,
            maximum: 9999999,
            nullable: true,
            example: 3550308,
            description: 'Código do município no IBGE',
          },
          ativo: {
            type: 'boolean',
            default: true,
            example: true,
            description: 'Se o município está ativo',
          },
        },
      },
      UpdateMunicipioDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'São Paulo',
            description: 'Nome do município',
          },
          idEstado: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do estado ao qual o município pertence',
          },
          codigoIBGE: {
            type: 'integer',
            minimum: 1000000,
            maximum: 9999999,
            nullable: true,
            example: 3550308,
            description: 'Código do município no IBGE',
          },
          ativo: {
            type: 'boolean',
            example: true,
            description: 'Se o município está ativo',
          },
        },
      },
      MunicipioResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          nome: {
            type: 'string',
            example: 'São Paulo',
          },
          idEstado: {
            type: 'integer',
            example: 1,
          },
          codigoIBGE: {
            type: 'integer',
            nullable: true,
            example: 3550308,
          },
          ativo: {
            type: 'boolean',
            example: true,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
          estado: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              sigla: {
                type: 'string',
                example: 'SP',
              },
              nome: {
                type: 'string',
                example: 'São Paulo',
              },
            },
          },
        },
      },
      CreateCentroCustoDto: {
        type: 'object',
        required: ['codigo', 'nome'],
        properties: {
          codigo: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'CC001',
            description: 'Código do centro de custo',
          },
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Centro de Custo Principal',
            description: 'Nome do centro de custo',
          },
          centroCustoPaiId: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: null,
            description: 'ID do centro de custo pai (para hierarquia). NULL para centros de custo de primeiro nível',
          },
          ativo: {
            type: 'boolean',
            default: true,
            example: true,
            description: 'Se o centro de custo está ativo',
          },
        },
      },
      UpdateCentroCustoDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          codigo: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'CC001',
            description: 'Código do centro de custo',
          },
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Centro de Custo Principal',
            description: 'Nome do centro de custo',
          },
          centroCustoPaiId: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            example: null,
            description: 'ID do centro de custo pai (para hierarquia)',
          },
          ativo: {
            type: 'boolean',
            example: true,
            description: 'Se o centro de custo está ativo',
          },
        },
      },
      CentroCustoResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          codigo: {
            type: 'string',
            example: 'CC001',
          },
          nome: {
            type: 'string',
            example: 'Centro de Custo Principal',
          },
          centroCustoPaiId: {
            type: 'integer',
            nullable: true,
            example: null,
          },
          ativo: {
            type: 'boolean',
            example: true,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
          centroCustoPai: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              codigo: {
                type: 'string',
                example: 'CC000',
              },
              nome: {
                type: 'string',
                example: 'Centro de Custo Raiz',
              },
            },
          },
          centrosCustoFilhos: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                codigo: {
                  type: 'string',
                },
                nome: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      CreateSafraDto: {
        type: 'object',
        required: ['culturaId', 'nome', 'dataInicio'],
        properties: {
          culturaId: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID da cultura',
          },
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Safra 2024/2025',
            description: 'Nome da safra',
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            example: '2024-09-01',
            description: 'Data de início da safra (formato YYYY-MM-DD)',
          },
          dataFim: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2025-03-31',
            description: 'Data de fim da safra (formato YYYY-MM-DD)',
          },
          status: {
            type: 'string',
            enum: ['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'],
            default: 'PLANEJADA',
            example: 'PLANEJADA',
            description: 'Status da safra',
          },
        },
      },
      UpdateSafraDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          culturaId: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID da cultura',
          },
          nome: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Safra 2024/2025',
            description: 'Nome da safra',
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            example: '2024-09-01',
            description: 'Data de início da safra',
          },
          dataFim: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2025-03-31',
            description: 'Data de fim da safra',
          },
          status: {
            type: 'string',
            enum: ['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'],
            example: 'EM_ANDAMENTO',
            description: 'Status da safra',
          },
        },
      },
      SafraResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          culturaId: {
            type: 'integer',
            example: 1,
          },
          nome: {
            type: 'string',
            example: 'Safra 2024/2025',
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            example: '2024-09-01',
          },
          dataFim: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2025-03-31',
          },
          status: {
            type: 'string',
            enum: ['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'],
            example: 'PLANEJADA',
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
          cultura: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              descricao_clt: {
                type: 'string',
                example: 'Soja',
              },
              idProduto: {
                type: 'integer',
                example: 1,
              },
            },
          },
        },
      },
      CreateFazendaDto: {
        type: 'object',
        required: ['idPessoa', 'descricao', 'idMunicipio', 'areaTotal', 'areaCultivada', 'reservaLegal'],
        properties: {
          idPessoa: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID da pessoa (produtor) proprietária da fazenda',
          },
          descricao: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            example: 'Fazenda Santa Maria',
            description: 'Descrição/nome da fazenda',
          },
          endereco: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            example: 'Rodovia BR-101, km 45',
            description: 'Endereço da fazenda',
          },
          complemento: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Complemento do endereço',
          },
          idMunicipio: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'ID do município onde a fazenda está localizada',
          },
          inscricaoEstadual: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Inscrição estadual da fazenda',
          },
          areaTotal: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            example: 1000.50,
            description: 'Área total da fazenda em hectares',
          },
          areaCultivada: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            example: 800.00,
            description: 'Área cultivada em hectares',
          },
          reservaLegal: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            example: 200.50,
            description: 'Reserva legal em hectares',
          },
          telefone: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            description: 'Telefone de contato da fazenda',
          },
          gerente: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Nome do gerente da fazenda',
          },
          matricula: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Matrícula do imóvel',
          },
          livro: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Livro da matrícula',
          },
          folha: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Folha da matrícula',
          },
          itr: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'ITR (Imposto Territorial Rural)',
          },
          cei: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'CEI (Cadastro Específico do INSS)',
          },
          lcdprTipoExploracao: {
            type: 'integer',
            enum: [1, 2, 3, 4, 5],
            nullable: true,
            description: 'Tipo de exploração LCDPR (1-Exploração individual, 2-Condomínio, 3-Imóvel arrendado, 4-Parceria, 5-Comodato)',
          },
          lcdprParticipacao: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            maximum: 100,
            default: 0,
            description: 'Participação na exploração (percentual)',
          },
          arrendada: {
            type: 'boolean',
            default: false,
            description: 'Se a fazenda é arrendada',
          },
          idPessoaArrendamento: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            description: 'ID da pessoa (arrendador) quando a fazenda é arrendada',
          },
          documento: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Documento do arrendamento',
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Data de início do arrendamento',
          },
          dataFim: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Data de fim do arrendamento',
          },
          observacoes: {
            type: 'string',
            nullable: true,
            description: 'Observações gerais sobre a fazenda',
          },
          movimentaLCDPR: {
            type: 'boolean',
            default: false,
            description: 'Se a fazenda movimenta LCDPR',
          },
          movimentaGado: {
            type: 'boolean',
            default: false,
            description: 'Se a fazenda movimenta gado',
          },
        },
      },
      UpdateFazendaDto: {
        type: 'object',
        description: 'Todos os campos são opcionais para atualização parcial',
        properties: {
          idPessoa: {
            type: 'integer',
            minimum: 1,
            description: 'ID da pessoa (produtor) proprietária da fazenda',
          },
          descricao: {
            type: 'string',
            minLength: 3,
            maxLength: 255,
            description: 'Descrição/nome da fazenda',
          },
          endereco: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Endereço da fazenda',
          },
          complemento: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Complemento do endereço',
          },
          idMunicipio: {
            type: 'integer',
            minimum: 1,
            description: 'ID do município onde a fazenda está localizada',
          },
          inscricaoEstadual: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Inscrição estadual da fazenda',
          },
          areaTotal: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            description: 'Área total da fazenda em hectares',
          },
          areaCultivada: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            description: 'Área cultivada em hectares',
          },
          reservaLegal: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            description: 'Reserva legal em hectares',
          },
          telefone: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            description: 'Telefone de contato da fazenda',
          },
          gerente: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Nome do gerente da fazenda',
          },
          matricula: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Matrícula do imóvel',
          },
          livro: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Livro da matrícula',
          },
          folha: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Folha da matrícula',
          },
          itr: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'ITR (Imposto Territorial Rural)',
          },
          cei: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'CEI (Cadastro Específico do INSS)',
          },
          lcdprTipoExploracao: {
            type: 'integer',
            enum: [1, 2, 3, 4, 5],
            nullable: true,
            description: 'Tipo de exploração LCDPR',
          },
          lcdprParticipacao: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            maximum: 100,
            description: 'Participação na exploração (percentual)',
          },
          arrendada: {
            type: 'boolean',
            description: 'Se a fazenda é arrendada',
          },
          idPessoaArrendamento: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            description: 'ID da pessoa (arrendador) quando a fazenda é arrendada',
          },
          documento: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Documento do arrendamento',
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Data de início do arrendamento',
          },
          dataFim: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Data de fim do arrendamento',
          },
          observacoes: {
            type: 'string',
            nullable: true,
            description: 'Observações gerais sobre a fazenda',
          },
          movimentaLCDPR: {
            type: 'boolean',
            description: 'Se a fazenda movimenta LCDPR',
          },
          movimentaGado: {
            type: 'boolean',
            description: 'Se a fazenda movimenta gado',
          },
        },
      },
      FazendaResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          tenantId: {
            type: 'integer',
            example: 1,
          },
          idPessoa: {
            type: 'integer',
            example: 1,
          },
          descricao: {
            type: 'string',
            example: 'Fazenda Santa Maria',
          },
          endereco: {
            type: 'string',
            nullable: true,
            example: 'Rodovia BR-101, km 45',
          },
          complemento: {
            type: 'string',
            nullable: true,
          },
          idMunicipio: {
            type: 'integer',
            example: 1,
          },
          inscricaoEstadual: {
            type: 'string',
            nullable: true,
          },
          areaTotal: {
            type: 'number',
            format: 'decimal',
            example: 1000.50,
          },
          areaCultivada: {
            type: 'number',
            format: 'decimal',
            example: 800.00,
          },
          reservaLegal: {
            type: 'number',
            format: 'decimal',
            example: 200.50,
          },
          telefone: {
            type: 'string',
            nullable: true,
          },
          gerente: {
            type: 'string',
            nullable: true,
          },
          matricula: {
            type: 'string',
            nullable: true,
          },
          livro: {
            type: 'string',
            nullable: true,
          },
          folha: {
            type: 'string',
            nullable: true,
          },
          itr: {
            type: 'string',
            nullable: true,
          },
          cei: {
            type: 'string',
            nullable: true,
          },
          lcdprTipoExploracao: {
            type: 'integer',
            enum: [1, 2, 3, 4, 5],
            nullable: true,
          },
          lcdprParticipacao: {
            type: 'number',
            format: 'decimal',
            example: 100.00,
          },
          arrendada: {
            type: 'boolean',
            example: false,
          },
          idPessoaArrendamento: {
            type: 'integer',
            nullable: true,
          },
          documento: {
            type: 'string',
            nullable: true,
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            nullable: true,
          },
          dataFim: {
            type: 'string',
            format: 'date',
            nullable: true,
          },
          observacoes: {
            type: 'string',
            nullable: true,
          },
          movimentaLCDPR: {
            type: 'boolean',
            example: true,
          },
          movimentaGado: {
            type: 'boolean',
            example: false,
          },
          usercreation: {
            type: 'integer',
            example: 1,
          },
          datecreation: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T12:00:00.000Z',
          },
          usuarioCriador: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
            },
          },
          pessoa: {
            type: 'object',
            nullable: true,
            properties: {
              id_pessoa: {
                type: 'integer',
                example: 1,
              },
              nomerazao_pessoa: {
                type: 'string',
                nullable: true,
                example: 'João Silva',
              },
              cpfcnpj_pessoa: {
                type: 'string',
                nullable: true,
                example: '12345678901',
              },
            },
          },
          municipio: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'São Paulo',
              },
              idEstado: {
                type: 'integer',
                example: 1,
              },
            },
          },
          pessoaArrendamento: {
            type: 'object',
            nullable: true,
            properties: {
              id_pessoa: {
                type: 'integer',
                example: 1,
              },
              nomerazao_pessoa: {
                type: 'string',
                nullable: true,
                example: 'Maria Santos',
              },
              cpfcnpj_pessoa: {
                type: 'string',
                nullable: true,
                example: '98765432100',
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Autenticação',
      description: 'Endpoints para autenticação e gerenciamento de tokens',
    },
    {
      name: 'Usuários',
      description: 'Gerenciamento de usuários do sistema',
    },
    {
      name: 'Eventos',
      description: 'Gerenciamento de eventos agendados',
    },
    {
      name: 'Locais',
      description: 'Gerenciamento de locais das propriedades',
    },
    {
      name: 'Pessoas',
      description: 'Gerenciamento de pessoas (clientes, fornecedores, etc.)',
    },
    {
      name: 'Grupos de Produto',
      description: 'Gerenciamento de grupos de produtos',
    },
    {
      name: 'Subgrupos de Produto',
      description: 'Gerenciamento de subgrupos de produtos',
    },
          {
            name: 'Princípios Ativos',
            description: 'Gerenciamento de princípios ativos',
          },
          {
            name: 'Unidades de Medida',
            description: 'Gerenciamento de unidades de medida',
          },
          {
            name: 'Moedas',
            description: 'Gerenciamento de moedas',
          },
          {
            name: 'Cotações de Moeda',
            description: 'Gerenciamento de cotações de moeda',
          },
          {
            name: 'Produtos',
            description: 'Gerenciamento de produtos',
          },
          {
            name: 'Culturas',
            description: 'Gerenciamento de culturas',
          },
          {
            name: 'Serviços Agrícolas',
            description: 'Gerenciamento de serviços agrícolas',
          },
          {
            name: 'Plano de Contas Gerencial',
            description: 'Gerenciamento do plano de contas gerencial com estrutura hierárquica',
          },
          {
            name: 'Consultorias',
            description: 'Gerenciamento de consultorias (apenas GOD)',
          },
          {
            name: 'Tenants',
            description: 'Gerenciamento de tenants (CONSULTOR ou GOD)',
          },
          {
            name: 'Estados',
            description: 'Gerenciamento de estados brasileiros (dados globais)',
          },
          {
            name: 'Municípios',
            description: 'Gerenciamento de municípios brasileiros (dados globais)',
          },
          {
            name: 'Centros de Custo',
            description: 'Gerenciamento de centros de custo com hierarquia',
          },
          {
            name: 'Safras',
            description: 'Gerenciamento de safras agrícolas',
          },
          {
            name: 'Fazendas',
            description: 'Gerenciamento de fazendas agrícolas',
          },
          {
            name: 'Lembretes',
            description: 'Gerenciamento de lembretes',
          },
    {
      name: 'Financeiro',
      description: 'Gerenciamento de informações financeiras',
    },
    {
      name: 'Títulos a Pagar',
      description: 'Gerenciamento de títulos a pagar, incluindo parcelas e rateios',
    },
    {
      name: 'Títulos a Receber',
      description: 'Gerenciamento de títulos a receber, incluindo parcelas e rateios',
    },
    {
      name: 'Parcelas',
      description: 'Baixa de parcelas e consulta de movimentos financeiros',
    },
    {
      name: 'Relatórios Financeiros',
      description: 'Relatórios financeiros, incluindo planejado vs realizado',
    },
    {
      name: 'Roles',
      description: 'Gerenciamento de roles (perfis)',
    },
    {
      name: 'Permissões',
      description: 'Gerenciamento de permissões',
    },
    {
      name: 'Auditoria',
      description: 'Consultas de logs de auditoria',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/application/dto/**/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
