import "dotenv/config";
import express from "express";
import cors from "cors";

import { handleDemo } from "./routes/demo";
import { getVehicles, getVehicleById, updateVehicle } from "./routes/vehicles";
import { getReports, createReport, updateReportStatus } from "./routes/reports";
import { getAlerts, createAlert } from "./routes/alerts";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.get("/api/vehicles", getVehicles);
  app.get("/api/vehicles/:id", getVehicleById);
  app.put("/api/vehicles/:id", updateVehicle);

  app.get("/api/reports", getReports);
  app.post("/api/reports", createReport);
  app.put("/api/reports/:id/status", updateReportStatus);

  app.get("/api/alerts", getAlerts);
  app.post("/api/alerts", createAlert);

  return app;
}
