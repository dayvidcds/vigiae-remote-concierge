# 🎨 API Documentation - Frontend Integration

## 📋 Overview

Complete API documentation for frontend integration with the Portal Cliente (Vigiae Remote Concierge). This system provides self-service portal for condominiums, residents, and administrators to manage visitors, vehicles, and access control.

**Base URL:** `http://localhost:9000/api/portal-cliente`

**API Documentation (Swagger):** `http://localhost:9000/api`

---

## 🔐 Authentication

### Login

Authenticate users (residents or admins) to obtain JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "joao.silva@email.com",
  "senha": "senha123",
  "tipoUsuario": "morador"
}
```

**Response Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "60d21b4667d0d8992e610c85",
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "tipoUsuario": "morador",
    "condominioId": "60d21b4667d0d8992e610c80",
    "condominioNome": "Residencial Vista Alegre",
    "unidade": "301",
    "codigoAcesso": "MOR-301-ABC123",
    "precisaTrocarSenha": false
  }
}
```

**Frontend Example (React + Axios):**
```typescript
import axios from 'axios';

interface LoginCredentials {
  email: string;
  senha: string;
  tipoUsuario: 'morador' | 'admin';
}

async function login(credentials: LoginCredentials) {
  try {
    const response = await axios.post(
      'http://localhost:9000/api/portal-cliente/auth/login',
      credentials
    );
    
    // Store token in localStorage or secure storage
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.usuario));
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Email ou senha incorretos');
    }
    throw error;
  }
}
```

**Frontend Example (Vue 3 + Composition API):**
```typescript
import { ref } from 'vue';
import axios from 'axios';

export function useAuth() {
  const user = ref(null);
  const token = ref(localStorage.getItem('accessToken'));

  async function login(email: string, senha: string, tipoUsuario: 'morador' | 'admin') {
    const { data } = await axios.post('/api/portal-cliente/auth/login', {
      email,
      senha,
      tipoUsuario
    });
    
    token.value = data.accessToken;
    user.value = data.usuario;
    
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    
    return data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  return { user, token, login, logout };
}
```

---

### Change Password

Change user password after login.

**Endpoint:** `POST /auth/change-password`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "senhaAtual": "senhaAntiga123",
  "novaSenha": "novaSenha456"
}
```

**Response Success (200):**
```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

---

## 🏠 Resident Endpoints

All resident endpoints require authentication with `@Roles('resident')`.

### Get Dashboard

Get resident dashboard with summary statistics.

**Endpoint:** `GET /resident/dashboard`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "visitantesAtivos": 3,
  "veiculosCadastrados": 2,
  "acessosMes": 45,
  "visitantes": [
    {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "Maria Santos",
      "document": "123.456.789-00",
      "phone": "(11) 98765-4321",
      "validUntil": "2025-12-31T23:59:59.000Z",
      "accessSchedule": "09:00 - 18:00",
      "active": true,
      "createdAt": "2025-12-01T10:00:00.000Z"
    }
  ],
  "acessosRecentes": [
    {
      "_id": "60d21b4667d0d8992e610c95",
      "personType": "visitor",
      "personName": "Maria Santos",
      "accessType": "entry",
      "timestamp": "2025-12-29T14:30:00.000Z"
    }
  ]
}
```

**Frontend Example:**
```typescript
async function getDashboard() {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(
    'http://localhost:9000/api/portal-cliente/resident/dashboard',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
}
```

---

### Get QR Code

Get resident's QR code for access.

**Endpoint:** `GET /resident/qrcode`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "codigo": "MOR-301-ABC123",
  "qrcodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "tipo": "resident",
  "nome": "João Silva",
  "unidade": "301"
}
```

**Frontend Example (React Component):**
```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QRCodeCard() {
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQRCode() {
      try {
        const token = localStorage.getItem('accessToken');
        const { data } = await axios.get(
          'http://localhost:9000/api/portal-cliente/resident/qrcode',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQRCode(data);
      } catch (error) {
        console.error('Error loading QR code:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchQRCode();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!qrCode) return <div>QR Code not available</div>;

  return (
    <div className="qr-code-card">
      <h3>Access QR Code</h3>
      <img src={qrCode.qrcodeBase64} alt="QR Code" />
      <p>Code: {qrCode.codigo}</p>
      <p>Unit: {qrCode.unidade}</p>
    </div>
  );
}
```

---

## 👥 Visitors Management

### List All Visitors

Get all visitors registered by the resident.

**Endpoint:** `GET /resident/visitors`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c90",
    "residentId": "60d21b4667d0d8992e610c85",
    "name": "Maria Santos",
    "document": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "validUntil": "2025-12-31T23:59:59.000Z",
    "accessSchedule": "09:00 - 18:00",
    "notes": "Entregador autorizado",
    "active": true,
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-01T10:00:00.000Z"
  }
]
```

---

### List Active Visitors

Get only active (not expired) visitors.

**Endpoint:** `GET /resident/visitors/active`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** Same format as List All Visitors, filtered by active status.

---

### Get Visitor by ID

Get specific visitor details.

**Endpoint:** `GET /resident/visitors/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "_id": "60d21b4667d0d8992e610c90",
  "residentId": "60d21b4667d0d8992e610c85",
  "name": "Maria Santos",
  "document": "123.456.789-00",
  "phone": "(11) 98765-4321",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "accessSchedule": "09:00 - 18:00",
  "notes": "Entregador autorizado",
  "active": true,
  "createdAt": "2025-12-01T10:00:00.000Z",
  "updatedAt": "2025-12-01T10:00:00.000Z"
}
```

---

### Create Visitor

Register a new visitor.

**Endpoint:** `POST /resident/visitors`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "Maria Santos",
  "documento": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "dataValidade": "2025-12-31T23:59:59.000Z",
  "horarioAcesso": "09:00 - 18:00",
  "observacoes": "Entregador autorizado"
}
```

**Validation Rules:**
- `nome`: Required, min 3 characters
- `documento`: Required (CPF format)
- `telefone`: Optional, format: (XX) XXXXX-XXXX
- `dataValidade`: Required, must be future date
- `horarioAcesso`: Optional
- `observacoes`: Optional

**Response Success (201):**
```json
{
  "_id": "60d21b4667d0d8992e610c90",
  "residentId": "60d21b4667d0d8992e610c85",
  "name": "Maria Santos",
  "document": "12345678900",
  "phone": "(11) 98765-4321",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "accessSchedule": "09:00 - 18:00",
  "notes": "Entregador autorizado",
  "active": true,
  "createdAt": "2025-12-29T10:00:00.000Z"
}
```

**Frontend Example (React Form):**
```tsx
import { useState } from 'react';
import axios from 'axios';

function CreateVisitorForm() {
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    dataValidade: '',
    horarioAcesso: '',
    observacoes: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://localhost:9000/api/portal-cliente/resident/visitors',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      alert('Visitor registered successfully!');
      console.log(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        alert('Validation error: ' + error.response.data.message);
      } else {
        alert('Error registering visitor');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.nome}
        onChange={(e) => setFormData({...formData, nome: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Document (CPF)"
        value={formData.documento}
        onChange={(e) => setFormData({...formData, documento: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.telefone}
        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
      />
      <input
        type="datetime-local"
        value={formData.dataValidade}
        onChange={(e) => setFormData({...formData, dataValidade: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Access Schedule (e.g., 09:00 - 18:00)"
        value={formData.horarioAcesso}
        onChange={(e) => setFormData({...formData, horarioAcesso: e.target.value})}
      />
      <textarea
        placeholder="Notes"
        value={formData.observacoes}
        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
      />
      <button type="submit">Register Visitor</button>
    </form>
  );
}
```

---

### Update Visitor

Update visitor information.

**Endpoint:** `PUT /resident/visitors/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "nome": "Maria Santos Updated",
  "telefone": "(11) 99999-9999",
  "dataValidade": "2026-01-31T23:59:59.000Z",
  "observacoes": "Updated notes"
}
```

**Response Success (200):** Updated visitor object

---

### Delete Visitor

Soft delete (deactivate) a visitor.

**Endpoint:** `DELETE /resident/visitors/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "mensagem": "Visitor removed successfully"
}
```

---

## 🚗 Vehicles Management

### List All Vehicles

Get all vehicles registered by the resident.

**Endpoint:** `GET /resident/vehicles`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c91",
    "residentId": "60d21b4667d0d8992e610c85",
    "type": "car",
    "plate": "ABC1234",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Prata",
    "year": 2023,
    "fuel": "Flex",
    "notes": "Carro principal",
    "active": true,
    "createdAt": "2025-12-01T10:00:00.000Z"
  }
]
```

---

### Get Vehicle by ID

Get specific vehicle details.

**Endpoint:** `GET /resident/vehicles/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):** Single vehicle object

---

### Create Vehicle

Register a new vehicle.

**Endpoint:** `POST /resident/vehicles`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "tipo": "car",
  "placa": "ABC1234",
  "marca": "Toyota",
  "modelo": "Corolla",
  "cor": "Prata",
  "ano": 2023,
  "combustivel": "Flex",
  "observacoes": "Carro principal"
}
```

**Vehicle Types:**
- `car` - Carro
- `motorcycle` - Moto
- `truck` - Caminhão

**Validation Rules:**
- `tipo`: Required, must be one of the vehicle types
- `placa`: Required
- `marca`: Required
- `modelo`: Required
- `cor`: Required
- `ano`: Optional, must be between 1900 and current year + 1

**Response Success (201):** Created vehicle object

---

### Update Vehicle

Update vehicle information.

**Endpoint:** `PUT /resident/vehicles/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "cor": "Azul",
  "observacoes": "Cor alterada"
}
```

**Response Success (200):** Updated vehicle object

---

### Delete Vehicle

Soft delete (deactivate) a vehicle.

**Endpoint:** `DELETE /resident/vehicles/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "mensagem": "Vehicle removed successfully"
}
```

---

## 📜 Access History

### Get Resident History

Get access history for the resident.

**Endpoint:** `GET /resident/history`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response Success (200):**
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c95",
      "condominiumId": "60d21b4667d0d8992e610c80",
      "personType": "visitor",
      "personId": "60d21b4667d0d8992e610c90",
      "personName": "Maria Santos",
      "accessType": "entry",
      "timestamp": "2025-12-29T14:30:00.000Z",
      "location": "Portaria Principal",
      "method": "qrcode",
      "notes": "Acesso autorizado",
      "createdAt": "2025-12-29T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Frontend Example:**
```typescript
async function getAccessHistory(page = 1, limit = 20) {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(
    'http://localhost:9000/api/portal-cliente/resident/history',
    {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
}
```

---

## 🔗 Invitation Links

### Create Invitation Link

Create a shareable invitation link for visitors.

**Endpoint:** `POST /resident/invitation-links`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "dataValidade": "2025-12-31T23:59:59.000Z",
  "maxUsos": 5,
  "visitantes": [
    {
      "nome": "João Silva",
      "documento": "123.456.789-00"
    },
    {
      "nome": "Maria Santos",
      "documento": "987.654.321-00"
    }
  ]
}
```

**Validation Rules:**
- `dataValidade`: Required, must be future date
- `maxUsos`: Optional, min 1, default 1
- `visitantes`: Required, min 1 visitor
- Each visitor must have `nome` (min 3 chars) and `documento`

**Response Success (201):**
```json
{
  "_id": "60d21b4667d0d8992e610c96",
  "residentId": "60d21b4667d0d8992e610c85",
  "token": "abc123def456",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "maxUses": 5,
  "currentUses": 0,
  "visitors": [
    {
      "nome": "João Silva",
      "documento": "123.456.789-00"
    }
  ],
  "active": true,
  "linkUrl": "http://localhost:9000/api/portal-cliente/invitation/abc123def456",
  "createdAt": "2025-12-29T10:00:00.000Z"
}
```

---

### List Invitation Links

Get all invitation links created by the resident.

**Endpoint:** `GET /resident/invitation-links`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c96",
    "residentId": "60d21b4667d0d8992e610c85",
    "token": "abc123def456",
    "validUntil": "2025-12-31T23:59:59.000Z",
    "maxUses": 5,
    "currentUses": 2,
    "visitors": [...],
    "active": true,
    "linkUrl": "http://localhost:9000/api/portal-cliente/invitation/abc123def456",
    "createdAt": "2025-12-29T10:00:00.000Z"
  }
]
```

---

### Delete Invitation Link

Deactivate an invitation link.

**Endpoint:** `DELETE /resident/invitation-links/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "mensagem": "Link desativado com sucesso"
}
```

---

### Get Invitation Details (Public)

Get invitation link details (no authentication required).

**Endpoint:** `GET /invitation/:token`

**Response Success (200):**
```json
{
  "token": "abc123def456",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "maxUses": 5,
  "currentUses": 2,
  "visitors": [
    {
      "nome": "João Silva",
      "documento": "123.456.789-00"
    }
  ],
  "available": true
}
```

---

### Register via Invitation Link (Public)

Register a visitor using an invitation link (no authentication required).

**Endpoint:** `POST /invitation/:token/register`

**Request Body:**
```json
{
  "nome": "João Silva",
  "documento": "123.456.789-00",
  "telefone": "(11) 98765-4321"
}
```

**Response Success (201):**
```json
{
  "_id": "60d21b4667d0d8992e610c97",
  "name": "João Silva",
  "document": "12345678900",
  "phone": "(11) 98765-4321",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "active": true,
  "createdAt": "2025-12-29T15:00:00.000Z"
}
```

---

## 👨‍💼 Admin Endpoints

All admin endpoints require authentication with `@Roles('admin')`.

### Get Admin Dashboard

Get admin dashboard with condominium statistics.

**Endpoint:** `GET /admin/dashboard`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "condominio": {
    "_id": "60d21b4667d0d8992e610c80",
    "name": "Residencial Vista Alegre",
    "address": "Rua das Flores, 123",
    "phone": "(11) 3333-4444",
    "active": true
  },
  "estatisticas": {
    "totalResidents": 150,
    "totalVisitors": 45,
    "totalVehicles": 200,
    "accessesToday": 87,
    "accessesMonth": 2340
  },
  "moradores": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "João Silva",
      "email": "joao@email.com",
      "unit": "301",
      "active": true
    }
  ],
  "acessosRecentes": [...]
}
```

---

### List Residents

Get paginated list of residents.

**Endpoint:** `GET /admin/residents`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or unit

**Response Success (200):**
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "condominiumId": "60d21b4667d0d8992e610c80",
      "name": "João Silva",
      "email": "joao@email.com",
      "userType": "resident",
      "unit": "301",
      "phone": "(11) 98765-4321",
      "document": "12345678900",
      "accessCode": "MOR-301-ABC123",
      "active": true,
      "createdAt": "2025-12-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### Get Resident by ID

Get specific resident details.

**Endpoint:** `GET /admin/residents/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):** Single resident object

---

### Create Resident

Register a new resident.

**Endpoint:** `POST /admin/residents`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "tipoUsuario": "resident",
  "unidade": "301",
  "telefone": "(11) 98765-4321",
  "cpf": "123.456.789-00"
}
```

**Response Success (201):** Created resident object

---

### Update Resident

Update resident information.

**Endpoint:** `PUT /admin/residents/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "nome": "João Silva Updated",
  "telefone": "(11) 99999-9999",
  "ativo": true
}
```

**Response Success (200):** Updated resident object

---

### Delete Resident

Deactivate a resident.

**Endpoint:** `DELETE /admin/residents/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response Success (200):**
```json
{
  "mensagem": "User deactivated successfully"
}
```

---

### Get Admin History

Get access history for the entire condominium.

**Endpoint:** `GET /admin/history`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `dataInicio` (optional): Start date filter (ISO 8601)
- `dataFim` (optional): End date filter (ISO 8601)

**Response Success (200):** Same format as resident history

---

## 🚨 Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error | Server error |

### Frontend Error Handling Example

```typescript
import axios, { AxiosError } from 'axios';

async function apiCall() {
  try {
    const response = await axios.get('/api/endpoint');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{message: string}>;
      
      switch (axiosError.response?.status) {
        case 401:
          // Redirect to login
          window.location.href = '/login';
          break;
        case 403:
          alert('You do not have permission to perform this action');
          break;
        case 404:
          alert('Resource not found');
          break;
        case 400:
          alert('Validation error: ' + axiosError.response?.data.message);
          break;
        default:
          alert('An error occurred. Please try again.');
      }
    }
    throw error;
  }
}
```

---

## 🔧 Axios Configuration

### Global Axios Instance

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9000/api/portal-cliente',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Example

```typescript
import api from './api';

// Login
const loginResponse = await api.post('/auth/login', {
  email: 'user@email.com',
  senha: 'password',
  tipoUsuario: 'morador'
});

// Get dashboard
const dashboard = await api.get('/resident/dashboard');

// Create visitor
const visitor = await api.post('/resident/visitors', {
  nome: 'Maria Santos',
  documento: '123.456.789-00',
  dataValidade: '2025-12-31T23:59:59.000Z'
});
```

---

## 📱 React Query Integration

### Setup React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Custom Hooks

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Get Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/resident/dashboard');
      return data;
    },
  });
}

// Get Visitors
export function useVisitors() {
  return useQuery({
    queryKey: ['visitors'],
    queryFn: async () => {
      const { data } = await api.get('/resident/visitors');
      return data;
    },
  });
}

// Create Visitor
export function useCreateVisitor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitorData) => {
      const { data } = await api.post('/resident/visitors', visitorData);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch visitors list
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
}

// Delete Visitor
export function useDeleteVisitor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitorId: string) => {
      const { data } = await api.delete(`/resident/visitors/${visitorId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
}
```

### Component Usage

```tsx
import { useDashboard, useVisitors, useCreateVisitor } from './hooks';

function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div>Active Visitors: {dashboard.visitantesAtivos}</div>
        <div>Vehicles: {dashboard.veiculosCadastrados}</div>
        <div>Access This Month: {dashboard.acessosMes}</div>
      </div>
    </div>
  );
}

function VisitorsList() {
  const { data: visitors } = useVisitors();
  const deleteVisitor = useDeleteVisitor();
  
  return (
    <ul>
      {visitors?.map((visitor) => (
        <li key={visitor._id}>
          {visitor.name}
          <button onClick={() => deleteVisitor.mutate(visitor._id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 🎯 Best Practices

### 1. Token Management

- Store JWT token in `localStorage` or `sessionStorage`
- Include token in all authenticated requests
- Handle token expiration gracefully
- Clear token on logout

### 2. Error Handling

- Implement global error handler
- Show user-friendly error messages
- Log errors for debugging
- Handle network errors

### 3. Loading States

- Show loading indicators
- Disable forms during submission
- Prevent double submissions
- Use optimistic updates when appropriate

### 4. Data Validation

- Validate on frontend before API call
- Follow DTO validation rules
- Show clear validation messages
- Format data correctly (dates, phone numbers, etc.)

### 5. Security

- Never store sensitive data in localStorage
- Use HTTPS in production
- Implement CSRF protection
- Sanitize user inputs

---

## 📞 Support

For integration questions or issues:
- Email: suporte.vigiae@gmail.com
- Swagger Documentation: http://localhost:9000/api
- Backend Integration: See INTEGRATION.md

---

**Last Updated:** December 29, 2025
