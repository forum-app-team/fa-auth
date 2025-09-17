import "dotenv/config";

import startFailureListener from "../src/services/FailureConsumer.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_FAILURE_EXCHANGE = process.env.RABBITMQ_FAILURE_EXCHANGE;
const RABBITMQ_FAILURE_ROUTING_KEY = process.env.RABBITMQ_FAILURE_ROUTING_KEY;
const RABBITMQ_FAILURE_QUEUE = `${RABBITMQ_FAILURE_EXCHANGE}.${RABBITMQ_FAILURE_ROUTING_KEY}`;

(async () => {
    try {
        await startFailureListener();
        console.log(`Consumer started successfully.
- Connected to: '${RABBITMQ_URL}'
- Bound to exchange: '${RABBITMQ_FAILURE_EXCHANGE}'
- Using routing key: '${RABBITMQ_FAILURE_ROUTING_KEY}'
- Listening on queue: '${RABBITMQ_FAILURE_QUEUE}'

To exit press CTRL+C`
        );
    } catch (err) {
        console.error("Unable to start worker:", err);
        process.exit(1);
    }
})();