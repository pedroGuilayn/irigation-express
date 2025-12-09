require('dotenv').config();
const logProducer = require('./src/messageService/Producer');

async function testRabbitMQ() {
    console.log('🧪 Teste de Comunicação RabbitMQ\n');

    try {
        console.log('1. Conectando ao RabbitMQ...');
        await logProducer.connect();
        console.log('   ✓ Conectado!\n');

        console.log('2. Enviando mensagem de teste...');
        await logProducer.sendLog(
            'TESTE: Mensagem enviada via script de teste direto',
            'test-user-123'
        );
        console.log('   ✓ Mensagem enviada!\n');

        console.log('3. Aguardando 2 segundos para processamento...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n✅ Teste concluído!');
        console.log('\nVerifique:');
        console.log('- Logs do Spring Boot: Procure por "Received irrigation log"');
        console.log('- PostgreSQL: Execute "node scripts/check-postgres.js"');
        console.log('- RabbitMQ UI: http://localhost:15672/#/queues (veja a fila irrigation.logs.queue)');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        throw error;
    } finally {
        await logProducer.close();
        console.log('\nConexão fechada.');
    }
}

// Executar teste
testRabbitMQ()
    .then(() => {
        console.log('\n✓ Script finalizado com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Erro:', error.message);
        process.exit(1);
    });
