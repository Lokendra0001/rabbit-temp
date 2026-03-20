import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 3000;

app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "", // strip /auth from the URL
    },
  }),
);

app.get("/", (req, res) => res.send("Hello From Server"));

app.listen(PORT, () => console.log(`Server Started At PORT : ${PORT}`));
