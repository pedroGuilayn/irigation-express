
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      dbName: process.env.DB_NAME || 'irrigacao_db',
      retryWrites: true,
      w: 'majority',
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB conectado com sucesso!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Mongoose desconectado devido ao encerramento da aplicação');
  process.exit(0);
});

module.exports = connectDB;
