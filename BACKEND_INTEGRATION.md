# 🔌 Integração Backend API → Remote Concierge

Guia rápido para integrar o Smart Vision Backend API com o Remote Concierge via webhooks.

## 📋 Visão Geral

O Backend API envia webhooks para o Remote Concierge quando há mudanças em:
- ✅ Condomínios
- ✅ Administradores
- ✅ Operadores/Técnicos

## ⚙️ Configuração Inicial

### 1. Variáveis de Ambiente (.env)

```bash
# URL do Remote Concierge
REMOTE_CONCIERGE_URL=http://localhost:9000

# Secret compartilhado para autenticação
WEBHOOK_SECRET=webhook-secret-portal-cliente-2025
```

### 2. Instalar Dependência HTTP

```bash
npm install axios
# ou
yarn add axios
```

## 🚀 Implementação Básica

### Service de Webhooks

Crie o arquivo `src/services/remote-concierge.service.js`:

```javascript
const axios = require('axios');

class RemoteConciergeService {
  constructor() {
    this.baseUrl = process.env.REMOTE_CONCIERGE_URL;
    this.secret = process.env.WEBHOOK_SECRET;
  }

  async sendWebhook(endpoint, data) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/portal-cliente/webhooks/${endpoint}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': this.secret,
          },
          timeout: 10000,
        }
      );

      console.log(`✅ Webhook ${endpoint} enviado com sucesso`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro no webhook ${endpoint}:`, error.message);
      // Não falhar a operação principal por erro no webhook
      return null;
    }
  }

  // Criar condomínio
  async notifyCondominiumCreated(condominio) {
    return this.sendWebhook('condominium-created', {
      condominiumId: condominio._id.toString(),
      name: condominio.nome,
      taxId: condominio.cnpj,
      address: condominio.endereco,
      phone: condominio.telefone,
      email: condominio.email,
      settings: {
        requireVisitorApproval: condominio.aprovarVisitantes || false,
        invitationLinkEnabled: condominio.linkConviteAtivo || true,
        qrCodeEnabled: condominio.qrcodeAtivo || true,
      },
      limits: {
        residents: condominio.limitesMoradores || 500,
        visitors: condominio.limitesVisitantes || 1000,
        vehicles: condominio.limitesVeiculos || 500,
      },
    });
  }

  // Atualizar condomínio
  async notifyCondominiumUpdated(condominio) {
    return this.sendWebhook('condominium-updated', {
      condominiumId: condominio._id.toString(),
      name: condominio.nome,
      taxId: condominio.cnpj,
      address: condominio.endereco,
      phone: condominio.telefone,
      email: condominio.email,
      settings: {
        requireVisitorApproval: condominio.aprovarVisitantes || false,
        invitationLinkEnabled: condominio.linkConviteAtivo || true,
        qrCodeEnabled: condominio.qrcodeAtivo || true,
      },
      limits: {
        residents: condominio.limitesMoradores || 500,
        visitors: condominio.limitesVisitantes || 1000,
        vehicles: condominio.limitesVeiculos || 500,
      },
    });
  }

  // Desativar condomínio
  async notifyCondominiumDeactivated(condominioId) {
    return this.sendWebhook('condominium-deactivated', {
      condominiumId: condominioId.toString(),
    });
  }

  // Criar admin
  async notifyAdminCreated(admin, condominioId, senhaTemporaria) {
    return this.sendWebhook('admin-created', {
      condominiumId: condominioId.toString(),
      name: admin.nome,
      email: admin.email,
      temporaryPassword: senhaTemporaria,
      needsPasswordChange: true,
    });
  }

  // Criar operador/técnico
  async notifyOperatorCreated(operador, condominioId, senhaTemporaria, permissoes, condominiosAtribuidos) {
    return this.sendWebhook('operator-created', {
      condominiumId: condominioId.toString(),
      name: operador.nome,
      email: operador.email,
      userType: operador.tipo, // 'operator' ou 'technician'
      temporaryPassword: senhaTemporaria,
      needsPasswordChange: true,
      permissions: {
        canViewAllCondominiums: permissoes.verTodosCondominios || false,
        canManageVisitors: permissoes.gerenciarVisitantes || true,
        canManageVehicles: permissoes.gerenciarVeiculos || true,
        canViewReports: permissoes.verRelatorios || false,
        canManageAccess: permissoes.gerenciarAcessos || true,
      },
      assignedCondominiums: condominiosAtribuidos.map(c => c.toString()),
    });
  }

  // Atualizar operador/técnico
  async notifyOperatorUpdated(operador, condominioId, permissoes, condominiosAtribuidos) {
    return this.sendWebhook('operator-updated', {
      condominiumId: condominioId.toString(),
      email: operador.email,
      name: operador.nome,
      userType: operador.tipo,
      permissions: {
        canViewAllCondominiums: permissoes.verTodosCondominios || false,
        canManageVisitors: permissoes.gerenciarVisitantes || true,
        canManageVehicles: permissoes.gerenciarVeiculos || true,
        canViewReports: permissoes.verRelatorios || false,
        canManageAccess: permissoes.gerenciarAcessos || true,
      },
      assignedCondominiums: condominiosAtribuidos.map(c => c.toString()),
    });
  }

  // Desativar operador/técnico
  async notifyOperatorDeactivated(email, condominioId) {
    return this.sendWebhook('operator-deactivated', {
      email: email,
      condominiumId: condominioId.toString(),
    });
  }
}

module.exports = new RemoteConciergeService();
```

## 💡 Uso nos Controllers

### Controller de Condomínios

```javascript
const remoteConcierge = require('../services/remote-concierge.service');

// Criar condomínio
async function criarCondominio(req, res) {
  try {
    const condominio = await Condominio.create(req.body);
    
    // Enviar webhook (não bloqueia em caso de erro)
    await remoteConcierge.notifyCondominiumCreated(condominio);
    
    res.status(201).json(condominio);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

// Atualizar condomínio
async function atualizarCondominio(req, res) {
  try {
    const condominio = await Condominio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    await remoteConcierge.notifyCondominiumUpdated(condominio);
    
    res.json(condominio);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

// Desativar condomínio
async function desativarCondominio(req, res) {
  try {
    await Condominio.findByIdAndUpdate(req.params.id, { ativo: false });
    
    await remoteConcierge.notifyCondominiumDeactivated(req.params.id);
    
    res.json({ mensagem: 'Condomínio desativado' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
```

### Controller de Usuários

```javascript
const remoteConcierge = require('../services/remote-concierge.service');

// Gerar senha temporária
function gerarSenhaTemporaria() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let senha = '';
  for (let i = 0; i < 12; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Criar admin
async function criarAdmin(req, res) {
  try {
    const senhaTemporaria = gerarSenhaTemporaria();
    
    const admin = await Usuario.create({
      ...req.body,
      senha: senhaTemporaria,
      tipo: 'admin',
    });
    
    // Webhook
    await remoteConcierge.notifyAdminCreated(
      admin,
      req.body.condominioId,
      senhaTemporaria
    );
    
    // Enviar email com credenciais
    await enviarEmailCredenciais(admin.email, senhaTemporaria);
    
    res.status(201).json({ mensagem: 'Admin criado', email: admin.email });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

// Criar operador/técnico
async function criarOperador(req, res) {
  try {
    const senhaTemporaria = gerarSenhaTemporaria();
    
    const operador = await Usuario.create({
      ...req.body,
      senha: senhaTemporaria,
      tipo: req.body.tipo, // 'operator' ou 'technician'
    });
    
    // Webhook com permissões
    await remoteConcierge.notifyOperatorCreated(
      operador,
      req.body.condominioId,
      senhaTemporaria,
      req.body.permissoes,
      req.body.condominiosAtribuidos
    );
    
    // Enviar email
    await enviarEmailCredenciais(operador.email, senhaTemporaria);
    
    res.status(201).json({ mensagem: 'Operador criado', email: operador.email });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

// Atualizar operador
async function atualizarOperador(req, res) {
  try {
    const operador = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    await remoteConcierge.notifyOperatorUpdated(
      operador,
      operador.condominioId,
      req.body.permissoes,
      req.body.condominiosAtribuidos
    );
    
    res.json(operador);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

// Desativar operador
async function desativarOperador(req, res) {
  try {
    const operador = await Usuario.findById(req.params.id);
    
    await Usuario.findByIdAndUpdate(req.params.id, { ativo: false });
    
    await remoteConcierge.notifyOperatorDeactivated(
      operador.email,
      operador.condominioId
    );
    
    res.json({ mensagem: 'Operador desativado' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
```

## 🧪 Testar Integração

### 1. Verificar se Remote Concierge está rodando

```bash
curl http://localhost:9000/health
```

### 2. Testar webhook manualmente

```bash
curl -X POST http://localhost:9000/api/portal-cliente/webhooks/condominium-created \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: webhook-secret-portal-cliente-2025" \
  -d '{
    "condominiumId": "507f1f77bcf86cd799439011",
    "name": "Teste Condomínio",
    "taxId": "12.345.678/0001-90",
    "address": "Rua Teste, 123",
    "phone": "(11) 98765-4321",
    "email": "teste@condominio.com"
  }'
```

### 3. Verificar logs

Backend API deve mostrar:
```
✅ Webhook condominium-created enviado com sucesso
```

Remote Concierge deve mostrar:
```
[WEBHOOK] Recebido: condominium-created
[WEBHOOK] Processamento concluído
```

## 📊 Endpoints Disponíveis

| Endpoint | Quando usar |
|----------|-------------|
| `condominium-created` | Criar novo condomínio |
| `condominium-updated` | Atualizar dados do condomínio |
| `condominium-deactivated` | Desativar condomínio |
| `admin-created` | Criar administrador |
| `operator-created` | Criar operador ou técnico |
| `operator-updated` | Atualizar permissões/condomínios |
| `operator-deactivated` | Desativar operador/técnico |

## ⚠️ Boas Práticas

### 1. Tratamento de Erros

```javascript
async sendWebhook(endpoint, data) {
  try {
    const response = await axios.post(...);
    return response.data;
  } catch (error) {
    console.error(`Erro no webhook ${endpoint}:`, error.message);
    
    // Log para monitoramento
    await logWebhookError(endpoint, data, error);
    
    // Não falhar operação principal
    return null;
  }
}
```

### 2. Retry com Backoff

```javascript
async sendWebhookWithRetry(endpoint, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.sendWebhook(endpoint, data);
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`Webhook ${endpoint} falhou após ${maxRetries} tentativas`);
  return null;
}
```

### 3. Validação de Dados

```javascript
// Validar antes de enviar webhook
if (!condominio._id || !condominio.nome || !condominio.email) {
  console.error('Dados incompletos para webhook');
  return;
}

await remoteConcierge.notifyCondominiumCreated(condominio);
```

### 4. Logs Estruturados

```javascript
console.log({
  timestamp: new Date().toISOString(),
  event: 'webhook_sent',
  endpoint: 'condominium-created',
  condominiumId: condominio._id.toString(),
  status: 'success',
});
```

## 🔒 Segurança

### Checklist

- ✅ Sempre enviar header `x-webhook-secret`
- ✅ Usar HTTPS em produção
- ✅ Não expor dados sensíveis nos logs
- ✅ Timeout de 10 segundos nas requisições
- ✅ Validar resposta do webhook
- ✅ Armazenar secret em variável de ambiente

### Produção

```bash
# .env.production
REMOTE_CONCIERGE_URL=https://remote-concierge.smartvision.com.br
WEBHOOK_SECRET=seu-secret-forte-aqui-min-32-caracteres
```

## 📞 Suporte

- 📄 Documentação completa: `INTEGRATION.md`
- 🌐 Swagger: http://localhost:9000/api
- 📧 Email: suporte.vigiae@gmail.com

---

**Versão:** 1.0  
**Data:** 30/12/2025
