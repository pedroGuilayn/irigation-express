# 🌱 API GraphQL - Sistema de Irrigação Inteligente

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![GraphQL](https://img.shields.io/badge/GraphQL-16.8-E10098)
![Apollo Server](https://img.shields.io/badge/Apollo%20Server-3.13-311C87)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248)
![License](https://img.shields.io/badge/license-MIT-blue)

API GraphQL completa para gerenciamento de sistemas de irrigação agrícola inteligente. Desenvolvida com Node.js, Express, Apollo Server e MongoDB.

---

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executar o Projeto](#-executar-o-projeto)
- [Modelo de Dados](#-modelo-de-dados)
- [API GraphQL](#-api-graphql)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Testes](#-testes)

---

## ✨ Características

✅ **API GraphQL Completa** - Queries, Mutations e Resolvers otimizados  
✅ **4 Entidades Relacionadas** - Usuario, Propriedade, Dispositivo, Setor  
✅ **Validações Robustas** - Mongoose schemas com validações completas  
✅ **Hash de Senhas** - Bcrypt para segurança de senhas  
✅ **Relacionamentos** - Resolvers que implementam relacionamentos entre entidades  
✅ **Paginação** - Suporte a paginação em todas as listagens  
✅ **Filtros** - Queries com suporte a filtros avançados  
✅ **GraphQL Playground** - Interface interativa para testar queries  
✅ **Dashboard Agregado** - Estatísticas e métricas do sistema  
✅ **Operações de Irrigação** - Controle completo de irrigação dos setores  

---

## 🔧 Tecnologias

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express 4.18** - Framework web
- **Apollo Server 3.13** - Servidor GraphQL
- **GraphQL 16.8** - Linguagem de consulta

### Database
- **MongoDB Atlas** - Banco de dados em nuvem
- **Mongoose 8.0** - ODM para MongoDB

### Segurança
- **Bcryptjs** - Hash de senhas
- **UUID** - Identificadores únicos

### Desenvolvimento
- **Nodemon** - Hot reload em desenvolvimento
- **Dotenv** - Gerenciamento de variáveis de ambiente

---

## 📁 Estrutura do Projeto

```
api_irrigacao_graphql/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do MongoDB
│   ├── models/
│   │   ├── Usuario.js           # Model de Usuário
│   │   ├── Propriedade.js       # Model de Propriedade
│   │   ├── Dispositivo.js       # Model de Dispositivo
│   │   ├── Setor.js             # Model de Setor
│   │   └── index.js             # Exportação dos models
│   ├── schemas/
│   │   └── typeDefs.js          # Schema GraphQL (types, queries, mutations)
│   ├── resolvers/
│   │   ├── usuarioResolvers.js      # Resolvers de Usuário
│   │   ├── propriedadeResolvers.js  # Resolvers de Propriedade
│   │   ├── dispositivoResolvers.js  # Resolvers de Dispositivo
│   │   ├── setorResolvers.js        # Resolvers de Setor
│   │   ├── dashboardResolvers.js    # Resolvers agregados
│   │   ├── scalars.js               # Scalars customizados
│   │   └── index.js                 # Combinação de todos os resolvers
│   └── server.js                # Servidor Express + Apollo
├── .env                         # Variáveis de ambiente
├── .env.example                 # Exemplo de variáveis
├── .gitignore                   # Arquivos ignorados
├── package.json                 # Dependências
├── README.md                    # Documentação
└── EXAMPLES.md                  # Exemplos de queries GraphQL
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- MongoDB Atlas account (ou MongoDB local)

### Passo 1: Clonar o repositório

```bash
cd /home/ubuntu/api_irrigacao_graphql
```

### Passo 2: Instalar dependências

```bash
npm install
```

---

## ⚙️ Configuração

### 1. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 2. Editar o arquivo `.env`

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=irrigacao_db

# Server Configuration
PORT=4000
NODE_ENV=development

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
```

**Importante:** Substitua a `MONGODB_URI` com suas credenciais do MongoDB Atlas.

---

## ▶️ Executar o Projeto

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

### Modo Produção

```bash
npm start
```

### Resultado esperado:

```
✅ MongoDB conectado com sucesso!
📦 Database: irrigacao_db
🔗 Mongoose conectado ao MongoDB

🚀 ========================================
🚀  Servidor iniciado com sucesso!
🚀 ========================================
📡 Servidor rodando em: http://localhost:4000
🎯 GraphQL endpoint: http://localhost:4000/graphql
🎮 GraphQL Playground: http://localhost:4000/graphql
💚 Health Check: http://localhost:4000/health
🚀 ========================================
```

### Acessar GraphQL Playground

Abra no navegador: **http://localhost:4000/graphql**

---

## 💾 Modelo de Dados

### Relacionamentos

```
Usuario (1) ──→ (N) Propriedade (1) ──→ (N) Dispositivo (1) ──→ (N) Setor
```

### 1. **Usuario**

```javascript
{
  id: UUID,
  nome: String,
  email: String (unique),
  senha: String (hashed),
  propriedades: [Propriedade] // virtual
}
```

### 2. **Propriedade**

```javascript
{
  id: UUID,
  nome: String,
  localizacao: String,
  tamanho: Number,
  usuarioId: UUID,
  usuario: Usuario,        // virtual
  dispositivos: [Dispositivo] // virtual
}
```

### 3. **Dispositivo**

```javascript
{
  id: UUID,
  nome: String,
  tipo: Enum ['CONTROLADOR', 'SENSOR', 'ATUADOR', 'OUTRO'],
  modelo: String,
  status: Enum ['ATIVO', 'INATIVO', 'MANUTENCAO', 'FALHA'],
  dataInstalacao: Date,
  propriedadeId: UUID,
  propriedade: Propriedade, // virtual
  setores: [Setor]         // virtual
}
```

### 4. **Setor**

```javascript
{
  id: UUID,
  nome: String,
  area: Number,
  tipoCultura: String,
  status: Enum ['ATIVO', 'AGUARDANDO', 'EM_MANUTENCAO', 'DESATIVADO'],
  horarioIrrigacao: DateTime,
  ultimaIrrigacao: DateTime,
  foiIrrigadoNaHora: Boolean,
  dispositivoId: UUID,
  dispositivo: Dispositivo // virtual
}
```

---

## 🎯 API GraphQL

### Queries Disponíveis

#### Usuários
- `usuario(id: ID!)` - Buscar usuário por ID
- `usuarios(pagina: Int, limite: Int)` - Listar usuários
- `usuarioPorEmail(email: String!)` - Buscar por email

#### Propriedades
- `propriedade(id: ID!)` - Buscar propriedade por ID
- `propriedades(usuarioId: ID, pagina: Int, limite: Int)` - Listar propriedades

#### Dispositivos
- `dispositivo(id: ID!)` - Buscar dispositivo por ID
- `dispositivos(filtros: FiltroDispositivo, pagina: Int, limite: Int)` - Listar dispositivos

#### Setores
- `setor(id: ID!)` - Buscar setor por ID
- `setores(filtros: FiltroSetor, pagina: Int, limite: Int)` - Listar setores
- `setoresParaIrrigar(dispositivoId: ID)` - Listar setores para irrigar agora

#### Agregados
- `dashboardUsuario(usuarioId: ID!)` - Dashboard completo do usuário
- `estatisticasPropriedade(propriedadeId: ID!)` - Estatísticas de propriedade

### Mutations Disponíveis

#### Usuários
- `criarUsuario(input: UsuarioInput!)` - Criar usuário
- `atualizarUsuario(id: ID!, input: UsuarioUpdateInput!)` - Atualizar
- `deletarUsuario(id: ID!)` - Deletar (em cascata)

#### Propriedades
- `criarPropriedade(input: PropriedadeInput!)` - Criar propriedade
- `atualizarPropriedade(id: ID!, input: PropriedadeUpdateInput!)` - Atualizar
- `deletarPropriedade(id: ID!)` - Deletar (em cascata)

#### Dispositivos
- `criarDispositivo(input: DispositivoInput!)` - Criar dispositivo
- `atualizarDispositivo(id: ID!, input: DispositivoUpdateInput!)` - Atualizar
- `deletarDispositivo(id: ID!)` - Deletar (em cascata)
- `alterarStatusDispositivo(id: ID!, status: StatusDispositivo!)` - Alterar status

#### Setores
- `criarSetor(input: SetorInput!)` - Criar setor
- `atualizarSetor(id: ID!, input: SetorUpdateInput!)` - Atualizar
- `deletarSetor(id: ID!)` - Deletar
- `iniciarIrrigacao(setorId: ID!)` - Iniciar irrigação
- `pararIrrigacao(setorId: ID!)` - Parar irrigação
- `programarIrrigacao(setorId: ID!, horario: DateTime!)` - Programar

---

## 📖 Exemplos de Uso

### 1. Criar um Usuário

```graphql
mutation {
  criarUsuario(input: {
    nome: "João Silva"
    email: "joao@example.com"
    senha: "senha123"
  }) {
    id
    nome
    email
    createdAt
  }
}
```

### 2. Criar uma Propriedade

```graphql
mutation {
  criarPropriedade(input: {
    nome: "Fazenda Alegria"
    localizacao: "Estrada Rural 123, Interior - PR"
    tamanho: 150.5
    usuarioId: "usuario-id-aqui"
  }) {
    id
    nome
    tamanho
    usuario {
      nome
      email
    }
  }
}
```

### 3. Criar um Dispositivo

```graphql
mutation {
  criarDispositivo(input: {
    nome: "Controlador Central"
    tipo: CONTROLADOR
    modelo: "X-200"
    status: ATIVO
    dataInstalacao: "2025-01-15"
    propriedadeId: "propriedade-id-aqui"
  }) {
    id
    nome
    tipo
    status
    propriedade {
      nome
    }
  }
}
```

### 4. Criar um Setor

```graphql
mutation {
  criarSetor(input: {
    nome: "Setor A - Milho"
    area: 25.5
    tipoCultura: "Milho"
    status: AGUARDANDO
    horarioIrrigacao: "2025-10-16T06:00:00Z"
    dispositivoId: "dispositivo-id-aqui"
  }) {
    id
    nome
    area
    tipoCultura
    status
    dispositivo {
      nome
    }
  }
}
```

### 5. Buscar Dashboard Completo

```graphql
query {
  dashboardUsuario(usuarioId: "usuario-id-aqui") {
    usuario {
      nome
      email
    }
    totalPropriedades
    totalDispositivos
    totalSetores
    setoresAtivos
    dispositivosAtivos
  }
}
```

### 6. Buscar Propriedade com Relacionamentos

```graphql
query {
  propriedade(id: "propriedade-id") {
    id
    nome
    localizacao
    tamanho
    usuario {
      nome
      email
    }
    dispositivos {
      id
      nome
      tipo
      status
      setores {
        id
        nome
        area
        tipoCultura
        status
      }
    }
  }
}
```

### 7. Iniciar Irrigação em um Setor

```graphql
mutation {
  iniciarIrrigacao(setorId: "setor-id-aqui") {
    id
    nome
    status
    ultimaIrrigacao
    foiIrrigadoNaHora
  }
}
```

### 8. Listar Setores para Irrigar Agora

```graphql
query {
  setoresParaIrrigar {
    id
    nome
    area
    tipoCultura
    horarioIrrigacao
    dispositivo {
      nome
      propriedade {
        nome
      }
    }
  }
}
```

### 9. Estatísticas de Propriedade

```graphql
query {
  estatisticasPropriedade(propriedadeId: "propriedade-id") {
    propriedade {
      nome
      tamanho
    }
    totalDispositivos
    totalSetores
    areaTotal
    setoresPorStatus {
      status
      count
    }
    dispositivosPorStatus {
      status
      count
    }
  }
}
```

### 10. Listar Usuários com Todas as Propriedades

```graphql
query {
  usuarios(pagina: 0, limite: 10) {
    usuarios {
      id
      nome
      email
      propriedades {
        id
        nome
        localizacao
        tamanho
      }
    }
    total
    pagina
    totalPaginas
  }
}
```

---

## 🔒 Validações Implementadas

### Usuario
- Nome: 3-100 caracteres
- Email: formato válido e único
- Senha: mínimo 6 caracteres (hashed com bcrypt)

### Propriedade
- Nome: 3-100 caracteres
- Tamanho: maior que 0
- Usuario: deve existir

### Dispositivo
- Nome: 3-100 caracteres
- Tipo: CONTROLADOR | SENSOR | ATUADOR | OUTRO
- Status: ATIVO | INATIVO | MANUTENCAO | FALHA
- Data Instalação: não pode ser no futuro
- Propriedade: deve existir

### Setor
- Nome: 3-100 caracteres
- Área: maior que 0
- Status: ATIVO | AGUARDANDO | EM_MANUTENCAO | DESATIVADO
- Dispositivo: deve existir

---

## 🧪 Testes

Para rodar os testes (quando implementados):

```bash
npm test
```

---

## 📚 Documentação Adicional

- **EXAMPLES.md** - Exemplos completos de todas as queries e mutations
- **GraphQL Playground** - Documentação interativa em `/graphql`

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

**UTFPR - Universidade Tecnológica Federal do Paraná**

---

## 🆘 Suporte

Para suporte, envie um email para: suporte@example.com

---

**Desenvolvido com ❤️ para gerenciamento inteligente de irrigação agrícola**
