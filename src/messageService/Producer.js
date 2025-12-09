const amqp = require('amqplib');

class IrrigationLogProducer {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.exchangeName = 'irrigation.logs.exchange';
        this.routingKey = 'irrigation.logs.critical';
    }

    async connect() {
        try {
            if (!this.connection) {
                const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`;
                this.connection = await amqp.connect(rabbitmqUrl);
                this.channel = await this.connection.createChannel();

                // Configurar exchange
                await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });

                console.log('RabbitMQ connected successfully for irrigation logs');
            }
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async sendLog(message, userId = null) {
        try {
            await this.connect();

            const logData = {
                message,
                userId
            };

            const content = Buffer.from(JSON.stringify(logData));

            this.channel.publish(
                this.exchangeName,
                this.routingKey,
                content,
                { persistent: true }
            );

            console.log(`Log sent to RabbitMQ: ${message}`);
        } catch (error) {
            console.error('Error sending log to RabbitMQ:', error);
            // Não lançar erro para não interromper o fluxo principal
        }
    }

    async close() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}

// Singleton instance
const logProducer = new IrrigationLogProducer();

module.exports = logProducer;