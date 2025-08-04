import { Vehicle, InspectionReport, MaintenanceAlert } from "@shared/fleet";
import { mockVehicles, mockMaintenanceAlerts } from "@/data/mockData";

// Simple global data store with localStorage persistence
class DataStore {
  private static instance: DataStore;

  constructor() {
    if (DataStore.instance) {
      return DataStore.instance;
    }
    DataStore.instance = this;
  }

  // Check available storage space
  private getStorageUsage(): {
    used: number;
    available: number;
    total: number;
  } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Estimate total quota (varies by browser, typically 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB conservative estimate
    return {
      used,
      available: total - used,
      total,
    };
  }

  // Clean old reports if storage is getting full
  private manageStorage(): void {
    const usage = this.getStorageUsage();
    const usagePercent = (usage.used / usage.total) * 100;

    console.log(
      `Storage usage: ${usagePercent.toFixed(1)}% (${(usage.used / 1024 / 1024).toFixed(2)}MB)`,
    );

    // If storage is over 80% full, remove old reports
    if (usagePercent > 80) {
      try {
        const reports = this.getReports();
        if (reports.length > 5) {
          // Keep only the 5 most recent reports
          const recentReports = reports.slice(0, 5);
          localStorage.setItem("fleet_reports", JSON.stringify(recentReports));
          console.log(
            `Cleaned up old reports. Kept ${recentReports.length} most recent reports.`,
          );
        }
      } catch (error) {
        console.error("Failed to clean up storage:", error);
      }
    }
  }

  // Get data with fallback
  getVehicles(): Vehicle[] {
    try {
      const stored = localStorage.getItem("fleet_vehicles");
      return stored ? JSON.parse(stored) : mockVehicles;
    } catch {
      return mockVehicles;
    }
  }

  getReports(): InspectionReport[] {
    try {
      const stored = localStorage.getItem("fleet_reports");
      const reports = stored ? JSON.parse(stored) : [];
      console.log("Loading reports from storage:", reports.length);
      return reports;
    } catch {
      return [];
    }
  }

  getAlerts(): MaintenanceAlert[] {
    try {
      const stored = localStorage.getItem("fleet_alerts");
      return stored ? JSON.parse(stored) : mockMaintenanceAlerts;
    } catch {
      return mockMaintenanceAlerts;
    }
  }

  // Save data with quota management
  saveVehicles(vehicles: Vehicle[]): void {
    try {
      localStorage.setItem("fleet_vehicles", JSON.stringify(vehicles));
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.warn(
          "Storage quota exceeded for vehicles. Managing storage...",
        );
        this.manageStorage();
        try {
          localStorage.setItem("fleet_vehicles", JSON.stringify(vehicles));
        } catch (retryError) {
          console.error("Failed to save vehicles after cleanup:", retryError);
        }
      } else {
        console.error("Failed to save vehicles:", error);
      }
    }
  }

  saveReports(reports: InspectionReport[]): void {
    try {
      localStorage.setItem("fleet_reports", JSON.stringify(reports));
      console.log("Saved reports to storage:", reports.length);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.warn("Storage quota exceeded for reports. Managing storage...");
        this.manageStorage();

        // Try saving with fewer reports
        try {
          const limitedReports = reports.slice(0, 10); // Keep only 10 most recent
          localStorage.setItem("fleet_reports", JSON.stringify(limitedReports));
          console.log(
            "Saved limited reports to storage:",
            limitedReports.length,
          );
        } catch (retryError) {
          console.error("Failed to save reports after cleanup:", retryError);
          // Fallback: try saving without file attachments
          this.saveReportsWithoutFiles(reports);
        }
      } else {
        console.error("Failed to save reports:", error);
      }
    }
  }

  // Fallback: save reports without file attachments to save space
  private saveReportsWithoutFiles(reports: InspectionReport[]): void {
    try {
      const reportsWithoutFiles = reports.map((report) => ({
        ...report,
        photos: [],
        videos: [],
      }));
      localStorage.setItem(
        "fleet_reports",
        JSON.stringify(reportsWithoutFiles),
      );
      console.log(
        "Saved reports without files due to storage constraints:",
        reportsWithoutFiles.length,
      );

      // Notify user about the limitation
      if (typeof window !== "undefined") {
        setTimeout(() => {
          alert(
            "Storage space limited. Inspection saved but file attachments were not stored. Consider clearing old data.",
          );
        }, 100);
      }
    } catch (error) {
      console.error("Failed to save reports even without files:", error);
    }
  }

  saveAlerts(alerts: MaintenanceAlert[]): void {
    try {
      localStorage.setItem("fleet_alerts", JSON.stringify(alerts));
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.warn("Storage quota exceeded for alerts. Managing storage...");
        this.manageStorage();
        try {
          localStorage.setItem("fleet_alerts", JSON.stringify(alerts));
        } catch (retryError) {
          console.error("Failed to save alerts after cleanup:", retryError);
        }
      } else {
        console.error("Failed to save alerts:", error);
      }
    }
  }

  // Add new report with storage management
  addReport(report: InspectionReport): void {
    const reports = this.getReports();
    const newReports = [report, ...reports];
    this.saveReports(newReports);
  }

  // Update vehicle
  updateVehicle(vehicleId: string, updates: Partial<Vehicle>): void {
    const vehicles = this.getVehicles();
    const updated = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, ...updates } : v,
    );
    this.saveVehicles(updated);
  }

  // Add alert
  addAlert(alert: MaintenanceAlert): void {
    const alerts = this.getAlerts();
    const newAlerts = [alert, ...alerts];
    this.saveAlerts(newAlerts);
  }

  // Update report status
  updateReportStatus(
    reportId: string,
    status: "pass" | "fail" | "pending",
  ): void {
    const reports = this.getReports();
    const updated = reports.map((r) =>
      r.id === reportId ? { ...r, status } : r,
    );
    this.saveReports(updated);
  }

  // Clear all data (for testing)
  clearAll(): void {
    localStorage.removeItem("fleet_vehicles");
    localStorage.removeItem("fleet_reports");
    localStorage.removeItem("fleet_alerts");
  }

  // Get storage information for debugging
  getStorageInfo(): { usage: string; reports: number; canSave: boolean } {
    const usage = this.getStorageUsage();
    const usagePercent = (usage.used / usage.total) * 100;
    const reports = this.getReports().length;

    return {
      usage: `${usagePercent.toFixed(1)}% (${(usage.used / 1024 / 1024).toFixed(2)}MB)`,
      reports,
      canSave: usagePercent < 90,
    };
  }
}

export const dataStore = new DataStore();
