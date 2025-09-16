import amqp from "amqplib";
import { deleteIdentityById } from "./AuthService.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_FAILURE_EXCHANGE = process.env.RABBITMQ_FAILURE_EXCHANGE;
const RABBITMQ_FAILURE_EXCHANGE_TYPE = process.env.RABBITMQ_FAILURE_EXCHANGE_TYPE;
const RABBITMQ_FAILURE_ROUTING_KEY = process.env.RABBITMQ_FAILURE_ROUTING_KEY;

const RABBITMQ_FAILURE_QUEUE = `${RABBITMQ_FAILURE_EXCHANGE}.${RABBITMQ_FAILURE_ROUTING_KEY}`;

async function startFailureListener() {
    console.log("Starting Rabbit MQ Consumer for failed user profile creation...");

    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    await channel.assertExchange(
        RABBITMQ_FAILURE_EXCHANGE,
        RABBITMQ_FAILURE_EXCHANGE_TYPE,
        {
            durable: true,
        }
    );

    const q = await channel.assertQueue(
        RABBITMQ_FAILURE_QUEUE,
        {
            durable: true,
        }
    );

    await channel.bindQueue(q.queue, RABBITMQ_FAILURE_EXCHANGE, RABBITMQ_FAILURE_ROUTING_KEY);

    channel.consume(q.queue, async (msg) => {
        if (msg.content) {
            const payload = JSON.parse(msg.content.toString());
            console.log(` [!] Received profile creation failure for userId: ${payload.userId}`);

            try {
                await deleteIdentityById(payload.userId); // compensating transaction
                console.log(` [x] Compensating transaction successful. Deleted identity for ${payload.userId}`);
                channel.ack(msg);
            } catch (error) {
                console.error(" [x] Error during compensating transaction:", error);
                channel.nack(msg);
            }
        }
    });
}

export default startFailureListener;