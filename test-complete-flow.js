require('dotenv').config();
const logProducer = require('./src/messageService/Producer');
const { Client } = require('pg');

async function testCompleteFlow() {
    console.clear();
    console.log('\n' + '═'.repeat(80));
    console.log('🧪 TESTE COMPLETO DO FLUXO RABBITMQ'.padStart(55));
    console.log('═'.repeat(80) + '\n');

    console.log('📋 FLUXO QUE SERÁ TESTADO:');
    console.log('   1. Express envia mensagem para RabbitMQ');
    console.log('   2. RabbitMQ recebe e roteia para a fila');
    console.log('   3. Spring consome a mensagem');
    console.log('   4. Spring salva no PostgreSQL');
    console.log('\n' + '─'.repeat(80) + '\n');

    try {
        // Conectar no PostgreSQL para verificar antes
        const pgClient = new Client({
            connectionString: 'postgresql://neondb_owner:npg_eusDQM8X9vBH@ep-soft-silence-acaazcbg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
            ssl: { rejectUnauthorized: false }
        });

        await pgClient.connect();

        // Ver quantos logs existem ANTES
        const beforeResult = await pgClient.query('SELECT COUNT(*) FROM irrigation_logs');
        const countBefore = parseInt(beforeResult.rows[0].count);

        console.log('📊 ESTADO INICIAL:');
        console.log(`   Logs no PostgreSQL ANTES: ${countBefore}`);
        console.log('\n' + '─'.repeat(80) + '\n');

        // Enviar mensagem via RabbitMQ
        console.log('📤 PASSO 1: Enviando mensagem via RabbitMQ...');
        await logProducer.connect();

        const timestamp = new Date().toLocaleString('pt-BR');
        const mensagem = `TESTE COMPLETO: Mensagem enviada em ${timestamp}`;

        await logProducer.sendLog(mensagem, 'user-test-flow');
        console.log('   ✅ Mensagem enviada!');
        console.log(`   📝 Conteúdo: "${mensagem}"`);

        console.log('\n⏳ Aguardando 3 segundos para o Spring processar...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verificar PostgreSQL depois
        console.log('🔍 PASSO 2: Verificando PostgreSQL...');
        const afterResult = await pgClient.query('SELECT COUNT(*) FROM irrigation_logs');
        const countAfter = parseInt(afterResult.rows[0].count);

        console.log(`   Logs no PostgreSQL DEPOIS: ${countAfter}`);

        if (countAfter > countBefore) {
            console.log('\n   ✅ SUCESSO! Novo log foi adicionado!\n');

            // Mostrar o log mais recente
            const lastLog = await pgClient.query(`
                SELECT message, user_id, timestamp
                FROM irrigation_logs
                ORDER BY timestamp DESC
                LIMIT 1
            `);

            console.log('📄 ÚLTIMO LOG SALVO:');
            console.log('─'.repeat(80));
            const log = lastLog.rows[0];
            console.log(`   Mensagem: ${log.message}`);
            console.log(`   Usuário:  ${log.user_id || 'N/A'}`);
            console.log(`   Timestamp: ${log.timestamp}`);
            console.log('─'.repeat(80));

        } else {
            console.log('\n   ⚠️  ATENÇÃO: Nenhum novo log foi adicionado!');
            console.log('   Verifique se o Spring Boot está rodando.');
        }

        // Resumo final
        console.log('\n' + '═'.repeat(80));
        console.log('📊 RESUMO DO TESTE');
        console.log('═'.repeat(80));
        console.log(`   Logs ANTES:  ${countBefore}`);
        console.log(`   Logs DEPOIS: ${countAfter}`);
        console.log(`   Novos logs:  ${countAfter - countBefore}`);
        console.log('═'.repeat(80) + '\n');

        if (countAfter > countBefore) {
            console.log('🎉 FLUXO RABBITMQ FUNCIONANDO PERFEITAMENTE!\n');
            console.log('✅ Checklist:');
            console.log('   ✅ Express enviou para RabbitMQ');
            console.log('   ✅ RabbitMQ roteou para a fila');
            console.log('   ✅ Spring consumiu a mensagem');
            console.log('   ✅ PostgreSQL recebeu o log');
        } else {
            console.log('⚠️  O log não foi salvo no banco.');
            console.log('   Possíveis causas:');
            console.log('   - Spring Boot não está rodando');
            console.log('   - Erro na conexão RabbitMQ → Spring');
            console.log('   - Erro na conexão Spring → PostgreSQL');
        }

        await pgClient.end();
        await logProducer.close();

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        console.error(error);
    }

    console.log('\n');
}

testCompleteFlow()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
