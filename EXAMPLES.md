# 📚 Exemplos Completos de GraphQL Queries

Este arquivo contém exemplos prontos para copiar e colar no GraphQL Playground.

Acesse: **http://localhost:4000/graphql**

---

## 📑 Índice

1. [Mutations - Criar Dados](#1-mutations---criar-dados)
2. [Queries - Buscar Dados Simples](#2-queries---buscar-dados-simples)
3. [Queries - Buscar com Relacionamentos](#3-queries---buscar-com-relacionamentos)
4. [Queries - Listas com Paginação](#4-queries---listas-com-paginação)
5. [Queries - Dashboard e Estatísticas](#5-queries---dashboard-e-estatísticas)
6. [Mutations - Atualizar Dados](#6-mutations---atualizar-dados)
7. [Mutations - Operações de Irrigação](#7-mutations---operações-de-irrigação)
8. [Mutations - Deletar Dados](#8-mutations---deletar-dados)
9. [Queries Avançadas](#9-queries-avançadas)

---

## 1. Mutations - Criar Dados

### 1.1 Criar Usuário

```graphql
mutation CriarUsuario {
  criarUsuario(input: {
    nome: "João Silva"
    email: "joao@example.com"
    senha: "senha123"
  }) {
    id
    nome
    email
    createdAt
    updatedAt
  }
}
```

### 1.2 Criar Propriedade

```graphql
mutation CriarPropriedade {
  criarPropriedade(input: {
    nome: "Fazenda Alegria"
    localizacao: "Estrada Rural 123, Interior - PR"
    tamanho: 150.5
    usuarioId: "COLE-O-ID-DO-USUARIO-AQUI"
  }) {
    id
    nome
    localizacao
    tamanho
    usuarioId
    createdAt
    usuario {
      nome
      email
    }
  }
}
```

### 1.3 Criar Dispositivo

```graphql
mutation CriarDispositivo {
  criarDispositivo(input: {
    nome: "Controlador Central"
    tipo: CONTROLADOR
    modelo: "X-200"
    status: ATIVO
    dataInstalacao: "2025-01-15"
    propriedadeId: "COLE-O-ID-DA-PROPRIEDADE-AQUI"
  }) {
    id
    nome
    tipo
    modelo
    status
    dataInstalacao
    createdAt
    propriedade {
      nome
      localizacao
    }
  }
}
```

### 1.4 Criar Setor

```graphql
mutation CriarSetor {
  criarSetor(input: {
    nome: "Setor A - Milho"
    area: 25.5
    tipoCultura: "Milho"
    status: AGUARDANDO
    horarioIrrigacao: "2025-10-16T06:00:00Z"
    dispositivoId: "COLE-O-ID-DO-DISPOSITIVO-AQUI"
  }) {
    id
    nome
    area
    tipoCultura
    status
    horarioIrrigacao
    ultimaIrrigacao
    foiIrrigadoNaHora
    createdAt
    dispositivo {
      nome
      tipo
      status
    }
  }
}
```

---

## 2. Queries - Buscar Dados Simples

### 2.1 Buscar Usuário por ID

```graphql
query BuscarUsuario {
  usuario(id: "COLE-O-ID-DO-USUARIO-AQUI") {
    id
    nome
    email
    createdAt
    updatedAt
  }
}
```

### 2.2 Buscar Usuário por Email

```graphql
query BuscarUsuarioPorEmail {
  usuarioPorEmail(email: "joao@example.com") {
    id
    nome
    email
  }
}
```

### 2.3 Buscar Propriedade por ID

```graphql
query BuscarPropriedade {
  propriedade(id: "COLE-O-ID-DA-PROPRIEDADE-AQUI") {
    id
    nome
    localizacao
    tamanho
    createdAt
  }
}
```

### 2.4 Buscar Dispositivo por ID

```graphql
query BuscarDispositivo {
  dispositivo(id: "COLE-O-ID-DO-DISPOSITIVO-AQUI") {
    id
    nome
    tipo
    modelo
    status
    dataInstalacao
  }
}
```

### 2.5 Buscar Setor por ID

```graphql
query BuscarSetor {
  setor(id: "COLE-O-ID-DO-SETOR-AQUI") {
    id
    nome
    area
    tipoCultura
    status
    horarioIrrigacao
    ultimaIrrigacao
    foiIrrigadoNaHora
  }
}
```

---

## 3. Queries - Buscar com Relacionamentos

### 3.1 Usuário com Todas as Propriedades

```graphql
query UsuarioComPropriedades {
  usuario(id: "COLE-O-ID-DO-USUARIO-AQUI") {
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
}
```

### 3.2 Propriedade com Usuario e Dispositivos

```graphql
query PropriedadeCompleta {
  propriedade(id: "COLE-O-ID-DA-PROPRIEDADE-AQUI") {
    id
    nome
    localizacao
    tamanho
    usuario {
      id
      nome
      email
    }
    dispositivos {
      id
      nome
      tipo
      modelo
      status
      dataInstalacao
    }
  }
}
```

### 3.3 Dispositivo com Propriedade e Setores

```graphql
query DispositivoCompleto {
  dispositivo(id: "COLE-O-ID-DO-DISPOSITIVO-AQUI") {
    id
    nome
    tipo
    modelo
    status
    propriedade {
      id
      nome
      localizacao
      usuario {
        nome
        email
      }
    }
    setores {
      id
      nome
      area
      tipoCultura
      status
      horarioIrrigacao
      ultimaIrrigacao
    }
  }
}
```

### 3.4 Setor com Todos os Relacionamentos

```graphql
query SetorCompleto {
  setor(id: "COLE-O-ID-DO-SETOR-AQUI") {
    id
    nome
    area
    tipoCultura
    status
    horarioIrrigacao
    ultimaIrrigacao
    foiIrrigadoNaHora
    dispositivo {
      id
      nome
      tipo
      status
      propriedade {
        id
        nome
        localizacao
        usuario {
          id
          nome
          email
        }
      }
    }
  }
}
```

### 3.5 Hierarquia Completa - Usuario até Setores

```graphql
query HierarquiaCompleta {
  usuario(id: "COLE-O-ID-DO-USUARIO-AQUI") {
    id
    nome
    email
    propriedades {
      id
      nome
      localizacao
      tamanho
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
          horarioIrrigacao
          ultimaIrrigacao
        }
      }
    }
  }
}
```

---

## 4. Queries - Listas com Paginação

### 4.1 Listar Todos os Usuários (Primeira Página)

```graphql
query ListarUsuarios {
  usuarios(pagina: 0, limite: 10) {
    usuarios {
      id
      nome
      email
      createdAt
    }
    total
    pagina
    totalPaginas
  }
}
```

### 4.2 Listar Propriedades de um Usuário

```graphql
query ListarPropriedadesDoUsuario {
  propriedades(usuarioId: "COLE-O-ID-DO-USUARIO-AQUI", pagina: 0, limite: 10) {
    propriedades {
      id
      nome
      localizacao
      tamanho
      createdAt
    }
    total
    pagina
    totalPaginas
  }
}
```

### 4.3 Listar Dispositivos com Filtros

```graphql
query ListarDispositivosAtivos {
  dispositivos(
    filtros: {
      status: ATIVO
    }
    pagina: 0
    limite: 20
  ) {
    dispositivos {
      id
      nome
      tipo
      modelo
      status
      propriedade {
        nome
      }
    }
    total
    pagina
    totalPaginas
  }
}
```

### 4.4 Listar Dispositivos de uma Propriedade

```graphql
query ListarDispositivosDaPropriedade {
  dispositivos(
    filtros: {
      propriedadeId: "COLE-O-ID-DA-PROPRIEDADE-AQUI"
    }
    pagina: 0
    limite: 10
  ) {
    dispositivos {
      id
      nome
      tipo
      status
      setores {
        nome
        status
      }
    }
    total
  }
}
```

### 4.5 Listar Setores com Filtros

```graphql
query ListarSetoresPorStatus {
  setores(
    filtros: {
      status: ATIVO
      tipoCultura: "Milho"
    }
    pagina: 0
    limite: 10
  ) {
    setores {
      id
      nome
      area
      tipoCultura
      status
      horarioIrrigacao
      dispositivo {
        nome
        propriedade {
          nome
        }
      }
    }
    total
    totalPaginas
  }
}
```

### 4.6 Listar Setores de um Dispositivo

```graphql
query ListarSetoresDoDispositivo {
  setores(
    filtros: {
      dispositivoId: "COLE-O-ID-DO-DISPOSITIVO-AQUI"
    }
    pagina: 0
    limite: 50
  ) {
    setores {
      id
      nome
      area
      tipoCultura
      status
      horarioIrrigacao
      ultimaIrrigacao
    }
    total
  }
}
```

---

## 5. Queries - Dashboard e Estatísticas

### 5.1 Dashboard Completo do Usuário

```graphql
query DashboardUsuario {
  dashboardUsuario(usuarioId: "COLE-O-ID-DO-USUARIO-AQUI") {
    usuario {
      id
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

### 5.2 Estatísticas Detalhadas de Propriedade

```graphql
query EstatisticasPropriedade {
  estatisticasPropriedade(propriedadeId: "COLE-O-ID-DA-PROPRIEDADE-AQUI") {
    propriedade {
      id
      nome
      localizacao
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

### 5.3 Listar Setores que Devem Irrigar Agora

```graphql
query SetoresParaIrrigar {
  setoresParaIrrigar {
    id
    nome
    area
    tipoCultura
    horarioIrrigacao
    ultimaIrrigacao
    dispositivo {
      nome
      status
      propriedade {
        nome
        localizacao
      }
    }
  }
}
```

### 5.4 Setores para Irrigar de um Dispositivo Específico

```graphql
query SetoresParaIrrigarPorDispositivo {
  setoresParaIrrigar(dispositivoId: "COLE-O-ID-DO-DISPOSITIVO-AQUI") {
    id
    nome
    area
    horarioIrrigacao
    dispositivo {
      nome
    }
  }
}
```

---

## 6. Mutations - Atualizar Dados

### 6.1 Atualizar Usuário

```graphql
mutation AtualizarUsuario {
  atualizarUsuario(
    id: "COLE-O-ID-DO-USUARIO-AQUI"
    input: {
      nome: "João Silva Atualizado"
      email: "joao.novo@example.com"
    }
  ) {
    id
    nome
    email
    updatedAt
  }
}
```

### 6.2 Atualizar Senha do Usuário

```graphql
mutation AtualizarSenha {
  atualizarUsuario(
    id: "COLE-O-ID-DO-USUARIO-AQUI"
    input: {
      senha: "novaSenha123"
    }
  ) {
    id
    nome
    email
    updatedAt
  }
}
```

### 6.3 Atualizar Propriedade

```graphql
mutation AtualizarPropriedade {
  atualizarPropriedade(
    id: "COLE-O-ID-DA-PROPRIEDADE-AQUI"
    input: {
      nome: "Fazenda Renovada"
      tamanho: 200.0
    }
  ) {
    id
    nome
    tamanho
    updatedAt
  }
}
```

### 6.4 Atualizar Dispositivo

```graphql
mutation AtualizarDispositivo {
  atualizarDispositivo(
    id: "COLE-O-ID-DO-DISPOSITIVO-AQUI"
    input: {
      nome: "Controlador Atualizado"
      modelo: "X-300"
    }
  ) {
    id
    nome
    modelo
    updatedAt
  }
}
```

### 6.5 Alterar Status do Dispositivo

```graphql
mutation AlterarStatusDispositivo {
  alterarStatusDispositivo(
    id: "COLE-O-ID-DO-DISPOSITIVO-AQUI"
    status: MANUTENCAO
  ) {
    id
    nome
    status
    updatedAt
  }
}
```

### 6.6 Atualizar Setor

```graphql
mutation AtualizarSetor {
  atualizarSetor(
    id: "COLE-O-ID-DO-SETOR-AQUI"
    input: {
      nome: "Setor B - Soja"
      area: 30.0  
      tipoCultura: "Soja"
      status: ATIVO
    }
  ) {
    id
    nome
    area
    tipoCultura
    status
    updatedAt
  }
}
```

---

## 7. Mutations - Operações de Irrigação

### 7.1 Programar Horário de Irrigação

```graphql
mutation ProgramarIrrigacao {
  programarIrrigacao(
    setorId: "COLE-O-ID-DO-SETOR-AQUI"
    horario: "2025-10-16T06:00:00Z"
  ) {
    id
    nome
    status
    horarioIrrigacao
    ultimaIrrigacao
  }
}
```

### 7.2 Iniciar Irrigação Manual

```graphql
mutation IniciarIrrigacao {
  iniciarIrrigacao(setorId: "COLE-O-ID-DO-SETOR-AQUI") {
    id
    nome
    status
    ultimaIrrigacao
    foiIrrigadoNaHora
  }
}
```

### 7.3 Parar Irrigação

```graphql
mutation PararIrrigacao {
  pararIrrigacao(setorId: "COLE-O-ID-DO-SETOR-AQUI") {
    id
    nome
    status
    ultimaIrrigacao
  }
}
```

---

## 8. Mutations - Deletar Dados

### 8.1 Deletar Setor

```graphql
mutation DeletarSetor {
  deletarSetor(id: "COLE-O-ID-DO-SETOR-AQUI")
}
```

### 8.2 Deletar Dispositivo (e seus Setores)

```graphql
mutation DeletarDispositivo {
  deletarDispositivo(id: "COLE-O-ID-DO-DISPOSITIVO-AQUI")
}
```

### 8.3 Deletar Propriedade (e seus Dispositivos e Setores)

```graphql
mutation DeletarPropriedade {
  deletarPropriedade(id: "COLE-O-ID-DA-PROPRIEDADE-AQUI")
}
```

### 8.4 Deletar Usuário (e tudo relacionado)

```graphql
mutation DeletarUsuario {
  deletarUsuario(id: "COLE-O-ID-DO-USUARIO-AQUI")
}
```

---

## 9. Queries Avançadas

### 9.1 Buscar Todas as Informações de um Usuário

```graphql
query UsuarioCompleto {
  usuario(id: "COLE-O-ID-DO-USUARIO-AQUI") {
    id
    nome
    email
    createdAt
    propriedades {
      id
      nome
      localizacao
      tamanho
      dispositivos {
        id
        nome
        tipo
        status
        dataInstalacao
        setores {
          id
          nome
          area
          tipoCultura
          status
          horarioIrrigacao
          ultimaIrrigacao
          foiIrrigadoNaHora
        }
      }
    }
  }
}
```

### 9.2 Dashboard Completo com Detalhes

```graphql
query DashboardCompleto {
  dashboardUsuario(usuarioId: "COLE-O-ID-DO-USUARIO-AQUI") {
    usuario {
      id
      nome
      email
      propriedades {
        nome
        tamanho
      }
    }
    totalPropriedades
    totalDispositivos
    totalSetores
    setoresAtivos
    dispositivosAtivos
  }
}
```

### 9.3 Listar Todos os Dispositivos Ativos com Setores

```graphql
query DispositivosAtivosComSetores {
  dispositivos(filtros: { status: ATIVO }, limite: 100) {
    dispositivos {
      id
      nome
      tipo
      modelo
      propriedade {
        nome
        usuario {
          nome
        }
      }
      setores {
        nome
        area
        tipoCultura
        status
        horarioIrrigacao
      }
    }
    total
  }
}
```

### 9.4 Verificar Setores Aguardando Irrigação

```graphql
query SetoresAguardandoIrrigacao {
  setores(filtros: { status: AGUARDANDO }, limite: 100) {
    setores {
      id
      nome
      area
      tipoCultura
      horarioIrrigacao
      ultimaIrrigacao
      dispositivo {
        nome
        status
        propriedade {
          nome
          localizacao
        }
      }
    }
    total
  }
}
```

### 9.5 Relatório Completo de uma Propriedade

```graphql
query RelatorioPropriedade {
  propriedade(id: "COLE-O-ID-DA-PROPRIEDADE-AQUI") {
    id
    nome
    localizacao
    tamanho
    createdAt
    usuario {
      nome
      email
    }
    dispositivos {
      id
      nome
      tipo
      modelo
      status
      dataInstalacao
      setores {
        id
        nome
        area
        tipoCultura
        status
        horarioIrrigacao
        ultimaIrrigacao
        foiIrrigadoNaHora
      }
    }
  }
  
  estatisticasPropriedade(propriedadeId: "COLE-O-ID-DA-PROPRIEDADE-AQUI") {
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

---

## 🎯 Dicas de Uso

### 1. Como Usar no GraphQL Playground

1. Copie a query desejada
2. Cole no painel esquerdo do Playground
3. Substitua os IDs de exemplo pelos IDs reais
4. Clique no botão "Play" (▶️)
5. Veja o resultado no painel direito

### 2. Variáveis GraphQL

Você pode usar variáveis para tornar as queries reutilizáveis:

```graphql
query BuscarUsuarioComVariavel($usuarioId: ID!) {
  usuario(id: $usuarioId) {
    id
    nome
    email
  }
}

# QUERY VARIABLES (painel inferior)
{
  "usuarioId": "cole-o-id-aqui"
}
```

### 3. Fragments para Reutilização

```graphql
fragment UsuarioBasico on Usuario {
  id
  nome
  email
  createdAt
}

query ListarUsuariosComFragment {
  usuarios(limite: 10) {
    usuarios {
      ...UsuarioBasico
    }
  }
}
```

### 4. Múltiplas Queries em Uma Requisição

```graphql
query MultiplosDados {
  usuarios(limite: 5) {
    usuarios {
      nome
    }
    total
  }
  
  propriedades(limite: 5) {
    propriedades {
      nome
    }
    total
  }
  
  dispositivos(limite: 5) {
    dispositivos {
      nome
    }
    total
  }
}
```

---

## 📝 Fluxo Completo de Teste

### Passo 1: Criar um Usuário

```graphql
mutation {
  criarUsuario(input: {
    nome: "Teste Usuario"
    email: "teste@example.com"
    senha: "senha123"
  }) {
    id
    nome
    email
  }
}
```

**Copie o ID retornado!**

### Passo 2: Criar uma Propriedade

```graphql
mutation {
  criarPropriedade(input: {
    nome: "Fazenda Teste"
    localizacao: "Teste, PR"
    tamanho: 100.0
    usuarioId: "COLE-O-ID-DO-USUARIO"
  }) {
    id
    nome
  }
}
```

**Copie o ID retornado!**

### Passo 3: Criar um Dispositivo

```graphql
mutation {
  criarDispositivo(input: {
    nome: "Controlador Teste"
    tipo: CONTROLADOR
    modelo: "X-100"
    status: ATIVO
    dataInstalacao: "2025-10-15"
    propriedadeId: "COLE-O-ID-DA-PROPRIEDADE"
  }) {
    id
    nome
  }
}
```

**Copie o ID retornado!**

### Passo 4: Criar um Setor

```graphql
mutation {
  criarSetor(input: {
    nome: "Setor Teste"
    area: 10.0
    tipoCultura: "Teste"
    status: AGUARDANDO
    horarioIrrigacao: "2025-10-16T06:00:00Z"
    dispositivoId: "COLE-O-ID-DO-DISPOSITIVO"
  }) {
    id
    nome
  }
}
```

### Passo 5: Ver Dashboard Completo

```graphql
query {
  dashboardUsuario(usuarioId: "COLE-O-ID-DO-USUARIO") {
    usuario {
      nome
    }
    totalPropriedades
    totalDispositivos
    totalSetores
    setoresAtivos
    dispositivosAtivos
  }
}
```

---

**Agora você tem todos os exemplos necessários para testar a API GraphQL completa! 🚀**
