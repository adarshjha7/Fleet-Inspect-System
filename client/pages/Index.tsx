import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInspectionContext } from "@/context/InspectionContext";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/dataStore";
import { Vehicle } from "@shared/fleet";

export default function Index() {
  const {
    vehicles,
    maintenanceAlerts,
    inspectionReports,
    getFilteredReports,
    refreshData,
  } = useInspectionContext();
  const { user, logout, isAdmin, isDriver } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pass" | "fail" | "pending"
  >("all");

  const userReports = getFilteredReports(user?.id, user?.role);

  // Refresh data when component mounts to ensure latest data
  useEffect(() => {
    console.log("Dashboard mounted, refreshing data...");
    refreshData();
  }, [refreshData]);

  // Refresh data when user navigates back to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Dashboard became visible, refreshing data...");
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshData]);

  // Debug logging for admin visibility
  console.log(
    "Dashboard - User role:",
    user?.role,
    "Total reports in context:",
    inspectionReports.length,
    "Filtered reports:",
    userReports.length,
  );

  const filteredVehicles = useMemo(() => {
    let vehiclesToShow = vehicles;

    // For drivers, show only vehicles they've inspected or all vehicles for inspection
    if (isDriver) {
      const inspectedVehicleIds = userReports.map((report) => report.vehicleId);
      vehiclesToShow = vehicles; // Show all vehicles for drivers to inspect
    }

    return vehiclesToShow.filter((vehicle) => {
      const matchesSearch =
        vehicle.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.lastInspectionDate.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter, isDriver, userReports]);

  const getStatusIcon = (status: Vehicle["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Vehicle["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800 border-green-200";
      case "fail":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getAlertColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">FleetInspect</h1>
              {user && (
                <Badge variant="outline" className="ml-3">
                  {user.role.toUpperCase()}
                </Badge>
              )}
            </div>
            <nav className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-primary font-medium">
                  Dashboard
                </Link>
                <Link
                  to="/inspection"
                  className="text-gray-600 hover:text-primary"
                >
                  New Inspection
                </Link>
                <Link
                  to="/reports"
                  className="text-gray-600 hover:text-primary flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  Reports (
                  {isAdmin ? inspectionReports.length : userReports.length})
                </Link>
              </div>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
              <Link to="/inspection">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Inspection
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {isAdmin ? "Total Vehicles" : "Available Vehicles"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredVehicles.length}
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Passed Inspections
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {vehicles.filter((v) => v.status === "pass").length}
                    </p>
                  </div>
                  <div className="ml-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Failed Inspections
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {vehicles.filter((v) => v.status === "fail").length}
                    </p>
                  </div>
                  <div className="ml-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {isAdmin ? "Total Reports" : "My Reports"}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {isAdmin ? inspectionReports.length : userReports.length}
                    </p>
                  </div>
                  <div className="ml-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Maintenance Alerts - Only show to admins or relevant alerts to drivers */}
        {maintenanceAlerts.length > 0 &&
          (isAdmin ||
            maintenanceAlerts.some((alert) =>
              userReports.some(
                (report) => report.vehicleId === alert.vehicleId,
              ),
            )) && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Maintenance Alerts ({maintenanceAlerts.length})
                {!isAdmin && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Related to your inspections
                  </Badge>
                )}
              </h2>
              <div className="space-y-3">
                {maintenanceAlerts.slice(0, 5).map((alert) => {
                  // For drivers, only show alerts related to their inspections
                  if (
                    isDriver &&
                    !userReports.some(
                      (report) => report.vehicleId === alert.vehicleId,
                    )
                  ) {
                    return null;
                  }

                  return (
                    <Alert
                      key={alert.id}
                      className={getAlertColor(alert.severity)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-medium">{alert.busNumber}</span> -{" "}
                        {alert.message}
                        <span className="text-sm text-gray-500 ml-2">
                          ({alert.date})
                        </span>
                      </AlertDescription>
                    </Alert>
                  );
                })}
                {maintenanceAlerts.length > 5 && (
                  <div className="text-center">
                    <Link to="/reports">
                      <Button variant="outline" size="sm">
                        View All Alerts in Reports
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}

        {/* Search and Filters */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by vehicle ID or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "pass" ? "default" : "outline"}
                onClick={() => setStatusFilter("pass")}
                size="sm"
              >
                Pass
              </Button>
              <Button
                variant={statusFilter === "fail" ? "default" : "outline"}
                onClick={() => setStatusFilter("fail")}
                size="sm"
              >
                Fail
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
              >
                Pending
              </Button>
            </div>
          </div>
        </section>

        {/* Vehicle Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Fleet Overview ({filteredVehicles.length} vehicles)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {vehicle.busNumber}
                    </CardTitle>
                    {getStatusIcon(vehicle.status)}
                  </div>
                  <Badge className={`w-fit ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Inspection:</span>
                      <span className="font-medium">
                        {vehicle.lastInspectionDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Odometer:</span>
                      <span className="font-medium">
                        {vehicle.odometerReading.toLocaleString()} mi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">
                        {vehicle.year} {vehicle.model}
                      </span>
                    </div>
                    {vehicle.hasDefects && (
                      <div className="flex items-center text-red-600 mt-3">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">
                          Defects Reported
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t">
                    <Link to="/inspection" state={{ vehicleId: vehicle.id }}>
                      <Button variant="outline" size="sm" className="w-full">
                        New Inspection
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No vehicles found matching your search criteria.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
