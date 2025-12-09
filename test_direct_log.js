const amqp = require('amqplib');

async function testDirectLog() {
    try {
        console.log('🧪 Teste de Log Direto via RabbitMQ');
        console.log('=====================================\n');

        // Conectar ao RabbitMQ
        const rabbitmqUrl = 'amqp://guest:guest@localhost:5672/';
        console.log('📡 Conectando ao RabbitMQ...');
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        // Configurar exchange
        const exchangeName = 'irrigation.logs.exchange';
        const routingKey = 'irrigation.logs.critical';

        await channel.assertExchange(exchangeName, 'topic', { durable: true });
        console.log('✅ Conectado ao RabbitMQ com sucesso!\n');

        // Enviar várias mensagens de teste
        const testMessages = [
            {
                message: 'CRITICAL: Teste - Falha ao comunicar com dispositivo DEV-001 no setor SETOR-ALPHA',
                userId: 'test-user-123'
            },
            {
                message: 'WARNING: Teste - Irrigação interrompida prematuramente no setor SETOR-BETA. Duração real: 15 minutos, Planejado: 30 minutos',
                userId: 'test-user-456'
            },
            {
                message: 'CRITICAL: Teste - Falha ao executar irrigação programada (ID: PROG-999) no setor SETOR-GAMMA. Dispositivo DEV-002 offline',
                userId: null
            },
            {
                message: 'INFO: Teste - Nova programação criada para setor SETOR-DELTA (Tipo: DIARIA, ID: PROG-888)',
                userId: 'test-user-789'
            }
        ];

        console.log(`📤 Enviando ${testMessages.length} mensagens de teste...\n`);

        for (let i = 0; i < testMessages.length; i++) {
            const logData = testMessages[i];
            const content = Buffer.from(JSON.stringify(logData));

            channel.publish(
                exchangeName,
                routingKey,
                content,
                { persistent: true }
            );

            console.log(`  ${i + 1}. ✅ ${logData.message.substring(0, 80)}...`);
        }

        console.log('\n✅ Todas as mensagens foram enviadas com sucesso!');

        // Aguardar um pouco antes de fechar
        await new Promise(resolve => setTimeout(resolve, 1000));

        await channel.close();
        await connection.close();

        console.log('\n🎯 Próximos passos:');
        console.log('   1. Aguarde alguns segundos para o Spring Boot processar');
        console.log('   2. Verifique os logs no console do Spring Boot');
        console.log('   3. Acesse http://localhost:8081/h2-console');
        console.log('   4. Execute: SELECT * FROM irrigation_logs ORDER BY timestamp DESC;');
        console.log('\n=====================================');

    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.message);
        process.exit(1);
    }
}

testDirectLog();
