const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # ==========================================
  # SCALARS PERSONALIZADOS
  # ==========================================
  scalar DateTime
  scalar Date

  # ==========================================
  # ENUMS
  # ==========================================
  enum StatusDispositivo {
    ATIVO
    INATIVO
    MANUTENCAO
    FALHA
  }

  enum StatusSetor {
    ATIVO
    AGUARDANDO
    EM_MANUTENCAO
    DESATIVADO
  }

  enum TipoDispositivo {
    CONTROLADOR
    SENSOR
    ATUADOR
    OUTRO
  }

  # ==========================================
  # TYPES - ENTIDADES
  # ==========================================
  
  """
  Usuário do sistema - Proprietário de fazendas
  """
  type Usuario {
    id: ID!
    nome: String!
    email: String!
    propriedades: [Propriedade!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  Propriedade rural - Fazenda ou terreno agrícola
  """
  type Propriedade {
    id: ID!
    nome: String!
    localizacao: String!
    tamanho: Float!
    usuarioId: ID!
    usuario: Usuario!
    dispositivos: [Dispositivo!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  Dispositivo de controle de irrigação
  """
  type Dispositivo {
    id: ID!
    nome: String!
    tipo: TipoDispositivo!
    modelo: String!
    status: StatusDispositivo!
    dataInstalacao: Date!
    propriedadeId: ID!
    propriedade: Propriedade!
    setores: [Setor!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  Setor de irrigação - Subdivisão da propriedade
  """
  type Setor {
    id: ID!
    nome: String!
    area: Float!
    tipoCultura: String!
    status: StatusSetor!
    horarioIrrigacao: DateTime
    ultimaIrrigacao: DateTime
    foiIrrigadoNaHora: Boolean!
    dispositivoId: ID!
    dispositivo: Dispositivo!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ==========================================
  # TYPES - PAGINAÇÃO
  # ==========================================
  
  type UsuarioPaginado {
    usuarios: [Usuario!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  type PropriedadePaginada {
    propriedades: [Propriedade!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  type DispositivoPaginado {
    dispositivos: [Dispositivo!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  type SetorPaginado {
    setores: [Setor!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  # ==========================================
  # TYPES - AGREGADOS E ESTATÍSTICAS
  # ==========================================
  
  type DashboardUsuario {
    usuario: Usuario!
    totalPropriedades: Int!
    totalDispositivos: Int!
    totalSetores: Int!
    setoresAtivos: Int!
    dispositivosAtivos: Int!
  }

  type EstatisticasPropriedade {
    propriedade: Propriedade!
    totalDispositivos: Int!
    totalSetores: Int!
    areaTotal: Float!
    setoresPorStatus: [StatusCount!]!
    dispositivosPorStatus: [StatusCount!]!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  # ==========================================
  # INPUTS - CRIAR E ATUALIZAR
  # ==========================================
  
  input UsuarioInput {
    nome: String!
    email: String!
    senha: String!
  }

  input UsuarioUpdateInput {
    nome: String
    email: String
    senha: String
  }

  input PropriedadeInput {
    nome: String!
    localizacao: String!
    tamanho: Float!
    usuarioId: ID!
  }

  input PropriedadeUpdateInput {
    nome: String
    localizacao: String
    tamanho: Float
  }

  input DispositivoInput {
    nome: String!
    tipo: TipoDispositivo!
    modelo: String!
    status: StatusDispositivo!
    dataInstalacao: Date!
    propriedadeId: ID!
  }

  input DispositivoUpdateInput {
    nome: String
    tipo: TipoDispositivo
    modelo: String
    status: StatusDispositivo
    dataInstalacao: Date
  }

  input SetorInput {
    nome: String!
    area: Float!
    tipoCultura: String!
    status: StatusSetor!
    horarioIrrigacao: DateTime
    dispositivoId: ID!
  }

  input SetorUpdateInput {
    nome: String
    area: Float
    tipoCultura: String
    status: StatusSetor
    horarioIrrigacao: DateTime
    ultimaIrrigacao: DateTime
    foiIrrigadoNaHora: Boolean
  }

  # ==========================================
  # INPUTS - FILTROS
  # ==========================================
  
  input FiltroDispositivo {
    propriedadeId: ID
    status: StatusDispositivo
    tipo: TipoDispositivo
  }

  input FiltroSetor {
    dispositivoId: ID
    status: StatusSetor
    tipoCultura: String
  }

  # ==========================================
  # QUERIES
  # ==========================================
  
  type Query {
    # ========== USUÁRIOS ==========
    """
    Buscar usuário por ID
    """
    usuario(id: ID!): Usuario
    
    """
    Listar todos os usuários com paginação
    """
    usuarios(pagina: Int = 0, limite: Int = 10): UsuarioPaginado!
    
    """
    Buscar usuário por email
    """
    usuarioPorEmail(email: String!): Usuario

    # ========== PROPRIEDADES ==========
    """
    Buscar propriedade por ID
    """
    propriedade(id: ID!): Propriedade
    
    """
    Listar propriedades com filtros e paginação
    """
    propriedades(
      usuarioId: ID
      pagina: Int = 0
      limite: Int = 10
    ): PropriedadePaginada!

    # ========== DISPOSITIVOS ==========
    """
    Buscar dispositivo por ID
    """
    dispositivo(id: ID!): Dispositivo
    
    """
    Listar dispositivos com filtros e paginação
    """
    dispositivos(
      filtros: FiltroDispositivo
      pagina: Int = 0
      limite: Int = 10
    ): DispositivoPaginado!

    # ========== SETORES ==========
    """
    Buscar setor por ID
    """
    setor(id: ID!): Setor
    
    """
    Listar setores com filtros e paginação
    """
    setores(
      filtros: FiltroSetor
      pagina: Int = 0
      limite: Int = 10
    ): SetorPaginado!

    # ========== QUERIES AGREGADAS ==========
    """
    Dashboard completo do usuário com estatísticas
    """
    dashboardUsuario(usuarioId: ID!): DashboardUsuario

    """
    Estatísticas detalhadas de uma propriedade
    """
    estatisticasPropriedade(propriedadeId: ID!): EstatisticasPropriedade

    """
    Listar setores que devem irrigar agora
    """
    setoresParaIrrigar(dispositivoId: ID): [Setor!]!
  }

  # ==========================================
  # MUTATIONS
  # ==========================================
  
  type Mutation {
    # ========== USUÁRIOS ==========
    """
    Criar novo usuário
    """
    criarUsuario(input: UsuarioInput!): Usuario!
    
    """
    Atualizar usuário existente
    """
    atualizarUsuario(id: ID!, input: UsuarioUpdateInput!): Usuario!
    
    """
    Deletar usuário (e suas propriedades)
    """
    deletarUsuario(id: ID!): Boolean!

    # ========== PROPRIEDADES ==========
    """
    Criar nova propriedade
    """
    criarPropriedade(input: PropriedadeInput!): Propriedade!
    
    """
    Atualizar propriedade existente
    """
    atualizarPropriedade(id: ID!, input: PropriedadeUpdateInput!): Propriedade!
    
    """
    Deletar propriedade (e seus dispositivos)
    """
    deletarPropriedade(id: ID!): Boolean!

    # ========== DISPOSITIVOS ==========
    """
    Criar novo dispositivo
    """
    criarDispositivo(input: DispositivoInput!): Dispositivo!
    
    """
    Atualizar dispositivo existente
    """
    atualizarDispositivo(id: ID!, input: DispositivoUpdateInput!): Dispositivo!
    
    """
    Deletar dispositivo (e seus setores)
    """
    deletarDispositivo(id: ID!): Boolean!
    
    """
    Ativar ou desativar dispositivo
    """
    alterarStatusDispositivo(id: ID!, status: StatusDispositivo!): Dispositivo!

    # ========== SETORES ==========
    """
    Criar novo setor
    """
    criarSetor(input: SetorInput!): Setor!
    
    """
    Atualizar setor existente
    """
    atualizarSetor(id: ID!, input: SetorUpdateInput!): Setor!
    
    """
    Deletar setor
    """
    deletarSetor(id: ID!): Boolean!
    
    """
    Iniciar irrigação manual em um setor
    """
    iniciarIrrigacao(setorId: ID!): Setor!
    
    """
    Parar irrigação em um setor
    """
    pararIrrigacao(setorId: ID!): Setor!
    
    """
    Programar horário de irrigação
    """
    programarIrrigacao(setorId: ID!, horario: DateTime!): Setor!
  }
`;

module.exports = typeDefs;
