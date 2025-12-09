require('dotenv').config();
const logProducer = require('./src/messageService/Producer');

/**
 * Script para testar envio de LOGS CRÍTICOS via RabbitMQ
 * Estes são exemplos de logs que REALMENTE deveriam ser enviados
 */

const logsExemplos = [
    {
        tipo: 'ERRO_CRITICO',
        mensagem: '🔴 ERRO CRÍTICO: Sensor de umidade do setor-001 offline há 30 minutos',
        userId: 'system'
    },
    {
        tipo: 'ALERTA_CONSUMO',
        mensagem: '⚠️ ALERTA: Consumo de água 45% acima do esperado no setor-002',
        userId: 'sensor-monitoring'
    },
    {
        tipo: 'FALHA_IRRIGACAO',
        mensagem: '❌ FALHA: Irrigação do setor-003 cancelada - Válvula não responde',
        userId: 'irrigation-controller'
    },
    {
        tipo: 'DISPOSITIVO_OFFLINE',
        mensagem: '🚨 CRÍTICO: Dispositivo principal offline - Sistema em modo degradado',
        userId: 'device-monitor'
    },
    {
        tipo: 'VAZAMENTO_DETECTADO',
        mensagem: '💧 EMERGÊNCIA: Possível vazamento detectado no setor-004 (pressão anormal)',
        userId: 'pressure-sensor'
    },
    {
        tipo: 'IRRIGACAO_ATRASADA',
        mensagem: '⏰ ATRASO: Irrigação programada do setor-001 atrasou 25 minutos',
        userId: 'scheduler'
    },
    {
        tipo: 'BATERIA_BAIXA',
        mensagem: '🔋 AVISO: Bateria do sensor wireless abaixo de 15% - Substituição necessária',
        userId: 'power-monitor'
    },
    {
        tipo: 'MANUTENCAO_NECESSARIA',
        mensagem: '🔧 MANUTENÇÃO: Filtro do sistema atingiu limite de uso (500h) - Limpeza urgente',
        userId: 'maintenance-system'
    }
];

async function enviarLogsExemplo() {
    console.clear();
    console.log('\n' + '═'.repeat(80));
    console.log('🚨 TESTE: ENVIANDO LOGS CRÍTICOS VIA RABBITMQ'.padStart(55));
    console.log('═'.repeat(80) + '\n');

    console.log('📋 Estes são exemplos de logs que o sistema DEVERIA enviar:');
    console.log('   ❌ Erros críticos');
    console.log('   ⚠️  Alertas importantes');
    console.log('   🚨 Emergências');
    console.log('   🔧 Avisos de manutenção\n');
    console.log('─'.repeat(80) + '\n');

    try {
        await logProducer.connect();
        console.log('✅ Conectado ao RabbitMQ\n');

        console.log('📤 Enviando logs de exemplo...\n');

        for (let i = 0; i < logsExemplos.length; i++) {
            const log = logsExemplos[i];

            console.log(`${i + 1}. [${log.tipo}]`);
            console.log(`   ${log.mensagem}`);
            console.log(`   Usuário: ${log.userId}`);

            await logProducer.sendLog(log.mensagem, log.userId);

            console.log('   ✅ Enviado!\n');

            // Pequena pausa para visualizar melhor
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('─'.repeat(80));
        console.log(`\n✅ ${logsExemplos.length} logs críticos enviados com sucesso!\n`);

        console.log('🔍 COMO VISUALIZAR NO RABBITMQ UI:');
        console.log('─'.repeat(80));
        console.log('1. Abra: http://localhost:15672');
        console.log('2. Login: guest / guest');
        console.log('3. Vá em "Queues and Streams"');
        console.log('4. Clique em "irrigation.logs.queue"');
        console.log('5. Role até "Get messages"');
        console.log('6. Em "Messages", coloque: 10');
        console.log('7. Clique em "Get Message(s)"');
        console.log('8. Você verá os logs que acabamos de enviar!\n');

        console.log('📊 VERIFICAR NO POSTGRESQL:');
        console.log('─'.repeat(80));
        console.log('Execute: node scripts/check-postgres.js\n');

        console.log('💡 DICA:');
        console.log('─'.repeat(80));
        console.log('Na fila do RabbitMQ, veja as estatísticas:');
        console.log('  • Message rates → Mostra taxa de mensagens/segundo');
        console.log(`  • Total → Deve estar aumentando (+ ${logsExemplos.length} mensagens)`);
        console.log('  • Consumers → Deve mostrar 1 (Spring Boot)');
        console.log('  • Incoming/Deliver/Ack → Mostra fluxo de mensagens\n');

        await logProducer.close();

    } catch (error) {
        console.error('❌ Erro:', error.message);
        throw error;
    }
}

// Menu interativo
console.log('\n🎯 Este script vai enviar 8 logs críticos de exemplo.');
console.log('   Você poderá visualizá-los na interface do RabbitMQ.\n');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Pressione ENTER para enviar os logs... ', () => {
    readline.close();
    enviarLogsExemplo()
        .then(() => {
            console.log('✅ Concluído!\n');
            process.exit(0);
        })
        .catch(error => {
            console.error('Erro fatal:', error);
            process.exit(1);
        });
});
