const mongoose = require('mongoose');
require('dotenv').config();

// Importar os models
const ProgramacaoIrrigacao = require('../src/models/ProgramacaoIrrigacao');
const HistoricoIrrigacao = require('../src/models/HistoricoIrrigacao');
const StatusIrrigacao = require('../src/models/StatusIrrigacao');
const Alerta = require('../src/models/Alerta');

async function setupMongoDB() {
    try {
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'irrigacao_db'
        });
        console.log('✓ Conectado ao MongoDB');

        // Listar collections existentes
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections existentes:');
        collections.forEach(col => console.log(`  - ${col.name}`));

        // Criar indexes e garantir que as collections existam
        console.log('\nCriando/verificando collections e indexes...');

        await ProgramacaoIrrigacao.createIndexes();
        console.log('✓ Collection "programacaoirrigacaos" criada/verificada');

        await HistoricoIrrigacao.createIndexes();
        console.log('✓ Collection "historicoirrigacaos" criada/verificada');

        await StatusIrrigacao.createIndexes();
        console.log('✓ Collection "statusirrigacaos" criada/verificada');

        await Alerta.createIndexes();
        console.log('✓ Collection "alertas" criada/verificada');

        // Verificar se existem dados
        const programacaoCount = await ProgramacaoIrrigacao.countDocuments();
        const historicoCount = await HistoricoIrrigacao.countDocuments();
        const statusCount = await StatusIrrigacao.countDocuments();
        const alertaCount = await Alerta.countDocuments();

        console.log('\nQuantidade de documentos por collection:');
        console.log(`  - Programações: ${programacaoCount}`);
        console.log(`  - Históricos: ${historicoCount}`);
        console.log(`  - Status: ${statusCount}`);
        console.log(`  - Alertas: ${alertaCount}`);

        // Inserir dados de exemplo se não houver dados
        if (programacaoCount === 0) {
            console.log('\nInserindo dados de exemplo...');

            const programacaoExemplo = new ProgramacaoIrrigacao({
                nome: 'Irrigação Setor A - Manhã',
                setorId: 'setor-001',
                ativa: true,
                tipoRecorrencia: 'DIARIA',
                horarioInicio: '07:00',
                duracao: 30,
                volumeAgua: 500,
                prioridade: 8,
                observacoes: 'Programação de teste criada pelo setup'
            });
            await programacaoExemplo.save();
            console.log('✓ Programação de exemplo criada');

            const statusExemplo = new StatusIrrigacao({
                setorId: 'setor-001',
                emIrrigacao: false,
                totalIrrigacoesHoje: 0,
                totalIrrigacoesSemana: 0,
                totalIrrigacoesMes: 0,
                proximaIrrigacao: new Date(new Date().setHours(7, 0, 0, 0))
            });
            await statusExemplo.save();
            console.log('✓ Status de exemplo criado');

            const alertaExemplo = new Alerta({
                tipo: 'OUTRO',
                severidade: 'BAIXA',
                titulo: 'Sistema Iniciado',
                descricao: 'Sistema de irrigação inicializado com sucesso',
                setorId: 'setor-001',
                status: 'ATIVO',
                lido: false
            });
            await alertaExemplo.save();
            console.log('✓ Alerta de exemplo criado');
        }

        console.log('\n✓ Setup do MongoDB concluído com sucesso!');

    } catch (error) {
        console.error('Erro no setup do MongoDB:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\nConexão fechada.');
    }
}

// Executar o setup
setupMongoDB()
    .then(() => {
        console.log('\n✓ Processo finalizado com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Erro no processo:', error);
        process.exit(1);
    });
