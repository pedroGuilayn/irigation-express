const mongoose = require('mongoose');
require('dotenv').config();

async function viewMongoDB() {
    try {
        console.clear();
        console.log('\n' + '═'.repeat(80));
        console.log('🔍 VISUALIZADOR MONGODB - TERMINAL'.padStart(50));
        console.log('═'.repeat(80) + '\n');

        // Conectar
        console.log('🔌 Conectando...');
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'irrigacao_db'
        });

        const db = mongoose.connection.db;
        console.log(`✓ Conectado ao banco: ${db.databaseName}\n`);

        // Listar todas as collections
        const collections = await db.listCollections().toArray();
        console.log('📦 COLLECTIONS DISPONÍVEIS:');
        console.log('─'.repeat(80));

        const collectionNames = collections.map(c => c.name);

        for (let i = 0; i < collectionNames.length; i++) {
            const colName = collectionNames[i];
            const count = await db.collection(colName).countDocuments();
            console.log(`  ${(i + 1).toString().padStart(2)}. ${colName.padEnd(30)} (${count} documentos)`);
        }

        console.log('\n' + '═'.repeat(80));
        console.log('📄 DETALHES DAS COLLECTIONS DE IRRIGAÇÃO');
        console.log('═'.repeat(80) + '\n');

        // Mostrar detalhes de cada collection de irrigação
        const irrigationCollections = [
            'programacaoirrigacaos',
            'historicoirrigacaos',
            'statusirrigacaos',
            'alertas'
        ];

        for (const colName of irrigationCollections) {
            console.log(`\n${'▼'.repeat(40)}`);
            console.log(`📌 ${colName.toUpperCase()}`);
            console.log('─'.repeat(80));

            const collection = db.collection(colName);
            const count = await collection.countDocuments();
            console.log(`Total de documentos: ${count}\n`);

            if (count > 0) {
                const docs = await collection.find({}).toArray();

                docs.forEach((doc, index) => {
                    console.log(`\n  📄 Documento ${index + 1}/${docs.length}:`);
                    console.log('  ' + '┄'.repeat(76));

                    // Mostrar campos principais de forma organizada
                    const displayDoc = { ...doc };
                    delete displayDoc.__v; // Remover versão do mongoose

                    // Formatar para exibição
                    const formatted = JSON.stringify(displayDoc, null, 2)
                        .split('\n')
                        .map(line => '  ' + line)
                        .join('\n');

                    console.log(formatted);
                });
            } else {
                console.log('  (Collection vazia)');
            }
        }

        // Outras collections
        console.log('\n\n' + '═'.repeat(80));
        console.log('📦 OUTRAS COLLECTIONS');
        console.log('═'.repeat(80) + '\n');

        const otherCollections = ['propriedades', 'dispositivos', 'usuarios', 'setors'];

        for (const colName of otherCollections) {
            if (collectionNames.includes(colName)) {
                const collection = db.collection(colName);
                const count = await collection.countDocuments();
                console.log(`\n📌 ${colName}: ${count} documentos`);

                if (count > 0) {
                    const sample = await collection.findOne({});
                    console.log('  Exemplo de documento:');
                    const formatted = JSON.stringify(sample, null, 2)
                        .split('\n')
                        .slice(0, 10) // Apenas primeiras 10 linhas
                        .map(line => '    ' + line)
                        .join('\n');
                    console.log(formatted);
                    if (count > 1) {
                        console.log('    ... (e mais ' + (count - 1) + ' documentos)');
                    }
                }
            }
        }

        // Estatísticas finais
        console.log('\n\n' + '═'.repeat(80));
        console.log('📊 ESTATÍSTICAS GERAIS');
        console.log('═'.repeat(80));

        let totalDocs = 0;
        for (const colName of collectionNames) {
            const count = await db.collection(colName).countDocuments();
            totalDocs += count;
        }

        console.log(`\n  Total de Collections: ${collectionNames.length}`);
        console.log(`  Total de Documentos: ${totalDocs}`);
        console.log(`  Banco de Dados: ${db.databaseName}`);
        console.log(`  Host: ${mongoose.connection.host}`);

        console.log('\n' + '═'.repeat(80));
        console.log('✅ VISUALIZAÇÃO COMPLETA!');
        console.log('═'.repeat(80) + '\n');

        // Informações de conexão para DataGrip
        console.log('💡 DICA: Se o DataGrip não mostra estas collections, verifique:');
        console.log(`   1. Database está configurado como: ${db.databaseName}`);
        console.log(`   2. String de conexão: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':***@')}`);
        console.log(`   3. Faça Refresh (F5) ou reinicie o DataGrip`);
        console.log('\n');

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexão fechada.\n');
    }
}

// Menu interativo
async function menu() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n🎯 Pressione ENTER para ver os dados do MongoDB...');

    rl.question('', async () => {
        rl.close();
        await viewMongoDB();
        process.exit(0);
    });
}

// Se executado diretamente
if (require.main === module) {
    viewMongoDB()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = { viewMongoDB };
