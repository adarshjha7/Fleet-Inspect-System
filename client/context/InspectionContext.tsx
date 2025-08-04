import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Vehicle, InspectionReport, MaintenanceAlert } from "@shared/fleet";
import { vehicleAPI, reportsAPI, alertsAPI } from "@/lib/apiService";
import { filesToSerializedFiles } from "@/lib/fileUtils";

interface InspectionFormData {
  vehicleId: string;
  inspectorName: string;
  date: string;
  odometerReading: number;
  checks: {
    tires: boolean;
    brakes: boolean;
    lights: boolean;
    fluids: boolean;
  };
  defectDescription?: string;
  photos: File[];
  videos: File[];
  status: "pass" | "fail";
}

interface InspectionContextType {
  vehicles: Vehicle[];
  inspectionReports: InspectionReport[];
  maintenanceAlerts: MaintenanceAlert[];
  isLoading: boolean;
  error: string | null;
  submitInspection: (inspection: InspectionFormData) => Promise<string>;
  updateInspectionStatus: (
    inspectionId: string,
    status: "pass" | "fail" | "pending",
  ) => Promise<void>;
  getFilteredReports: (
    userId?: string,
    userRole?: "driver" | "admin",
  ) => InspectionReport[];
  refreshData: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextType | undefined>(
  undefined,
);

export const useInspectionContext = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error(
      "useInspectionContext must be used within an InspectionProvider",
    );
  }
  return context;
};

export const InspectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State for API data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inspectionReports, setInspectionReports] = useState<
    InspectionReport[]
  >([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<
    MaintenanceAlert[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh data from API
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [vehiclesData, reportsData, alertsData] = await Promise.all([
        vehicleAPI.getAll(),
        reportsAPI.getAll(),
        alertsAPI.getAll(),
      ]);

      console.log(
        "Refreshing data - Reports:",
        reportsData.length,
        "Vehicles:",
        vehiclesData.length,
        "Alerts:",
        alertsData.length,
      );

      setVehicles(vehiclesData);
      setInspectionReports(reportsData);
      setMaintenanceAlerts(alertsData);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const submitInspection = async (
    inspection: InspectionFormData,
  ): Promise<string> => {
    try {
      // Convert files to serializable format
      const serializedPhotos = await filesToSerializedFiles(inspection.photos);
      const serializedVideos = await filesToSerializedFiles(inspection.videos);

      const newInspection = {
        vehicleId: inspection.vehicleId,
        inspectorName: inspection.inspectorName,
        date: inspection.date,
        odometerReading: inspection.odometerReading,
        checks: inspection.checks,
        defectDescription: inspection.defectDescription,
        photos: serializedPhotos,
        videos: serializedVideos,
        status: inspection.status,
      };

      console.log(
        "Submitting inspection by",
        newInspection.inspectorName,
        "for vehicle",
        newInspection.vehicleId,
      );

      // Submit to API
      const result = await reportsAPI.create(newInspection);

      // Refresh data to show new inspection
      await refreshData();

      console.log("Inspection submitted successfully:", result.id);
      return result.id;
    } catch (error) {
      console.error("Error submitting inspection:", error);
      throw error;
    }
  };

  const updateInspectionStatus = useCallback(
    async (inspectionId: string, status: "pass" | "fail" | "pending") => {
      try {
        console.log("Updating inspection status:", inspectionId, "to", status);

        await reportsAPI.updateStatus(inspectionId, status);

        // Refresh data to show updates
        await refreshData();
      } catch (error) {
        console.error("Error updating inspection status:", error);
        throw error;
      }
    },
    [refreshData],
  );

  const getFilteredReports = useCallback(
    (userId?: string, userRole?: "driver" | "admin"): InspectionReport[] => {
      console.log(
        "Getting filtered reports for role:",
        userRole,
        "Total available:",
        inspectionReports.length,
      );

      if (userRole === "admin") {
        console.log(
          "Admin access - returning all reports:",
          inspectionReports.length,
        );
        return inspectionReports;
      }

      if (userRole === "driver" && userId) {
        const driverReports = inspectionReports.filter((report) => {
          const inspectorLower = report.inspectorName.toLowerCase();
          const userIdLower = userId.toLowerCase();
          return (
            inspectorLower.includes(userIdLower) ||
            inspectorLower.includes("driver")
          );
        });
        console.log(
          "Driver access - returning filtered reports:",
          driverReports.length,
        );
        return driverReports;
      }

      return inspectionReports;
    },
    [inspectionReports],
  );

  const value: InspectionContextType = {
    vehicles,
    inspectionReports,
    maintenanceAlerts,
    isLoading,
    error,
    submitInspection,
    updateInspectionStatus,
    getFilteredReports,
    refreshData,
  };

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  );
};
