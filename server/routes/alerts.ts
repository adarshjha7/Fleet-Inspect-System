import { RequestHandler } from "express";
import { fleetDB } from "../database/db";

// GET /api/alerts - Get all maintenance alerts
export const getAlerts: RequestHandler = async (req, res) => {
  try {
    const alerts = await fleetDB.getMaintenanceAlerts();
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch maintenance alerts" });
  }
};

// POST /api/alerts - Create new maintenance alert
export const createAlert: RequestHandler = async (req, res) => {
  try {
    const { vehicleId, busNumber, alertType, severity, message, date } =
      req.body;

    // Validate required fields
    if (
      !vehicleId ||
      !busNumber ||
      !alertType ||
      !severity ||
      !message ||
      !date
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate alert type
    const validAlertTypes = [
      "failed_inspection",
      "pending_maintenance",
      "overdue_inspection",
    ];
    if (!validAlertTypes.includes(alertType)) {
      return res.status(400).json({ error: "Invalid alert type" });
    }

    // Validate severity
    const validSeverities = ["high", "medium", "low"];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: "Invalid severity level" });
    }

    const alertData = {
      vehicleId,
      busNumber,
      alertType,
      severity,
      message,
      date,
    };

    const alertId = await fleetDB.addMaintenanceAlert(alertData);

    res
      .status(201)
      .json({ id: alertId, message: "Maintenance alert created successfully" });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ error: "Failed to create maintenance alert" });
  }
};
