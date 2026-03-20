import express from "express";
import fs from "fs";
import amqp from "amqplib";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const app = express();
const PORT = 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let conn;
let ch;

async function createConnection() {
  const RABBITMQ_HOST = process.env.RABBITMQ_HOST || "rabbitmq";
  amqp.connect(`amqp://${RABBITMQ_HOST}:5672`);
  ch = await conn.createChannel();

  console.log("Connection and Channel created successfully! 1");
}

createConnection();

app.get("/", (req, res) => res.send("Hello From Auth Service"));

app.post("/register", async (req, res) => {
  try {
    console.log("HELLO");
    const { username, email, pwd } = req.body;
    console.log(
      `Username : ${username} || Email : ${email} || Pwd : ${pwd} || `,
    );
    if (!username || !email || !pwd) {
      return res.status(400).json({ success: false, msg: "User Not Created!" });
    }

    // Read file
    const data = JSON.parse(fs.readFileSync(DATA_FILE));

    // Add new data
    data.push({
      username,
      email,
      pwd,
    });

    // Write back
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    const createdUser = {
      username,
      email,
      pwd,
    };

    if (ch) {
      await ch.assertQueue("user-created", { durable: true });
      ch.sendToQueue("user-created", Buffer.from(JSON.stringify(createdUser)), {
        persistent: true,
      });
    } else {
      console.warn("RabbitMQ channel not ready yet, message not sent.");
    }

    return res
      .status(201)
      .json({ success: true, msg: "User Created Successfully!" });
  } catch (error) {
    return res.json({
      success: false,
      msg: `Internal Server Error : ${error} `,
    });
  }
});

app.listen(PORT, () =>
  console.log(`Server Started At ( Auth Service ) : ${PORT}`),
);
