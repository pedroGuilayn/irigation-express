# API GraphQL - Sistema de Irrigação Inteligente

API GraphQL focada exclusivamente no **gerenciamento de irrigação** para sistemas de agricultura inteligente. Esta API trabalha em conjunto com uma API externa (Spring Boot) que gerencia Usuários, Dispositivos, Setores e Propriedades.

## 🎯 Objetivo

Esta API é responsável por:
- ✅ Programação de Irrigação (única, diária, semanal, personalizada)
- ✅ Controle de Irrigação em Tempo Real (iniciar/parar)
- ✅ Histórico de Irrigações
- ✅ Monitoramento e Alertas
- ✅ Relatórios e Estatísticas de Consumo

**IMPORTANTE:** Usuários, Dispositivos, Setores e Propriedades são gerenciados pela API externa em Spring Boot.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│   API Externa (Spring Boot)             │
│   - Usuários                            │
│   - Propriedades                        │
│   - Dispositivos                        │
│   - Setores                             │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP REST
                  │
┌─────────────────▼───────────────────────┐
│   API GraphQL (Esta API)                │
│   - Programação de Irrigação            │
│   - Controle de Irrigação               │
│   - Histórico                           │
│   - Alertas                             │
│   - Relatórios                          │
└─────────────────────────────────────────┘
```

## 📦 Tecnologias

- **Node.js** - Runtime JavaScript
- **GraphQL** - API Query Language
- **Apollo Server** - GraphQL Server
- **MongoDB** - Banco de dados para dados de irrigação
- **Mongoose** - ODM para MongoDB
- **Express** - Framework web
- **Axios** - Cliente HTTP para comunicação com API externa

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd api_irrigacao_graphql
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/irrigacao_db
API_EXTERNA_URL=http://localhost:8080/api
GRAPHQL_INTROSPECTION=true
GRAPHQL_PLAYGROUND=true
```

### 4. Inicie o MongoDB

Certifique-se de que o MongoDB está rodando:

```bash
# Linux/Mac
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Inicie a API

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm start
```

A API estará disponível em `http://localhost:4000`

## 🎮 GraphQL Playground

Acesse `http://localhost:4000/graphql` para usar o GraphQL Playground interativo.

## 📚 Funcionalidades

### 1. Programação de Irrigação

#### Criar Programação

```graphql
mutation {
  criarProgramacao(input: {
    nome: "Irrigação Diária Manhã"
    setorId: "123"
    ativa: true
    tipoRecorrencia: DIARIA
    horarioInicio: "06:00"
    duracao: 30
    volumeAgua: 1000
    prioridade: 5
  }) {
    id
    nome
    ativa
  }
}
```

#### Listar Programações

```graphql
query {
  programacoes(pagina: 0, limite: 10) {
    programacoes {
      id
      nome
      setorId
      tipoRecorrencia
      horarioInicio
      duracao
      ativa
    }
    total
    pagina
    totalPaginas
  }
}
```

#### Próximas Irrigações

```graphql
query {
  proximasIrrigacoes(limite: 10) {
    setorId
    programacaoId
    dataHora
    duracao
  }
}
```

### 2. Controle de Irrigação

#### Iniciar Irrigação Manual

```graphql
mutation {
  iniciarIrrigacaoManual(input: {
    setorId: "123"
    duracao: 20
    volumeAgua: 500
    usuarioId: "user123"
    observacoes: "Irrigação emergencial"
  }) {
    id
    setorId
    status
    dataHoraInicio
  }
}
```

#### Parar Irrigação

```graphql
mutation {
  pararIrrigacao(input: {
    setorId: "123"
    usuarioId: "user123"
    motivo: "Chuva inesperada"
  }) {
    id
    status
    dataHoraFim
    duracaoReal
  }
}
```

### 3. Histórico de Irrigações

#### Listar Histórico

```graphql
query {
  historicos(
    filtros: {
      setorId: "123"
      dataInicio: "2024-01-01T00:00:00Z"
      dataFim: "2024-12-31T23:59:59Z"
    }
    pagina: 0
    limite: 10
  ) {
    historicos {
      id
      setorId
      tipoIrrigacao
      status
      dataHoraInicio
      dataHoraFim
      duracaoReal
      volumeAguaReal
      eficiencia {
        tempo
        volume
        media
      }
    }
    total
  }
}
```

#### Status de Irrigação do Setor

```graphql
query {
  statusIrrigacaoSetor(setorId: "123") {
    setorId
    emIrrigacao
    ultimaIrrigacao
    proximaIrrigacao
    totalIrrigacoesHoje
    totalIrrigacoesSemana
    alertas {
      tipo
      mensagem
      dataHora
      lido
    }
  }
}
```

### 4. Alertas

#### Listar Alertas Ativos

```graphql
query {
  alertasAtivos(limite: 20) {
    id
    tipo
    severidade
    titulo
    descricao
    setorId
    status
    lido
    createdAt
  }
}
```

#### Resolver Alerta

```graphql
mutation {
  resolverAlerta(
    id: "alert123"
    usuarioId: "user123"
    observacoes: "Problema resolvido"
  ) {
    id
    status
    dataResolucao
  }
}
```

### 5. Relatórios

#### Relatório de Consumo

```graphql
query {
  relatorioConsumo(
    setorId: "123"
    dataInicio: "2024-01-01T00:00:00Z"
    dataFim: "2024-01-31T23:59:59Z"
  ) {
    setorId
    periodo
    totalIrrigacoes
    volumeTotalAgua
    volumeMedioAgua
    duracaoTotalMinutos
    irrigacoesProgramadas
    irrigacoesManuais
    falhas
    eficienciaMedia
    consumoPorDia {
      data
      totalIrrigacoes
      volumeAgua
      duracaoMinutos
    }
  }
}
```

#### Dashboard Geral

```graphql
query {
  dashboardIrrigacao {
    setoresEmIrrigacao
    irrigacoesHoje
    consumoHoje
    consumoSemana
    consumoMes
    proximasIrrigacoes {
      setorId
      dataHora
      duracao
    }
    alertasAtivos {
      id
      tipo
      severidade
      titulo
    }
  }
}
```

## 🗄️ Modelos de Dados

### ProgramacaoIrrigacao
- Armazena programações de irrigação (única, diária, semanal)
- Suporta recorrência e validade
- Prioridades configuráveis

### HistoricoIrrigacao
- Registra todas as irrigações realizadas
- Armazena dados de consumo e eficiência
- Diferencia tipos (programada, manual, emergencial)

### StatusIrrigacao
- Status em tempo real de cada setor
- Contadores de irrigações
- Alertas embutidos

### Alerta
- Sistema de notificações
- Severidade configurável
- Rastreamento de resolução

## 🔗 Integração com API Externa

A comunicação com a API externa (Spring Boot) é feita através do serviço `apiExterna.js` localizado em `src/services/`.

### Endpoints esperados da API externa:

```
GET  /api/usuarios/{id}
GET  /api/usuarios?pagina=0&limite=10

GET  /api/propriedades/{id}
GET  /api/propriedades?usuarioId=123

GET  /api/dispositivos/{id}
POST /api/dispositivos/{id}/comandos
GET  /api/dispositivos/{id}/status

GET  /api/setores/{id}
GET  /api/setores?dispositivoId=123
```

## 📁 Estrutura do Projeto

```
api_irrigacao_graphql/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração MongoDB
│   ├── models/
│   │   ├── ProgramacaoIrrigacao.js
│   │   ├── HistoricoIrrigacao.js
│   │   ├── StatusIrrigacao.js
│   │   ├── Alerta.js
│   │   └── index.js
│   ├── resolvers/
│   │   ├── programacaoResolvers.js
│   │   ├── controleResolvers.js
│   │   ├── historicoResolvers.js
│   │   ├── alertaResolvers.js
│   │   ├── relatorioResolvers.js
│   │   ├── scalars.js
│   │   └── index.js
│   ├── schemas/
│   │   └── typeDefsIrrigacao.js # Schema GraphQL
│   ├── services/
│   │   └── apiExterna.js        # Cliente API externa
│   └── server.js                # Servidor principal
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testes

```bash
npm test
```

## 🐛 Debug

Para habilitar logs detalhados:

```env
NODE_ENV=development
```

## 📝 Tipos de Recorrência

- `UNICA` - Execução única em data/hora específica
- `DIARIA` - Execução diária no horário especificado
- `SEMANAL` - Execução em dias específicos da semana
- `PERSONALIZADA` - Regras customizadas

## ⚠️ Tipos de Alertas

- `FALHA_IRRIGACAO` - Falha na execução
- `IRRIGACAO_ATRASADA` - Irrigação não executada no horário
- `CONSUMO_ELEVADO` - Consumo acima do esperado
- `DISPOSITIVO_OFFLINE` - Dispositivo não responde
- `SETOR_INATIVO` - Setor desativado
- `PROGRAMACAO_CONFLITO` - Conflito de programações
- `SENSOR_FALHA` - Sensor com problema
- `MANUTENCAO_NECESSARIA` - Manutenção preventiva

## 🔒 Segurança

- Validação de dados de entrada
- Sanitização de queries
- Rate limiting (a implementar)
- Autenticação JWT (a implementar)

## 🚧 Melhorias Futuras

- [ ] Autenticação e Autorização
- [ ] WebSocket para atualizações em tempo real
- [ ] Integração com APIs de clima
- [ ] Otimização automática de irrigação baseada em ML
- [ ] Notificações push
- [ ] Cache com Redis
- [ ] Testes unitários e de integração

## 👥 Contribuindo

Este é um projeto acadêmico da UTFPR.

## 📄 Licença

MIT

## 📞 Suporte

Para questões sobre o projeto, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com ❤️ para o projeto de Tópicos Avançados - UTFPR
