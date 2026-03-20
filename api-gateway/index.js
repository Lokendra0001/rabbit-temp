import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 3000;

app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  }),
);

app.get("/", (req, res) => res.send("Hello From Server"));

app.listen(PORT, () => console.log(`Server Started At PORT : ${PORT}`));
