import express from "express";
import aiRoutes from "./routes/ai.routes.js";
import cors from "cors";
import "dotenv/config.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Code Reviewer API Running ✅");
});

app.use("/ai", aiRoutes);

export default app;
