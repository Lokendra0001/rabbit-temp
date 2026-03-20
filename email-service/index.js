import express from "express";
import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let conn;
let ch;

async function createConnection() {
  const RABBITMQ_HOST = process.env.RABBITMQ_HOST || "rabbitmq";
  const url = `amqp://${RABBITMQ_HOST}:5672`;

  while (true) {
    try {
      console.log(`Connecting to RabbitMQ at ${url}...`);
      conn = await amqp.connect(url);
      ch = await conn.createChannel();
      console.log("Connection and Channel created successfully! 2");

      conn.on("error", (err) => {
        console.error("RabbitMQ connection error", err);
      });

      conn.on("close", () => {
        console.warn("RabbitMQ connection closed. Reconnecting...");
        setTimeout(createConnection, 5000);
      });

      // Start consuming once the channel is ready
      await receiveMsg();
      break;
    } catch (err) {
      console.error("Failed to connect to RabbitMQ. Retrying in 5 seconds...", err.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

createConnection();

async function receiveMsg() {
  console.log("⏳ Waiting for messages...");
  try {
    await ch.assertQueue("user-created", { durable: true });
    ch.consume("user-created", (payload) => {
      if (payload !== null) {
        // payload content is a Buffer, so we must parse it
        const data = JSON.parse(payload.content.toString());
        console.log("Received data:", data);
        console.log(
          `Recieved User Detail: Username : ${data.username} || Email : ${data.email} || Pwd : ${data.pwd} || `,
        );
        // Acknowledge the message so it's removed from the queue
        // ch.ack(payload);
      }
    });
  } catch (error) {
    console.log("ERROR MALIK : " + error);
  }
}

app.get("/", (req, res) => res.send("Hello From Email Service"));

app.listen(PORT, () =>
  console.log(`Server Started At ( Email Service ) : ${PORT}`),
);
