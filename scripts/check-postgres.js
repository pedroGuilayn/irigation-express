const { Client } = require('pg');

async function checkPostgres() {
    const connectionString = 'postgresql://neondb_owner:npg_eusDQM8X9vBH@ep-soft-silence-acaazcbg-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Conectando ao PostgreSQL (Neon)...');
        await client.connect();
        console.log('✓ Conectado ao PostgreSQL');

        // Listar todas as tabelas
        const result = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('\nTabelas existentes:');
        if (result.rows.length === 0) {
            console.log('  (nenhuma tabela encontrada)');
            console.log('\nNOTA: As tabelas serão criadas automaticamente quando a aplicação Spring subir,');
            console.log('      pois o application.properties tem spring.jpa.hibernate.ddl-auto=create');
        } else {
            result.rows.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });

            // Contar registros em irrigation_logs se existir
            const tables = result.rows.map(r => r.table_name);
            if (tables.includes('irrigation_logs')) {
                const countResult = await client.query('SELECT COUNT(*) FROM irrigation_logs');
                console.log(`\nRegistros em irrigation_logs: ${countResult.rows[0].count}`);

                // Mostrar últimos 5 logs
                if (parseInt(countResult.rows[0].count) > 0) {
                    const logsResult = await client.query(`
                        SELECT id, message, user_id, timestamp
                        FROM irrigation_logs
                        ORDER BY timestamp DESC
                        LIMIT 5
                    `);
                    console.log('\nÚltimos 5 logs:');
                    logsResult.rows.forEach(log => {
                        console.log(`  [${log.timestamp}] ${log.message} (user: ${log.user_id || 'N/A'})`);
                    });
                }
            }
        }

        console.log('\n✓ Verificação do PostgreSQL concluída!');

    } catch (error) {
        console.error('Erro ao conectar no PostgreSQL:', error.message);
        throw error;
    } finally {
        await client.end();
        console.log('\nConexão fechada.');
    }
}

checkPostgres()
    .then(() => {
        console.log('\n✓ Processo finalizado com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Erro no processo:', error.message);
        process.exit(1);
    });
