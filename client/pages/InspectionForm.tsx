import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Camera,
  Video,
  Loader2,
  FileText,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useInspectionContext } from "@/context/InspectionContext";
import { useAuth } from "@/context/AuthContext";
import { FileGrid } from "@/components/FilePreview";

export default function InspectionForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { vehicles, submitInspection } = useInspectionContext();
  const { user, logout } = useAuth();
  const preselectedVehicleId = location.state?.vehicleId;

  const [formData, setFormData] = useState({
    vehicleId: preselectedVehicleId || "",
    inspectorName: user?.name || "",
    date: new Date().toISOString().split("T")[0],
    odometerReading: "",
    checks: {
      tires: false,
      brakes: false,
      lights: false,
      fluids: false,
    },
    defectDescription: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    photos: File[];
    videos: File[];
  }>({
    photos: [],
    videos: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckChange = (
    check: keyof typeof formData.checks,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [check]: checked,
      },
    }));
  };

  const handleFileUpload = (
    files: FileList | null,
    type: "photos" | "videos",
  ) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...fileArray],
    }));
  };

  const removeFile = (index: number, type: "photos" | "videos") => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.vehicleId ||
      !formData.inspectorName ||
      !formData.odometerReading
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate inspection status based on checks
      const allChecksPass = Object.values(formData.checks).every(
        (check) => check,
      );
      const hasDefects = formData.defectDescription.trim().length > 0;
      const status = allChecksPass && !hasDefects ? "pass" : "fail";

      // Submit inspection through context
      const inspectionId = await submitInspection({
        vehicleId: formData.vehicleId,
        inspectorName: formData.inspectorName,
        date: formData.date,
        odometerReading: parseInt(formData.odometerReading),
        checks: formData.checks,
        defectDescription: formData.defectDescription,
        photos: uploadedFiles.photos,
        videos: uploadedFiles.videos,
        status,
      });

      // Show success toast
      const vehicleName = vehicles.find(
        (v) => v.id === formData.vehicleId,
      )?.busNumber;
      toast({
        title: "Inspection Submitted Successfully!",
        description: `Status: ${status.toUpperCase()} for ${vehicleName}. Dashboard and alerts have been updated.`,
      });

      // Redirect after a short delay to allow user to see the toast
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Inspection submission error:", error);

      let errorMessage =
        "There was an error submitting the inspection. Please try again.";

      // Handle specific storage quota errors
      if (error instanceof Error) {
        if (
          error.message.includes("quota") ||
          error.message.includes("storage")
        ) {
          errorMessage =
            "Storage space is full. The inspection was saved but some files may not have been stored. Consider clearing old data.";
        }
      }

      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

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
                New Inspection
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
                <Link to="/inspection" className="text-primary font-medium">
                  New Inspection
                </Link>
                <Link
                  to="/reports"
                  className="text-gray-600 hover:text-primary flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleId">Vehicle ID *</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) =>
                      handleInputChange("vehicleId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.busNumber} - {vehicle.year} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="inspectorName">Inspector Name *</Label>
                  <Input
                    id="inspectorName"
                    value={formData.inspectorName}
                    onChange={(e) =>
                      handleInputChange("inspectorName", e.target.value)
                    }
                    required
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-filled with your name
                  </p>
                </div>
              </div>

              {selectedVehicle && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Last Inspection:</strong>{" "}
                    {selectedVehicle.lastInspectionDate} |
                    <strong> Current Odometer:</strong>{" "}
                    {selectedVehicle.odometerReading.toLocaleString()} mi |
                    <strong> Status:</strong>{" "}
                    {selectedVehicle.status.toUpperCase()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inspection Details */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Inspection Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="odometerReading">
                    Odometer Reading (miles) *
                  </Label>
                  <Input
                    id="odometerReading"
                    type="number"
                    value={formData.odometerReading}
                    onChange={(e) =>
                      handleInputChange("odometerReading", e.target.value)
                    }
                    placeholder="Enter current mileage"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Inspection Checklist</CardTitle>
              <p className="text-sm text-gray-600">
                Check all items that pass inspection
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.checks).map(([check, checked]) => (
                  <div key={check} className="flex items-center space-x-2">
                    <Checkbox
                      id={check}
                      checked={checked}
                      onCheckedChange={(checked) =>
                        handleCheckChange(
                          check as keyof typeof formData.checks,
                          checked as boolean,
                        )
                      }
                    />
                    <Label
                      htmlFor={check}
                      className="text-sm font-medium capitalize"
                    >
                      {check}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Defects and Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Defects and Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defectDescription">Defect Description</Label>
                <Textarea
                  id="defectDescription"
                  value={formData.defectDescription}
                  onChange={(e) =>
                    handleInputChange("defectDescription", e.target.value)
                  }
                  placeholder="Describe any defects or issues found during inspection..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <p className="text-sm text-gray-600">
                Upload photos and videos of any defects or issues
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div>
                <Label className="flex items-center mb-2">
                  <Camera className="h-4 w-4 mr-2" />
                  Photos
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, "photos")}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload photos
                      </p>
                    </div>
                  </label>
                </div>
                {uploadedFiles.photos.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">
                      Uploaded Photos ({uploadedFiles.photos.length})
                    </h4>
                    <FileGrid
                      files={uploadedFiles.photos}
                      type="photos"
                      onRemove={(index) => removeFile(index, "photos")}
                    />
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <Label className="flex items-center mb-2">
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, "videos")}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload videos
                      </p>
                    </div>
                  </label>
                </div>
                {uploadedFiles.videos.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">
                      Uploaded Videos ({uploadedFiles.videos.length})
                    </h4>
                    <FileGrid
                      files={uploadedFiles.videos}
                      type="videos"
                      onRemove={(index) => removeFile(index, "videos")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link to="/">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Inspection"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
