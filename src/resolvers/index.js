
const { mergeResolvers } = require('@graphql-tools/merge');
const usuarioResolvers = require('./usuarioResolvers');
const propriedadeResolvers = require('./propriedadeResolvers');
const dispositivoResolvers = require('./dispositivoResolvers');
const setorResolvers = require('./setorResolvers');
const dashboardResolvers = require('./dashboardResolvers');
const scalars = require('./scalars');

// Combinar todos os resolvers
const resolvers = {
  // Scalars customizados
  ...scalars,

  // Queries
  Query: {
    ...usuarioResolvers.Query,
    ...propriedadeResolvers.Query,
    ...dispositivoResolvers.Query,
    ...setorResolvers.Query,
    ...dashboardResolvers.Query,
  },

  // Mutations
  Mutation: {
    ...usuarioResolvers.Mutation,
    ...propriedadeResolvers.Mutation,
    ...dispositivoResolvers.Mutation,
    ...setorResolvers.Mutation,
  },

  // Resolvers de tipo (relacionamentos)
  Usuario: usuarioResolvers.Usuario,
  Propriedade: propriedadeResolvers.Propriedade,
  Dispositivo: dispositivoResolvers.Dispositivo,
  Setor: setorResolvers.Setor,
};

module.exports = resolvers;
