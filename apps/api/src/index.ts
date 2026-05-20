import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { tenantMiddleware } from "./middleware/tenant";
import issuesRouter from "./routes/issues";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "CivicPulse API is running",
    project: "Multi-tenant infrastructure issue tracker",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", tenantMiddleware);
app.use("/api/issues", issuesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`CivicPulse API running on http://localhost:${PORT}`);
});