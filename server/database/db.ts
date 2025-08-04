import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import { join } from "path";
import {
  Vehicle,
  InspectionReport,
  MaintenanceAlert,
  SerializedFile,
} from "@shared/fleet";

// Enable verbose mode for debugging
const Database = sqlite3.verbose().Database;

class FleetDatabase {
  private db: sqlite3.Database;
  private static instance: FleetDatabase;

  constructor(dbPath: string = "./fleet.db") {
    this.db = new Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to SQLite database:", dbPath);
        this.initializeSchema();
      }
    });
  }

  static getInstance(): FleetDatabase {
    if (!FleetDatabase.instance) {
      FleetDatabase.instance = new FleetDatabase();
    }
    return FleetDatabase.instance;
  }

  private initializeSchema(): void {
    try {
      const schemaPath = join(__dirname, "schema.sql");
      const schema = readFileSync(schemaPath, "utf8");
      this.db.exec(schema, (err) => {
        if (err) {
          console.error("Error initializing database schema:", err.message);
        } else {
          console.log("Database schema initialized successfully");
        }
      });
    } catch (error) {
      console.error("Error reading schema file:", error);
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // VEHICLES OPERATIONS
  async getVehicles(): Promise<Vehicle[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, bus_number as busNumber, status, last_inspection_date as lastInspectionDate,
               odometer_reading as odometerReading, model, year, has_defects as hasDefects
        FROM vehicles ORDER BY bus_number
      `;

      this.db.all(query, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const vehicles: Vehicle[] = rows.map((row) => ({
            ...row,
            hasDefects: Boolean(row.hasDefects),
          }));
          resolve(vehicles);
        }
      });
    });
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, bus_number as busNumber, status, last_inspection_date as lastInspectionDate,
               odometer_reading as odometerReading, model, year, has_defects as hasDefects
        FROM vehicles WHERE id = ?
      `;

      this.db.get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve({
              ...row,
              hasDefects: Boolean(row.hasDefects),
            });
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.status) {
        updateFields.push("status = ?");
        values.push(updates.status);
      }
      if (updates.lastInspectionDate) {
        updateFields.push("last_inspection_date = ?");
        values.push(updates.lastInspectionDate);
      }
      if (updates.odometerReading !== undefined) {
        updateFields.push("odometer_reading = ?");
        values.push(updates.odometerReading);
      }
      if (updates.hasDefects !== undefined) {
        updateFields.push("has_defects = ?");
        values.push(updates.hasDefects);
      }

      if (updateFields.length === 0) {
        resolve(true);
        return;
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE vehicles SET ${updateFields.join(", ")} WHERE id = ?`;

      this.db.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // INSPECTION REPORTS OPERATIONS
  async getInspectionReports(): Promise<InspectionReport[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, vehicle_id as vehicleId, inspector_name as inspectorName, date,
               odometer_reading as odometerReading, check_tires as checkTires,
               check_brakes as checkBrakes, check_lights as checkLights,
               check_fluids as checkFluids, defect_description as defectDescription, status
        FROM inspection_reports ORDER BY date DESC
      `;

      this.db.all(query, [], async (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const reports: InspectionReport[] = [];

            for (const row of rows) {
              const files = await this.getInspectionFiles(row.id);
              const photos = files.filter((f) => f.type.startsWith("image/"));
              const videos = files.filter((f) => f.type.startsWith("video/"));

              reports.push({
                ...row,
                checks: {
                  tires: Boolean(row.checkTires),
                  brakes: Boolean(row.checkBrakes),
                  lights: Boolean(row.checkLights),
                  fluids: Boolean(row.checkFluids),
                },
                photos,
                videos,
              });
            }

            resolve(reports);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async addInspectionReport(
    report: Omit<InspectionReport, "id">,
  ): Promise<string> {
    const reportId = this.generateId();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO inspection_reports (
          id, vehicle_id, inspector_name, date, odometer_reading,
          check_tires, check_brakes, check_lights, check_fluids,
          defect_description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        reportId,
        report.vehicleId,
        report.inspectorName,
        report.date,
        report.odometerReading,
        report.checks.tires,
        report.checks.brakes,
        report.checks.lights,
        report.checks.fluids,
        report.defectDescription || null,
        report.status,
      ];

      this.db.run(query, values, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            // Save files
            await this.saveInspectionFiles(reportId, [
              ...report.photos,
              ...report.videos,
            ]);
            resolve(reportId);
          } catch (fileError) {
            reject(fileError);
          }
        }
      });
    });
  }

  async updateInspectionStatus(
    id: string,
    status: "pass" | "fail" | "pending",
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE inspection_reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      this.db.run(query, [status, id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // MAINTENANCE ALERTS OPERATIONS
  async getMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, vehicle_id as vehicleId, bus_number as busNumber,
               alert_type as alertType, severity, message, date
        FROM maintenance_alerts WHERE resolved = FALSE ORDER BY date DESC
      `;

      this.db.all(query, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async addMaintenanceAlert(
    alert: Omit<MaintenanceAlert, "id">,
  ): Promise<string> {
    const alertId = this.generateId();

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO maintenance_alerts (id, vehicle_id, bus_number, alert_type, severity, message, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        alertId,
        alert.vehicleId,
        alert.busNumber,
        alert.alertType,
        alert.severity,
        alert.message,
        alert.date,
      ];

      this.db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(alertId);
        }
      });
    });
  }

  async removeAlertsForVehicle(
    vehicleId: string,
    alertType: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE maintenance_alerts SET resolved = TRUE WHERE vehicle_id = ? AND alert_type = ?`;

      this.db.run(query, [vehicleId, alertType], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // FILE OPERATIONS
  private async getInspectionFiles(
    inspectionId: string,
  ): Promise<SerializedFile[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT file_name as name, file_type as type, file_size as size, file_data as dataUrl
        FROM inspection_files WHERE inspection_id = ?
      `;

      this.db.all(query, [inspectionId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private async saveInspectionFiles(
    inspectionId: string,
    files: SerializedFile[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (files.length === 0) {
        resolve();
        return;
      }

      const query = `
        INSERT INTO inspection_files (id, inspection_id, file_name, file_type, file_size, file_data)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      let completed = 0;
      let hasError = false;

      for (const file of files) {
        const fileId = this.generateId();

        this.db.run(
          query,
          [fileId, inspectionId, file.name, file.type, file.size, file.dataUrl],
          (err) => {
            if (err && !hasError) {
              hasError = true;
              reject(err);
            } else {
              completed++;
              if (completed === files.length && !hasError) {
                resolve();
              }
            }
          },
        );
      }
    });
  }

  // Close database connection
  close(): void {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed");
      }
    });
  }
}

export const fleetDB = FleetDatabase.getInstance();
