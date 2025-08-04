import { RequestHandler } from "express";
import { fleetDB } from "../database/db";

// GET /api/reports - Get all inspection reports
export const getReports: RequestHandler = async (req, res) => {
  try {
    const reports = await fleetDB.getInspectionReports();
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch inspection reports" });
  }
};

// POST /api/reports - Create new inspection report
export const createReport: RequestHandler = async (req, res) => {
  try {
    const {
      vehicleId,
      inspectorName,
      date,
      odometerReading,
      checks,
      defectDescription,
      photos,
      videos,
      status,
    } = req.body;

    // Validate required fields
    if (
      !vehicleId ||
      !inspectorName ||
      !date ||
      !odometerReading ||
      !checks ||
      !status
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate status
    if (!["pass", "fail"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be pass or fail" });
    }

    const reportData = {
      vehicleId,
      inspectorName,
      date,
      odometerReading: parseInt(odometerReading.toString()),
      checks,
      defectDescription,
      photos: photos || [],
      videos: videos || [],
      status,
    };

    const reportId = await fleetDB.addInspectionReport(reportData);

    // Update vehicle status
    await fleetDB.updateVehicle(vehicleId, {
      status,
      lastInspectionDate: date,
      odometerReading: parseInt(odometerReading.toString()),
      hasDefects: status === "fail",
    });

    // Create maintenance alert if failed
    if (status === "fail") {
      const vehicle = await fleetDB.getVehicleById(vehicleId);
      if (vehicle) {
        await fleetDB.addMaintenanceAlert({
          vehicleId,
          busNumber: vehicle.busNumber,
          alertType: "failed_inspection",
          severity: "high",
          message: `Failed inspection by ${inspectorName} - ${defectDescription || "Multiple issues detected"}`,
          date,
        });
      }
    } else if (status === "pass") {
      // Remove fail alerts for this vehicle
      await fleetDB.removeAlertsForVehicle(vehicleId, "failed_inspection");
    }

    res
      .status(201)
      .json({
        id: reportId,
        message: "Inspection report created successfully",
      });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create inspection report" });
  }
};

// PUT /api/reports/:id/status - Update report status
export const updateReportStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pass", "fail", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get the inspection report first to get vehicle info
    const reports = await fleetDB.getInspectionReports();
    const report = reports.find(r => r.id === id);

    if (!report) {
      return res.status(404).json({ error: "Inspection report not found" });
    }

    // Update the inspection report status
    const success = await fleetDB.updateInspectionStatus(id, status);

    if (!success) {
      return res.status(404).json({ error: "Failed to update inspection status" });
    }

    // Update the corresponding vehicle status and defects flag
    await fleetDB.updateVehicle(report.vehicleId, {
      status,
      hasDefects: status === "fail",
    });

    // Handle maintenance alerts
    if (status === "fail") {
      // Create maintenance alert for failed inspection
      const vehicle = await fleetDB.getVehicleById(report.vehicleId);
      if (vehicle) {
        await fleetDB.addMaintenanceAlert({
          vehicleId: report.vehicleId,
          busNumber: vehicle.busNumber,
          alertType: "failed_inspection",
          severity: "high",
          message: `Failed inspection by ${report.inspectorName} - Status changed to FAIL`,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } else if (status === "pass") {
      // Remove failed inspection alerts for this vehicle
      await fleetDB.removeAlertsForVehicle(report.vehicleId, "failed_inspection");
    }

    console.log(`Updated report ${id} status to ${status} and vehicle ${report.vehicleId} accordingly`);
    res.json({ message: "Report status updated successfully" });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ error: "Failed to update report status" });
  }
};
