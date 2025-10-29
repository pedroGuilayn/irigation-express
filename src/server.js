
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/database');
const typeDefs = require('./schemas/typeDefs');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Conectar ao MongoDB
  await connectDB();

  // Configurar Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Aqui você pode adicionar autenticação, usuário logado, etc
      return {
        req,
      };
    },
    formatError: (error) => {
      console.error('❌ GraphQL Error:', error.message);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
    introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
    playground: process.env.GRAPHQL_PLAYGROUND === 'true',
  });

  // Iniciar Apollo Server
  await server.start();

  // Aplicar middleware do Apollo ao Express
  server.applyMiddleware({ 
    app,
    path: '/graphql'
  });

  // Rota de health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK',
      message: 'API de Irrigação GraphQL está funcionando!',
      timestamp: new Date().toISOString()
    });
  });

  // Rota raiz
  app.get('/', (req, res) => {
    res.json({
      message: '🌱 API GraphQL - Sistema de Irrigação Inteligente',
      version: '1.0.0',
      graphql: `http://localhost:${PORT}${server.graphqlPath}`,
      health: `http://localhost:${PORT}/health`,
      docs: 'Acesse /graphql para ver o GraphQL Playground'
    });
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('\n🚀 ========================================');
    console.log('🚀  Servidor iniciado com sucesso!');
    console.log('🚀 ========================================');
    console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`🎯 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🎮 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log('🚀 ========================================\n');
  });
}

// Capturar erros não tratados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

// Iniciar servidor
startServer().catch((err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});
