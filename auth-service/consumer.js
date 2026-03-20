const amqp = require("amqplib");

async function receive() {
  const conn = await amqp.connect("amqp://localhost");
  const ch = await conn.createChannel();

  const queue = "test_queue";
  await ch.assertQueue(queue);

  console.log("⏳ Waiting for messages...");

  ch.consume(queue, (msg) => {
    console.log("📥 Received:", msg.content.toString());
    ch.ack(msg);
  });
}

receive();