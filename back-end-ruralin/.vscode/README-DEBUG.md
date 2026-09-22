# Configuração de Debug

Este projeto está configurado para debug no VS Code com breakpoints.

## Como Usar

### Opção 1: Debug com TypeScript (Recomendado)

1. Abra o VS Code no diretório do projeto
2. Vá para a aba **Run and Debug** (Ctrl+Shift+D)
3. Selecione **"Debug: Server (TypeScript)"** no dropdown
4. Clique no botão **Play** (F5) ou pressione **F5**

Este modo:
- ✅ Executa TypeScript diretamente (sem compilar)
- ✅ Breakpoints funcionam imediatamente
- ✅ Mais rápido para desenvolvimento
- ✅ Hot reload automático (se configurado)

### Opção 2: Debug com JavaScript Compilado

1. Abra o VS Code no diretório do projeto
2. Vá para a aba **Run and Debug** (Ctrl+Shift+D)
3. Selecione **"Debug: Server (Compiled)"** no dropdown
4. Clique no botão **Play** (F5) ou pressione **F5**

Este modo:
- ✅ Compila TypeScript antes de executar
- ✅ Usa o código compilado em `dist/`
- ✅ Mais próximo do ambiente de produção

### Opção 3: Attach to Process

Para anexar o debugger a um processo Node.js já em execução:

1. Inicie o servidor com debug habilitado:
   ```bash
   node --inspect=9229 -r ts-node/register src/server.ts
   ```

2. No VS Code, selecione **"Attach to Process"** e pressione F5

## Configurações Disponíveis

### Debug: Server (TypeScript)
- **Tipo**: Launch
- **Runtime**: Node.js com ts-node
- **Arquivo**: `src/server.ts`
- **Source Maps**: Habilitado

### Debug: Server (Compiled)
- **Tipo**: Launch
- **Runtime**: Node.js
- **Arquivo**: `dist/server.js`
- **Pre-launch Task**: Build (compila antes de executar)
- **Source Maps**: Habilitado

### Attach to Process
- **Tipo**: Attach
- **Porta**: 9229
- **Restart**: Habilitado

## Breakpoints

Para usar breakpoints:

1. Abra qualquer arquivo TypeScript em `src/`
2. Clique na margem esquerda ao lado do número da linha para adicionar um breakpoint
3. Inicie o debug (F5)
4. O código pausará no breakpoint quando a linha for executada

## Variáveis e Watch

Durante o debug, você pode:

- **Ver variáveis**: Painel "Variables" mostra todas as variáveis no escopo atual
- **Watch expressions**: Adicione expressões para monitorar no painel "Watch"
- **Call Stack**: Veja a pilha de chamadas no painel "Call Stack"
- **Debug Console**: Execute código JavaScript no contexto atual

## Troubleshooting

### Breakpoints não funcionam

1. Verifique se está usando a configuração correta (TypeScript ou Compiled)
2. Certifique-se de que os source maps estão habilitados
3. Tente limpar o cache: `npm run build` e reinicie o debug

### Erro "Cannot find module"

1. Certifique-se de que todas as dependências estão instaladas: `npm install`
2. Verifique se o `tsconfig.json` está correto
3. Tente usar a configuração "Compiled" ao invés de "TypeScript"

### Porta já em uso

Se a porta 9229 estiver em uso:
1. Feche outros processos Node.js em debug
2. Ou altere a porta no `launch.json`

## Atalhos Úteis

- **F5**: Iniciar/Continuar debug
- **F9**: Adicionar/Remover breakpoint
- **F10**: Step Over (próxima linha)
- **F11**: Step Into (entrar na função)
- **Shift+F11**: Step Out (sair da função)
- **Shift+F5**: Parar debug
- **Ctrl+Shift+F5**: Reiniciar debug
