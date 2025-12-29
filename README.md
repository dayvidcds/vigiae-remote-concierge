# Vigiae Remote Concierge

Módulo de Portal do Cliente (Portaria Remota), que permite que condomínios e moradores gerenciem visitantes, veículos e acessos de forma autônoma.

## Descrição

API desenvolvida com NestJS para gerenciar o portal do cliente de portaria remota. O sistema permite que condomínios e moradores realizem:
- Gerenciamento de visitantes
- Controle de veículos
- Gerenciamento de acessos
- Autorização de entrada

## Tecnologias

- [NestJS](https://nestjs.com/) - Framework Node.js progressivo
- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [Swagger](https://swagger.io/) - Documentação da API
- [Jest](https://jestjs.io/) - Framework de testes

## Requisitos

- Node.js >= 18.x
- npm >= 9.x

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de variáveis de ambiente
cp .env.example .env
```

## Configuração

Edite o arquivo `.env` com as configurações do seu ambiente:

```env
PORT=3000
NODE_ENV=development
```

## Execução

```bash
# Desenvolvimento
npm run start:dev

# Modo debug
npm run start:debug

# Produção
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`

## Documentação da API

Após iniciar a aplicação, a documentação Swagger estará disponível em:
- http://localhost:3000/api

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov

# Testes em modo watch
npm run test:watch
```

## Lint e Formatação

```bash
# Executar linting
npm run lint

# Formatar código
npm run format
```

## Estrutura do Projeto

```
vigiae-remote-concierge/
├── src/
│   ├── app.controller.ts      # Controller principal
│   ├── app.controller.spec.ts # Testes do controller
│   ├── app.module.ts           # Módulo principal
│   ├── app.service.ts          # Service principal
│   └── main.ts                 # Ponto de entrada da aplicação
├── test/
│   ├── app.e2e-spec.ts        # Testes end-to-end
│   └── jest-e2e.json          # Configuração Jest para e2e
├── dist/                       # Build da aplicação
├── node_modules/               # Dependências
├── .env.example                # Exemplo de variáveis de ambiente
├── eslint.config.js           # Configuração ESLint
├── .prettierrc                # Configuração Prettier
├── jest.config.js             # Configuração Jest
├── nest-cli.json              # Configuração NestJS CLI
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
└── tsconfig.build.json        # Configuração TypeScript para build
```

## Scripts Disponíveis

- `npm run build` - Compila o projeto
- `npm run start` - Inicia a aplicação
- `npm run start:dev` - Inicia em modo desenvolvimento com watch
- `npm run start:debug` - Inicia em modo debug
- `npm run start:prod` - Inicia em modo produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código
- `npm run test` - Executa testes unitários
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:cov` - Executa testes com cobertura
- `npm run test:e2e` - Executa testes end-to-end

## Licença

MIT
