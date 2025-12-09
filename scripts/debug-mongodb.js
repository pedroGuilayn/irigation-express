const mongoose = require('mongoose');
require('dotenv').config();

async function debugMongoDB() {
    try {
        console.log('🔍 DEBUG: Informações do MongoDB\n');
        console.log('═'.repeat(60));

        // Mostrar variáveis de ambiente
        console.log('📋 Variáveis de Ambiente:');
        console.log(`   MONGODB_URI: ${process.env.MONGODB_URI}`);
        console.log(`   DB_NAME: ${process.env.DB_NAME || 'irrigacao_db'}`);
        console.log('═'.repeat(60));

        console.log('\n🔌 Conectando ao MongoDB...');
        const dbName = process.env.DB_NAME || 'irrigacao_db';

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: dbName
        });
        console.log('✓ Conectado!');

        // Pegar informações da conexão
        const db = mongoose.connection.db;
        const admin = db.admin();

        console.log('\n📊 Informações da Conexão:');
        console.log(`   Database atual: ${db.databaseName}`);
        console.log(`   Host: ${mongoose.connection.host}`);

        // Listar TODOS os bancos de dados
        console.log('\n🗄️  Todos os Bancos de Dados no Servidor:');
        const dbList = await admin.listDatabases();
        dbList.databases.forEach(database => {
            const isCurrent = database.name === db.databaseName;
            console.log(`   ${isCurrent ? '→' : ' '} ${database.name} (${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });

        // Listar collections no banco atual
        console.log('\n📦 Collections no banco "' + db.databaseName + '":');
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.log('   (nenhuma collection encontrada)');
        } else {
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`   - ${col.name} (${count} documentos)`);
            }
        }

        // Mostrar dados de cada collection relacionada à irrigação
        console.log('\n📄 Dados das Collections de Irrigação:');
        console.log('─'.repeat(60));

        const irrigationCollections = [
            'programacaoirrigacaos',
            'historicoirrigacaos',
            'statusirrigacaos',
            'alertas'
        ];

        for (const collName of irrigationCollections) {
            const collection = db.collection(collName);
            const count = await collection.countDocuments();
            console.log(`\n📌 ${collName} (${count} documentos):`);

            if (count > 0) {
                const docs = await collection.find({}).limit(3).toArray();
                docs.forEach((doc, index) => {
                    console.log(`   Doc ${index + 1}:`, JSON.stringify(doc, null, 2).substring(0, 200) + '...');
                });
            } else {
                console.log('   (vazia)');
            }
        }

        // String de conexão para DataGrip
        console.log('\n🔗 String de Conexão para DataGrip:');
        console.log('─'.repeat(60));
        console.log('IMPORTANTE: Use estas informações no DataGrip:\n');
        console.log(`Host: ${mongoose.connection.host}`);
        console.log(`Database: ${db.databaseName}`);
        console.log(`Connection String: ${process.env.MONGODB_URI}`);
        console.log('\nNo DataGrip:');
        console.log('1. Clique com botão direito na conexão');
        console.log('2. Properties → General → Database');
        console.log(`3. Certifique-se que está: ${db.databaseName}`);
        console.log('4. Clique em "Test Connection"');
        console.log('5. Clique com botão direito na conexão → Refresh');
        console.log('─'.repeat(60));

        console.log('\n✅ Debug concluído!');

    } catch (error) {
        console.error('❌ Erro:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

debugMongoDB()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erro fatal:', error);
        process.exit(1);
    });
