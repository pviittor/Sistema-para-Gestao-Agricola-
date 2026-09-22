/**
 * Script de teste para API de GrupoProduto
 * 
 * Este script testa todas as operações CRUD do GrupoProduto:
 * 1. Login e obtenção do token
 * 2. Lista grupos de produto
 * 3. Cria um novo grupo de produto
 * 4. Atualiza o grupo criado
 * 5. Remove o grupo criado
 * 
 * Uso:
 *   ts-node scripts/test-grupo-produto.ts
 * 
 * Variáveis de ambiente:
 *   API_URL - URL base da API (padrão: http://localhost:3000)
 *   LOGIN_EMAIL - Email do usuário para login (padrão: admin@example.com)
 *   LOGIN_PASSWORD - Senha do usuário (padrão: admin123)
 */

import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || 'admin@example.com';
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'admin123';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    nome: string;
    apiUrl?: string;
  };
  token: string;
  refreshToken: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface GrupoProduto {
  id: number;
  tenantId: number;
  descricao_grupo: string;
  abreviacao_grupo?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: GrupoProduto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Faz login e retorna o token de autenticação
 */
async function login(): Promise<string> {
  console.log('\n🔐 Fazendo login...');
  console.log(`   Email: ${LOGIN_EMAIL}`);
  console.log(`   URL: ${API_URL}/api/auth/login`);

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: LOGIN_EMAIL,
        senha: LOGIN_PASSWORD,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorData.message || 'Falha no login');
    }

    const data: AuthResponse = await response.json();

    if (!data.token) {
      throw new Error('Token não retornado na resposta');
    }

    console.log('✅ Login realizado com sucesso!');
    console.log(`   Usuário: ${data.user.nome} (${data.user.email})`);
    console.log(`   Token obtido: ${data.token.substring(0, 20)}...`);
    
    return data.token;
  } catch (error: any) {
    console.error('❌ Erro ao fazer login:', error.message);
    throw error;
  }
}

/**
 * Lista todos os grupos de produto
 */
async function listarGruposProduto(token: string): Promise<GrupoProduto[]> {
  console.log('\n📋 Listando grupos de produto...');
  console.log(`   URL: ${API_URL}/api/gruposProduto`);

  try {
    const response = await fetch(`${API_URL}/api/gruposProduto?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: ApiResponse<PaginatedResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Falha ao listar grupos de produto');
    }

    console.log(`✅ ${data.data?.total || 0} grupo(s) de produto encontrado(s)`);
    
    if (data.data?.data) {
      data.data.data.forEach((grupo, index) => {
        console.log(`   ${index + 1}. ID: ${grupo.id} - ${grupo.descricao_grupo} (${grupo.abreviacao_grupo || 'sem abreviação'})`);
      });
    }

    return data.data?.data || [];
  } catch (error: any) {
    console.error('❌ Erro ao listar grupos de produto:', error.message);
    throw error;
  }
}

/**
 * Cria um novo grupo de produto
 */
async function criarGrupoProduto(token: string): Promise<GrupoProduto> {
  console.log('\n➕ Criando novo grupo de produto...');
  console.log(`   URL: ${API_URL}/api/gruposProduto`);

  const novoGrupo = {
    descricao_grupo: `Grupo Teste ${Date.now()}`,
    abreviacao_grupo: 'GT',
  };

  console.log(`   Dados: ${JSON.stringify(novoGrupo, null, 2)}`);

  try {
    const response = await fetch(`${API_URL}/api/gruposProduto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novoGrupo),
    });

    const data: ApiResponse<GrupoProduto> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error?.message || 'Falha ao criar grupo de produto');
    }

    console.log('✅ Grupo de produto criado com sucesso!');
    console.log(`   ID: ${data.data.id}`);
    console.log(`   Descrição: ${data.data.descricao_grupo}`);
    console.log(`   Abreviação: ${data.data.abreviacao_grupo || 'N/A'}`);

    return data.data;
  } catch (error: any) {
    console.error('❌ Erro ao criar grupo de produto:', error.message);
    if (error.message.includes('details')) {
      console.error('   Detalhes:', JSON.stringify(error.details, null, 2));
    }
    throw error;
  }
}

/**
 * Atualiza um grupo de produto existente
 */
async function atualizarGrupoProduto(token: string, id: number): Promise<GrupoProduto> {
  console.log(`\n✏️  Atualizando grupo de produto ID: ${id}...`);
  console.log(`   URL: ${API_URL}/api/gruposProduto/${id}`);

  const dadosAtualizacao = {
    descricao_grupo: `Grupo Teste Atualizado ${Date.now()}`,
    abreviacao_grupo: 'GTA',
  };

  console.log(`   Dados: ${JSON.stringify(dadosAtualizacao, null, 2)}`);

  try {
    const response = await fetch(`${API_URL}/api/gruposProduto/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosAtualizacao),
    });

    const data: ApiResponse<GrupoProduto> = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error?.message || 'Falha ao atualizar grupo de produto');
    }

    console.log('✅ Grupo de produto atualizado com sucesso!');
    console.log(`   ID: ${data.data.id}`);
    console.log(`   Nova Descrição: ${data.data.descricao_grupo}`);
    console.log(`   Nova Abreviação: ${data.data.abreviacao_grupo || 'N/A'}`);

    return data.data;
  } catch (error: any) {
    console.error('❌ Erro ao atualizar grupo de produto:', error.message);
    throw error;
  }
}

/**
 * Remove um grupo de produto
 */
async function removerGrupoProduto(token: string, id: number): Promise<void> {
  console.log(`\n🗑️  Removendo grupo de produto ID: ${id}...`);
  console.log(`   URL: ${API_URL}/api/gruposProduto/${id}`);

  try {
    const response = await fetch(`${API_URL}/api/gruposProduto/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      console.log('✅ Grupo de produto removido com sucesso!');
      return;
    }

    const data: ApiResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Falha ao remover grupo de produto');
    }

    console.log('✅ Grupo de produto removido com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao remover grupo de produto:', error.message);
    throw error;
  }
}

/**
 * Função principal que executa todos os testes
 */
async function main() {
  console.log('🚀 Iniciando testes da API de GrupoProduto');
  console.log('=' .repeat(60));

  let token: string | null = null;
  let grupoCriadoId: number | null = null;

  try {
    // 1. Login
    token = await login();

    // 2. Listar grupos de produto
    await listarGruposProduto(token);

    // 3. Criar novo grupo de produto
    const grupoCriado = await criarGrupoProduto(token);
    grupoCriadoId = grupoCriado.id;

    // 4. Listar novamente para verificar o novo grupo
    console.log('\n📋 Listando grupos de produto novamente...');
    await listarGruposProduto(token);

    // 5. Atualizar o grupo criado
    await atualizarGrupoProduto(token, grupoCriadoId);

    // 6. Listar novamente para verificar a atualização
    console.log('\n📋 Listando grupos de produto após atualização...');
    await listarGruposProduto(token);

    // 7. Remover o grupo criado
    await removerGrupoProduto(token, grupoCriadoId);

    // 8. Listar novamente para confirmar a remoção
    console.log('\n📋 Listando grupos de produto após remoção...');
    await listarGruposProduto(token);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Todos os testes foram executados com sucesso!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ Erro durante a execução dos testes:', error.message);
    console.log('='.repeat(60));
    
    // Tentar limpar o grupo criado se ainda existir
    if (token && grupoCriadoId) {
      console.log('\n🧹 Tentando limpar grupo criado...');
      try {
        await removerGrupoProduto(token, grupoCriadoId);
      } catch (cleanupError) {
        console.error('⚠️  Não foi possível limpar o grupo criado');
      }
    }
    
    process.exit(1);
  }
}

// Executar o script
main().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
