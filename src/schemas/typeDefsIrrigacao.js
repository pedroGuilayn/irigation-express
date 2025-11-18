const { gql } = require('apollo-server-express');

const typeDefsIrrigacao = gql`
  # ==========================================
  # SCALARS PERSONALIZADOS
  # ==========================================
  scalar DateTime
  scalar Date

  # ==========================================
  # ENUMS
  # ==========================================

  enum TipoRecorrencia {
    UNICA
    DIARIA
    SEMANAL
    PERSONALIZADA
  }

  enum TipoIrrigacao {
    PROGRAMADA
    MANUAL
    EMERGENCIAL
    TESTE
  }

  enum StatusExecucao {
    EM_ANDAMENTO
    CONCLUIDA
    CANCELADA
    FALHA
  }

  enum TipoAlerta {
    FALHA_IRRIGACAO
    IRRIGACAO_ATRASADA
    CONSUMO_ELEVADO
    DISPOSITIVO_OFFLINE
    SETOR_INATIVO
    PROGRAMACAO_CONFLITO
    SENSOR_FALHA
    MANUTENCAO_NECESSARIA
    OUTRO
  }

  enum SeveridadeAlerta {
    BAIXA
    MEDIA
    ALTA
    CRITICA
  }

  enum StatusAlerta {
    ATIVO
    RESOLVIDO
    IGNORADO
  }

  # ==========================================
  # TYPES - PROGRAMAÇÃO DE IRRIGAÇÃO
  # ==========================================

  type ProgramacaoIrrigacao {
    id: ID!
    nome: String!
    setorId: ID!
    ativa: Boolean!
    tipoRecorrencia: TipoRecorrencia!
    dataHoraInicio: DateTime
    horarioInicio: String
    diasSemana: [Int!]
    duracao: Int!
    volumeAgua: Float
    dataValidade: DateTime
    prioridade: Int!
    observacoes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ==========================================
  # TYPES - HISTÓRICO DE IRRIGAÇÃO
  # ==========================================

  type HistoricoIrrigacao {
    id: ID!
    setorId: ID!
    programacaoId: ID
    dataHoraInicio: DateTime!
    dataHoraFim: DateTime
    duracaoPlanejada: Int!
    duracaoReal: Int
    tipoIrrigacao: TipoIrrigacao!
    status: StatusExecucao!
    volumeAguaPlanejado: Float
    volumeAguaReal: Float
    motivoCancelamento: String
    motivoFalha: String
    observacoes: String
    usuarioId: ID
    dispositivoId: ID
    temperatura: Float
    umidade: Float
    pluviosidade: Float
    eficiencia: EficienciaIrrigacao
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type EficienciaIrrigacao {
    tempo: Float
    volume: Float
    media: Float
  }

  # ==========================================
  # TYPES - STATUS DE IRRIGAÇÃO
  # ==========================================

  type StatusIrrigacao {
    id: ID!
    setorId: ID!
    emIrrigacao: Boolean!
    historicoAtualId: ID
    ultimaIrrigacao: DateTime
    proximaIrrigacao: DateTime
    proximaProgramacaoId: ID
    totalIrrigacoesHoje: Int!
    totalIrrigacoesSemana: Int!
    totalIrrigacoesMes: Int!
    alertas: [AlertaEmbutido!]!
    ultimoComando: ComandoEmbutido
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AlertaEmbutido {
    tipo: String!
    mensagem: String!
    dataHora: DateTime!
    lido: Boolean!
  }

  type ComandoEmbutido {
    tipo: String!
    dataHora: DateTime!
    usuarioId: ID
  }

  # ==========================================
  # TYPES - ALERTAS
  # ==========================================

  type Alerta {
    id: ID!
    tipo: TipoAlerta!
    severidade: SeveridadeAlerta!
    titulo: String!
    descricao: String!
    setorId: ID
    dispositivoId: ID
    propriedadeId: ID
    programacaoId: ID
    historicoId: ID
    status: StatusAlerta!
    lido: Boolean!
    dataResolucao: DateTime
    resolvidoPor: ID
    observacoesResolucao: String
    dadosAdicionais: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  scalar JSON

  # ==========================================
  # TYPES - PAGINAÇÃO
  # ==========================================

  type ProgramacaoPaginada {
    programacoes: [ProgramacaoIrrigacao!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  type HistoricoPaginado {
    historicos: [HistoricoIrrigacao!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  type AlertaPaginado {
    alertas: [Alerta!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  # ==========================================
  # TYPES - ESTATÍSTICAS E RELATÓRIOS
  # ==========================================

  type RelatorioConsumo {
    setorId: ID!
    periodo: String!
    dataInicio: DateTime!
    dataFim: DateTime!
    totalIrrigacoes: Int!
    volumeTotalAgua: Float!
    volumeMedioAgua: Float!
    duracaoTotalMinutos: Int!
    duracaoMediaMinutos: Int!
    irrigacoesProgramadas: Int!
    irrigacoesManuais: Int!
    irrigacoesEmergenciais: Int!
    falhas: Int!
    eficienciaMedia: Float
    consumoPorDia: [ConsumoDiario!]!
  }

  type ConsumoDiario {
    data: Date!
    totalIrrigacoes: Int!
    volumeAgua: Float!
    duracaoMinutos: Int!
  }

  type EstatisticasSetor {
    setorId: ID!
    totalProgramacoes: Int!
    programacoesAtivas: Int!
    totalIrrigacoes: Int!
    ultimaIrrigacao: DateTime
    proximaIrrigacao: DateTime
    volumeTotalAgua: Float!
    alertasAtivos: Int!
  }

  type DashboardIrrigacao {
    setoresEmIrrigacao: Int!
    irrigacoesHoje: Int!
    proximasIrrigacoes: [ProximaIrrigacao!]!
    alertasAtivos: [Alerta!]!
    consumoHoje: Float!
    consumoSemana: Float!
    consumoMes: Float!
  }

  type ProximaIrrigacao {
    setorId: ID!
    programacaoId: ID!
    dataHora: DateTime!
    duracao: Int!
  }

  # ==========================================
  # INPUTS - PROGRAMAÇÃO
  # ==========================================

  input ProgramacaoIrrigacaoInput {
    nome: String!
    setorId: ID!
    ativa: Boolean
    tipoRecorrencia: TipoRecorrencia!
    dataHoraInicio: DateTime
    horarioInicio: String
    diasSemana: [Int!]
    duracao: Int!
    volumeAgua: Float
    dataValidade: DateTime
    prioridade: Int
    observacoes: String
  }

  input ProgramacaoUpdateInput {
    nome: String
    ativa: Boolean
    tipoRecorrencia: TipoRecorrencia
    dataHoraInicio: DateTime
    horarioInicio: String
    diasSemana: [Int!]
    duracao: Int
    volumeAgua: Float
    dataValidade: DateTime
    prioridade: Int
    observacoes: String
  }

  # ==========================================
  # INPUTS - CONTROLE DE IRRIGAÇÃO
  # ==========================================

  input IniciarIrrigacaoInput {
    setorId: ID!
    duracao: Int!
    volumeAgua: Float
    usuarioId: ID!
    observacoes: String
  }

  input PararIrrigacaoInput {
    setorId: ID!
    usuarioId: ID!
    motivo: String
  }

  # ==========================================
  # INPUTS - FILTROS
  # ==========================================

  input FiltroProgramacao {
    setorId: ID
    ativa: Boolean
    tipoRecorrencia: TipoRecorrencia
  }

  input FiltroHistorico {
    setorId: ID
    dispositivoId: ID
    tipoIrrigacao: TipoIrrigacao
    status: StatusExecucao
    dataInicio: DateTime
    dataFim: DateTime
  }

  input FiltroAlerta {
    setorId: ID
    dispositivoId: ID
    propriedadeId: ID
    tipo: TipoAlerta
    severidade: SeveridadeAlerta
    status: StatusAlerta
    lido: Boolean
  }

  # ==========================================
  # QUERIES
  # ==========================================

  type Query {
    # ========== PROGRAMAÇÃO DE IRRIGAÇÃO ==========
    programacao(id: ID!): ProgramacaoIrrigacao
    programacoes(
      filtros: FiltroProgramacao
      pagina: Int = 0
      limite: Int = 10
    ): ProgramacaoPaginada!
    programacoesPorSetor(setorId: ID!): [ProgramacaoIrrigacao!]!
    programacoesAtivas: [ProgramacaoIrrigacao!]!
    proximasIrrigacoes(limite: Int = 10): [ProximaIrrigacao!]!

    # ========== HISTÓRICO DE IRRIGAÇÃO ==========
    historico(id: ID!): HistoricoIrrigacao
    historicos(
      filtros: FiltroHistorico
      pagina: Int = 0
      limite: Int = 10
    ): HistoricoPaginado!
    historicosPorSetor(setorId: ID!, limite: Int = 10): [HistoricoIrrigacao!]!
    irrigacoesEmAndamento: [HistoricoIrrigacao!]!

    # ========== STATUS DE IRRIGAÇÃO ==========
    statusIrrigacaoSetor(setorId: ID!): StatusIrrigacao
    statusIrrigacaoGeral: [StatusIrrigacao!]!

    # ========== ALERTAS ==========
    alerta(id: ID!): Alerta
    alertas(
      filtros: FiltroAlerta
      pagina: Int = 0
      limite: Int = 10
    ): AlertaPaginado!
    alertasAtivos(limite: Int = 20): [Alerta!]!
    alertasPorSetor(setorId: ID!): [Alerta!]!

    # ========== RELATÓRIOS E ESTATÍSTICAS ==========
    relatorioConsumo(
      setorId: ID!
      dataInicio: DateTime!
      dataFim: DateTime!
    ): RelatorioConsumo!
    estatisticasSetor(setorId: ID!): EstatisticasSetor!
    dashboardIrrigacao: DashboardIrrigacao!
  }

  # ==========================================
  # MUTATIONS
  # ==========================================

  type Mutation {
    # ========== PROGRAMAÇÃO DE IRRIGAÇÃO ==========
    criarProgramacao(input: ProgramacaoIrrigacaoInput!): ProgramacaoIrrigacao!
    atualizarProgramacao(id: ID!, input: ProgramacaoUpdateInput!): ProgramacaoIrrigacao!
    deletarProgramacao(id: ID!): Boolean!
    ativarProgramacao(id: ID!): ProgramacaoIrrigacao!
    desativarProgramacao(id: ID!): ProgramacaoIrrigacao!

    # ========== CONTROLE DE IRRIGAÇÃO ==========
    iniciarIrrigacaoManual(input: IniciarIrrigacaoInput!): HistoricoIrrigacao!
    pararIrrigacao(input: PararIrrigacaoInput!): HistoricoIrrigacao!
    executarProgramacao(programacaoId: ID!): HistoricoIrrigacao!

    # ========== ALERTAS ==========
    resolverAlerta(id: ID!, usuarioId: ID!, observacoes: String): Alerta!
    ignorarAlerta(id: ID!, usuarioId: ID!, observacoes: String): Alerta!
    marcarAlertaComoLido(id: ID!): Alerta!
    marcarTodosAlertasComoLidos(setorId: ID): Boolean!
  }
`;

module.exports = typeDefsIrrigacao;
