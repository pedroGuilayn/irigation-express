const mongoose = require('mongoose');
require('dotenv').config();

const ProgramacaoIrrigacao = require('../src/models/ProgramacaoIrrigacao');
const HistoricoIrrigacao = require('../src/models/HistoricoIrrigacao');
const StatusIrrigacao = require('../src/models/StatusIrrigacao');
const Alerta = require('../src/models/Alerta');

async function populateMongoDB() {
    try {
        console.log('🌱 Populando MongoDB com dados de exemplo\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'irrigacao_db'
        });
        console.log('✓ Conectado ao MongoDB\n');

        // Adicionar mais programações
        console.log('📝 Adicionando programações...');

        const programacoes = [
            {
                nome: 'Irrigação Setor B - Tarde',
                setorId: 'setor-002',
                ativa: true,
                tipoRecorrencia: 'DIARIA',
                horarioInicio: '15:00',
                duracao: 45,
                volumeAgua: 750,
                prioridade: 7,
                observacoes: 'Irrigação vespertina para setor de hortaliças'
            },
            {
                nome: 'Irrigação Setor C - Semanal',
                setorId: 'setor-003',
                ativa: true,
                tipoRecorrencia: 'SEMANAL',
                horarioInicio: '06:00',
                diasSemana: [1, 3, 5], // Segunda, Quarta, Sexta
                duracao: 60,
                volumeAgua: 1000,
                prioridade: 9,
                observacoes: 'Irrigação profunda para frutíferas'
            },
            {
                nome: 'Irrigação de Emergência - Setor D',
                setorId: 'setor-004',
                ativa: false,
                tipoRecorrencia: 'UNICA',
                dataHoraInicio: new Date('2025-11-20T10:00:00'),
                duracao: 20,
                volumeAgua: 300,
                prioridade: 10,
                observacoes: 'Irrigação emergencial desativada'
            }
        ];

        for (const prog of programacoes) {
            const exists = await ProgramacaoIrrigacao.findOne({ nome: prog.nome });
            if (!exists) {
                await ProgramacaoIrrigacao.create(prog);
                console.log(`   ✓ Criada: ${prog.nome}`);
            }
        }

        // Adicionar históricos
        console.log('\n📊 Adicionando históricos...');

        const historicos = [
            {
                setorId: 'setor-001',
                dataHoraInicio: new Date('2025-11-19T07:00:00'),
                dataHoraFim: new Date('2025-11-19T07:30:00'),
                duracaoPlanejada: 30,
                duracaoReal: 30,
                tipoIrrigacao: 'PROGRAMADA',
                status: 'CONCLUIDA',
                volumeAguaPlanejado: 500,
                volumeAguaReal: 495
            },
            {
                setorId: 'setor-002',
                dataHoraInicio: new Date('2025-11-18T15:00:00'),
                dataHoraFim: new Date('2025-11-18T15:45:00'),
                duracaoPlanejada: 45,
                duracaoReal: 45,
                tipoIrrigacao: 'PROGRAMADA',
                status: 'CONCLUIDA',
                volumeAguaPlanejado: 750,
                volumeAguaReal: 740
            },
            {
                setorId: 'setor-003',
                dataHoraInicio: new Date(),
                duracaoPlanejada: 60,
                tipoIrrigacao: 'MANUAL',
                status: 'EM_ANDAMENTO',
                volumeAguaPlanejado: 1000,
                usuarioId: 'user-admin-123'
            }
        ];

        for (const hist of historicos) {
            await HistoricoIrrigacao.create(hist);
            console.log(`   ✓ Histórico criado para ${hist.setorId}`);
        }

        // Adicionar status para todos os setores
        console.log('\n📍 Adicionando status dos setores...');

        const statusList = [
            {
                setorId: 'setor-002',
                emIrrigacao: false,
                ultimaIrrigacao: new Date('2025-11-18T15:45:00'),
                proximaIrrigacao: new Date('2025-11-19T15:00:00'),
                totalIrrigacoesHoje: 0,
                totalIrrigacoesSemana: 5,
                totalIrrigacoesMes: 18
            },
            {
                setorId: 'setor-003',
                emIrrigacao: true,
                ultimaIrrigacao: new Date(),
                totalIrrigacoesHoje: 1,
                totalIrrigacoesSemana: 3,
                totalIrrigacoesMes: 12
            },
            {
                setorId: 'setor-004',
                emIrrigacao: false,
                totalIrrigacoesHoje: 0,
                totalIrrigacoesSemana: 0,
                totalIrrigacoesMes: 0
            }
        ];

        for (const status of statusList) {
            const exists = await StatusIrrigacao.findOne({ setorId: status.setorId });
            if (!exists) {
                await StatusIrrigacao.create(status);
                console.log(`   ✓ Status criado para ${status.setorId}`);
            }
        }

        // Adicionar alertas
        console.log('\n⚠️  Adicionando alertas...');

        const alertas = [
            {
                tipo: 'CONSUMO_ELEVADO',
                severidade: 'ALTA',
                titulo: 'Consumo de Água Elevado',
                descricao: 'Setor 002 está consumindo 15% acima do planejado',
                setorId: 'setor-002',
                status: 'ATIVO',
                lido: false
            },
            {
                tipo: 'IRRIGACAO_ATRASADA',
                severidade: 'MEDIA',
                titulo: 'Irrigação Atrasada',
                descricao: 'Programação do Setor 001 atrasou 10 minutos',
                setorId: 'setor-001',
                status: 'RESOLVIDO',
                lido: true,
                dataResolucao: new Date()
            },
            {
                tipo: 'DISPOSITIVO_OFFLINE',
                severidade: 'CRITICA',
                titulo: 'Dispositivo Offline',
                descricao: 'Dispositivo do Setor 004 está offline há 2 horas',
                setorId: 'setor-004',
                dispositivoId: 'device-004',
                status: 'ATIVO',
                lido: false
            }
        ];

        for (const alerta of alertas) {
            await Alerta.create(alerta);
            console.log(`   ✓ Alerta criado: ${alerta.titulo}`);
        }

        // Resumo final
        console.log('\n' + '═'.repeat(60));
        console.log('📊 RESUMO FINAL:');
        console.log('═'.repeat(60));

        const totalProgramacoes = await ProgramacaoIrrigacao.countDocuments();
        const totalHistoricos = await HistoricoIrrigacao.countDocuments();
        const totalStatus = await StatusIrrigacao.countDocuments();
        const totalAlertas = await Alerta.countDocuments();

        console.log(`✓ Programações: ${totalProgramacoes}`);
        console.log(`✓ Históricos: ${totalHistoricos}`);
        console.log(`✓ Status: ${totalStatus}`);
        console.log(`✓ Alertas: ${totalAlertas}`);

        console.log('\n🎉 MongoDB populado com sucesso!');
        console.log('\nAgora faça REFRESH no DataGrip para ver os dados!');

    } catch (error) {
        console.error('❌ Erro:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

populateMongoDB()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
