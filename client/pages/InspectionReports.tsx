import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Gauge,
  FileImage,
  Video,
  Edit2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useInspectionContext } from "@/context/InspectionContext";
import { useAuth } from "@/context/AuthContext";
import { FileGrid } from "@/components/FilePreview";

export default function InspectionReports() {
  const { vehicles, updateInspectionStatus, getFilteredReports } =
    useInspectionContext();
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "fail">(
    "all",
  );

  const userReports = getFilteredReports(user?.id, user?.role);

  const filteredReports = useMemo(() => {
    return userReports.filter((report) => {
      const vehicle = vehicles.find((v) => v.id === report.vehicleId);
      const vehicleName = vehicle?.busNumber || "";

      const matchesSearch =
        vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.date.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [userReports, vehicles, searchTerm, statusFilter]);

  const handleStatusChange = (
    reportId: string,
    newStatus: "pass" | "fail" | "pending",
  ) => {
    updateInspectionStatus(reportId, newStatus);
    toast({
      title: "Status Updated",
      description: `Inspection status changed to ${newStatus.toUpperCase()}`,
    });
  };

  const getStatusIcon = (status: "pass" | "fail" | "pending") => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <div className="h-5 w-5 rounded-full bg-yellow-500" />;
    }
  };

  const getStatusColor = (status: "pass" | "fail" | "pending") => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800 border-green-200";
      case "fail":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.busNumber || "Unknown Vehicle";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">
                {isAdmin ? "All Inspection Reports" : "My Inspection Reports"}
              </h1>
              {user && (
                <Badge variant="outline" className="ml-3">
                  {user.role.toUpperCase()}
                </Badge>
              )}
            </div>
            <nav className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-600 hover:text-primary">
                  Dashboard
                </Link>
                <Link
                  to="/inspection"
                  className="text-gray-600 hover:text-primary"
                >
                  New Inspection
                </Link>
                <Link to="/reports" className="text-primary font-medium">
                  Reports
                </Link>
              </div>
            </nav>
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by vehicle, inspector, or date..."
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
                Passed
              </Button>
              <Button
                variant={statusFilter === "fail" ? "default" : "outline"}
                onClick={() => setStatusFilter("fail")}
                size="sm"
              >
                Failed
              </Button>
            </div>
          </div>
        </section>

        {/* Reports List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Inspection Reports ({filteredReports.length} records)
            </h2>
          </div>

          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {userReports.length === 0
                    ? isAdmin
                      ? "No inspection reports yet"
                      : "You haven't submitted any inspections yet"
                    : "No reports found matching your search criteria"}
                </p>
                <p className="text-gray-400 mb-4">
                  {userReports.length === 0
                    ? "Submit your first inspection to see reports here."
                    : "Try adjusting your search terms or filters."}
                </p>
                {userReports.length === 0 && (
                  <Link to="/inspection">
                    <Button className="bg-primary hover:bg-primary/90">
                      Create First Inspection
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getVehicleName(report.vehicleId)}
                          </h3>
                          {getStatusIcon(report.status)}
                          <Badge className={`${getStatusColor(report.status)}`}>
                            {report.status.toUpperCase()}
                          </Badge>
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={report.status}
                                onValueChange={(
                                  value: "pass" | "fail" | "pending",
                                ) => handleStatusChange(report.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pass">Pass</SelectItem>
                                  <SelectItem value="fail">Fail</SelectItem>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Badge variant="secondary" className="text-xs">
                                Admin Control
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(report.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{report.inspectorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            <span>
                              {parseInt(
                                report.odometerReading.toString(),
                              ).toLocaleString()}{" "}
                              mi
                            </span>
                          </div>
                        </div>

                        {/* Inspection Checks Summary */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(report.checks).map(
                            ([check, passed]) => (
                              <Badge
                                key={check}
                                variant={passed ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {check}: {passed ? "Pass" : "Fail"}
                              </Badge>
                            ),
                          )}
                        </div>

                        {report.defectDescription && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-red-800 mb-1">
                              Defects Reported:
                            </h4>
                            <p className="text-red-700 text-sm">
                              {report.defectDescription}
                            </p>
                          </div>
                        )}

                        {(report.photos.length > 0 ||
                          report.videos.length > 0) && (
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {report.photos.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileImage className="h-4 w-4" />
                                <span>
                                  {report.photos.length} photo
                                  {report.photos.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                            {report.videos.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                <span>
                                  {report.videos.length} video
                                  {report.videos.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              Inspection Report -{" "}
                              {getVehicleName(report.vehicleId)}
                              {getStatusIcon(report.status)}
                              {isAdmin && (
                                <div className="flex items-center gap-2 ml-auto">
                                  <Select
                                    value={report.status}
                                    onValueChange={(
                                      value: "pass" | "fail" | "pending",
                                    ) => handleStatusChange(report.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pass">Pass</SelectItem>
                                      <SelectItem value="fail">Fail</SelectItem>
                                      <SelectItem value="pending">
                                        Pending
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Edit2 className="h-4 w-4 text-gray-500" />
                                </div>
                              )}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                              <h3 className="font-semibold mb-3">
                                Inspection Details
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Date:</span>{" "}
                                  {formatDate(report.date)}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Inspector:
                                  </span>{" "}
                                  {report.inspectorName}
                                </div>
                                <div>
                                  <span className="font-medium">Odometer:</span>{" "}
                                  {parseInt(
                                    report.odometerReading.toString(),
                                  ).toLocaleString()}{" "}
                                  mi
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span>
                                  <Badge
                                    className={`ml-2 ${getStatusColor(report.status)}`}
                                  >
                                    {report.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Safety Checks */}
                            <div>
                              <h3 className="font-semibold mb-3">
                                Safety Inspection Results
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(report.checks).map(
                                  ([check, passed]) => (
                                    <div
                                      key={check}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                      <span className="capitalize font-medium">
                                        {check}
                                      </span>
                                      <Badge
                                        variant={
                                          passed ? "default" : "destructive"
                                        }
                                      >
                                        {passed ? "Pass" : "Fail"}
                                      </Badge>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            {report.defectDescription && (
                              <>
                                <Separator />
                                <div>
                                  <h3 className="font-semibold mb-3">
                                    Defects and Issues
                                  </h3>
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700">
                                      {report.defectDescription}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}

                            {(report.photos.length > 0 ||
                              report.videos.length > 0) && (
                              <>
                                <Separator />
                                <div>
                                  <h3 className="font-semibold mb-3">
                                    Attachments
                                  </h3>
                                  <div className="space-y-4">
                                    {report.photos.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                          <FileImage className="h-4 w-4" />
                                          Photos ({report.photos.length})
                                        </h4>
                                        <FileGrid
                                          files={report.photos}
                                          type="photos"
                                          showRemove={false}
                                        />
                                      </div>
                                    )}
                                    {report.videos.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                          <Video className="h-4 w-4" />
                                          Videos ({report.videos.length})
                                        </h4>
                                        <FileGrid
                                          files={report.videos}
                                          type="videos"
                                          showRemove={false}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
