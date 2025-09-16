import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_USER_EXCHANGE = process.env.RABBITMQ_USER_EXCHANGE;
const RABBITMQ_USER_EXCHANGE_TYPE = process.env.RABBITMQ_USER_EXCHANGE_TYPE;
const RABBITMQ_USER_ROUTING_KEY = process.env.RABBITMQ_USER_ROUTING_KEY;

// const RABBITMQ_EMAIL_EXCHANGE = process.env.RABBITMQ_EMAIL_EXCHANGE;
// const RABBITMQ_EMAIL_EXCHANGE_TYPE = process.env.RABBITMQ_EMAIL_EXCHANGE_TYPE;
// const RABBITMQ_EMAIL_ROUTING_KEY = process.env.RABBITMQ_EMAIL_ROUTING_KEY;


async function publishUserCreated(payload) {
    console.log("payload", payload)
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();

    const msg = JSON.stringify(payload);

    await ch.assertExchange(
        RABBITMQ_USER_EXCHANGE,
        RABBITMQ_USER_EXCHANGE_TYPE,
        {
            durable: true
        }
    );

    await ch.assertQueue(`${RABBITMQ_USER_EXCHANGE}.${RABBITMQ_USER_ROUTING_KEY}`, { durable: true });
    await ch.bindQueue(
        `${RABBITMQ_USER_EXCHANGE}.${RABBITMQ_USER_ROUTING_KEY}`,
        RABBITMQ_USER_EXCHANGE,
        RABBITMQ_USER_ROUTING_KEY
    );


    ch.publish(RABBITMQ_USER_EXCHANGE, RABBITMQ_USER_ROUTING_KEY, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);

    // await channel.close();
    // await conn.close();
}

export default publishUserCreated;
