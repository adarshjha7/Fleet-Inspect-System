import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SerializedFile } from "@shared/fleet";
import { serializedFileToFile } from "@/lib/fileUtils";

interface FilePreviewProps {
  file: File | SerializedFile;
  onRemove?: () => void;
  showRemove?: boolean;
}

function isSerializedFile(file: File | SerializedFile): file is SerializedFile {
  return "dataUrl" in file;
}

export function ImagePreview({
  file,
  onRemove,
  showRemove = true,
}: FilePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!file) {
      setError(true);
      return;
    }

    let url: string | null = null;

    try {
      if (isSerializedFile(file)) {
        // Use the stored dataUrl directly
        setImageUrl(file.dataUrl);
        setError(false);
      } else {
        // Create object URL for File instances
        if (!(file instanceof File) || file.size === 0) {
          setError(true);
          return;
        }
        url = URL.createObjectURL(file);
        setImageUrl(url);
        setError(false);
      }
    } catch (err) {
      console.error("Failed to process image:", err);
      setError(true);
    }

    // Cleanup function (only for File objects)
    return () => {
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [file]);

  const fileName = isSerializedFile(file) ? file.name : file?.name || "Unknown";
  const fileSize = isSerializedFile(file)
    ? (file.size / 1024 / 1024).toFixed(2) + " MB"
    : file?.size
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : "Unknown size";

  const renderFallback = () => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">IMG</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">{fileName}</p>
          <p className="text-xs text-gray-500">{fileSize}</p>
        </div>
      </div>
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  if (error || !imageUrl) {
    return renderFallback();
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3 flex-1">
          <img
            src={imageUrl}
            alt={fileName}
            className="w-12 h-12 object-cover rounded"
            onError={() => setError(true)}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">{fileSize}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{fileName}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt={fileName}
                  className="max-w-full max-h-96 object-contain"
                  onError={() => setError(true)}
                />
              </div>
            </DialogContent>
          </Dialog>

          {showRemove && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoPreview({
  file,
  onRemove,
  showRemove = true,
}: FilePreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!file) {
      setError(true);
      return;
    }

    let url: string | null = null;

    try {
      if (isSerializedFile(file)) {
        // Use the stored dataUrl directly
        setVideoUrl(file.dataUrl);
        setError(false);
      } else {
        // Create object URL for File instances
        if (!(file instanceof File) || file.size === 0) {
          setError(true);
          return;
        }
        url = URL.createObjectURL(file);
        setVideoUrl(url);
        setError(false);
      }
    } catch (err) {
      console.error("Failed to process video:", err);
      setError(true);
    }

    // Cleanup function (only for File objects)
    return () => {
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [file]);

  const fileName = isSerializedFile(file) ? file.name : file?.name || "Unknown";
  const fileSize = isSerializedFile(file)
    ? (file.size / 1024 / 1024).toFixed(2) + " MB"
    : file?.size
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : "Unknown size";

  const renderFallback = () => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">VID</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">{fileName}</p>
          <p className="text-xs text-gray-500">{fileSize}</p>
        </div>
      </div>
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  if (error || !videoUrl) {
    return renderFallback();
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3 flex-1">
          <video
            src={videoUrl}
            className="w-12 h-12 object-cover rounded bg-gray-200"
            muted
            onError={() => setError(true)}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">{fileSize}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{fileName}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full max-h-96"
                  onError={() => setError(true)}
                />
              </div>
            </DialogContent>
          </Dialog>

          {showRemove && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FileGridProps {
  files: (File | SerializedFile)[];
  type: "photos" | "videos";
  onRemove?: (index: number) => void;
  showRemove?: boolean;
}

export function FileGrid({
  files,
  type,
  onRemove,
  showRemove = true,
}: FileGridProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file, index) => {
        if (!file) return null;

        const fileName = isSerializedFile(file) ? file.name : file.name;
        const key = `${fileName}-${index}`;

        return (
          <div key={key}>
            {type === "photos" ? (
              <ImagePreview
                file={file}
                onRemove={onRemove ? () => onRemove(index) : undefined}
                showRemove={showRemove}
              />
            ) : (
              <VideoPreview
                file={file}
                onRemove={onRemove ? () => onRemove(index) : undefined}
                showRemove={showRemove}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
