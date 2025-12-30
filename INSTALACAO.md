# 🚀 Guia de Instalação e Execução - Portal do Cliente

## 📦 Passo 1: Instalar Dependências

Execute no terminal (na raiz do projeto):

```bash
npm install
```

Isso irá instalar todas as dependências listadas no `package.json`, incluindo:
- @nestjs/mongoose
- @nestjs/jwt
- @nestjs/passport
- @nestjs/cache-manager
- @nestjs/schedule
- mongoose
- bcrypt
- qrcode
- E outras...

## 🔧 Passo 2: Configurar Variáveis de Ambiente

1. **Copie o arquivo de exemplo:**

```bash
cp .env.example .env
```

2. **Edite o arquivo `.env` e configure:**

```env
# MongoDB - OBRIGATÓRIO
PORTAL_CLIENTE_MONGO_URI=mongodb://localhost:27017/portal-cliente

# JWT - OBRIGATÓRIO (use uma chave forte em produção)
PORTAL_CLIENTE_JWT_SECRET=minha-chave-super-secreta-aqui-123456
PORTAL_CLIENTE_JWT_EXPIRES=24h

# Links de Convite
PORTAL_CLIENTE_LINK_EXPIRACAO=1
PORTAL_CLIENTE_BASE_URL=http://localhost:3000

# Webhook Secret (para comunicação com Backend Principal)
PORTAL_CLIENTE_WEBHOOK_SECRET=meu-webhook-secret-compartilhado
```

## 🗄️ Passo 3: Configurar MongoDB

### Opção A: MongoDB Local

1. **Instale o MongoDB** (se ainda não tiver):
   - Ubuntu/Debian: `sudo apt install mongodb`
   - macOS: `brew install mongodb-community`
   - Windows: Baixe do site oficial

2. **Inicie o MongoDB:**
```bash
sudo systemctl start mongodb
# ou
mongod
```

3. **Verifique se está rodando:**
```bash
mongosh
# ou
mongo
```

### Opção B: MongoDB Atlas (Cloud)

1. Crie uma conta gratuita em https://www.mongodb.com/cloud/atlas
2. Crie um cluster
3. Obtenha a string de conexão
4. Atualize `PORTAL_CLIENTE_MONGO_URI` no `.env`:

```env
PORTAL_CLIENTE_MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/portal-cliente?retryWrites=true&w=majority
```

### Opção C: Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## ▶️ Passo 4: Executar a Aplicação

### Modo Desenvolvimento (com hot-reload)

```bash
npm run start:dev
```

A aplicação estará disponível em: **http://localhost:3000**

### Modo Produção

```bash
npm run build
npm run start:prod
```

## ✅ Passo 5: Verificar se Está Funcionando

### 1. Teste o endpoint raiz:

```bash
curl http://localhost:3000
```

### 2. Teste o webhook de criação de condomínio:

```bash
curl -X POST http://localhost:3000/api/portal-cliente/webhooks/condominio-criado \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: meu-webhook-secret-compartilhado" \
  -d '{
    "condominioId": "12345",
    "nome": "Condomínio Teste",
    "cnpj": "12.345.678/0001-90",
    "endereco": "Rua Teste, 123",
    "email": "contato@teste.com"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "condominioId": "..."
}
```

### 3. Crie um usuário admin manualmente (via webhook):

```bash
curl -X POST http://localhost:3000/api/portal-cliente/webhooks/admin-criado \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: meu-webhook-secret-compartilhado" \
  -d '{
    "condominioId": "12345",
    "nome": "Admin Teste",
    "email": "admin@teste.com",
    "senhaTemporaria": "senha123",
    "precisaTrocarSenha": false
  }'
```

### 4. Teste o login:

```bash
curl -X POST http://localhost:3000/api/portal-cliente/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "senha": "senha123",
    "tipoUsuario": "admin"
  }'
```

Resposta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "...",
    "nome": "Admin Teste",
    "email": "admin@teste.com",
    "tipoUsuario": "admin",
    ...
  }
}
```

## 🔍 Verificar Logs

Os logs aparecerão no console onde você executou `npm run start:dev`.

Procure por:
- ✅ `Nest application successfully started`
- ✅ `Mapped {/api/portal-cliente/...}`
- ✅ Conexão com MongoDB estabelecida

## 🐛 Solução de Problemas Comuns

### Erro: "Cannot connect to MongoDB"

**Solução:**
1. Verifique se o MongoDB está rodando: `sudo systemctl status mongodb`
2. Verifique a URI no `.env`
3. Teste a conexão: `mongosh mongodb://localhost:27017`

### Erro: "Port 3000 is already in use"

**Solução:**
1. Altere a porta no `.env`: `PORT=3001`
2. Ou mate o processo que está usando a porta: `lsof -ti:3000 | xargs kill`

### Erro: "Module not found"

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "JWT secret not configured"

**Solução:**
Certifique-se de ter configurado `PORTAL_CLIENTE_JWT_SECRET` no arquivo `.env`

## 📚 Próximos Passos

1. **Criar um morador:**
   - Use o endpoint `POST /api/portal-cliente/admin/moradores` (autenticado como admin)

2. **Testar funcionalidades:**
   - Cadastrar visitantes
   - Cadastrar veículos
   - Gerar links de convite
   - Visualizar histórico

3. **Integrar com Frontend:**
   - Use os endpoints documentados em `PORTAL_CLIENTE_README.md`

## 🔐 Segurança em Produção

⚠️ **IMPORTANTE:** Antes de colocar em produção:

1. ✅ Altere `PORTAL_CLIENTE_JWT_SECRET` para uma chave forte e aleatória
2. ✅ Altere `PORTAL_CLIENTE_WEBHOOK_SECRET` para um valor seguro
3. ✅ Use HTTPS (configure um reverse proxy como Nginx)
4. ✅ Configure rate limiting
5. ✅ Configure CORS adequadamente
6. ✅ Use MongoDB com autenticação habilitada
7. ✅ Faça backup regular do banco de dados

## 📖 Documentação Completa

Consulte o arquivo `PORTAL_CLIENTE_README.md` para:
- Arquitetura detalhada
- Lista completa de endpoints
- Exemplos de uso
- Guia de extração para microserviço

---

**Precisa de ajuda?** Abra uma issue no repositório!
