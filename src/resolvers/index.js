// Resolvers focados em irrigação
const programacaoResolvers = require('./programacaoResolvers');
const controleResolvers = require('./controleResolvers');
const historicoResolvers = require('./historicoResolvers');
const alertaResolvers = require('./alertaResolvers');
const relatorioResolvers = require('./relatorioResolvers');
const scalars = require('./scalars');

// Os resolvers abaixo foram removidos pois essas entidades
// são gerenciadas pela API externa em Spring Boot
// const usuarioResolvers = require('./usuarioResolvers');
// const propriedadeResolvers = require('./propriedadeResolvers');
// const dispositivoResolvers = require('./dispositivoResolvers');
// const setorResolvers = require('./setorResolvers');
// const dashboardResolvers = require('./dashboardResolvers');

const resolvers = {
  ...scalars,

  Query: {
    ...programacaoResolvers.Query,
    ...historicoResolvers.Query,
    ...alertaResolvers.Query,
    ...relatorioResolvers.Query,
  },

  Mutation: {
    ...programacaoResolvers.Mutation,
    ...controleResolvers.Mutation,
    ...alertaResolvers.Mutation,
  },

  // Field resolvers
  ProgramacaoIrrigacao: programacaoResolvers.ProgramacaoIrrigacao,
  HistoricoIrrigacao: historicoResolvers.HistoricoIrrigacao,
  StatusIrrigacao: historicoResolvers.StatusIrrigacao,
  Alerta: alertaResolvers.Alerta,
};

module.exports = resolvers;
