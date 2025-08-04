import { SerializedFile } from "@shared/fleet";

// Maximum file size for storage (2MB per file)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_IMAGE_DIMENSION = 1920; // Max width/height for images

// Compress image if it's too large
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const ratio = Math.min(
          MAX_IMAGE_DIMENSION / width,
          MAX_IMAGE_DIMENSION / height,
        );
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: file.lastModified,
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression fails
          }
        },
        "image/jpeg",
        0.8,
      ); // 80% quality
    };

    img.onerror = () => resolve(file); // Fallback to original if load fails
    img.src = URL.createObjectURL(file);
  });
};

// Check if file is too large
const isFileTooLarge = (file: File): boolean => {
  return file.size > MAX_FILE_SIZE;
};

// Convert File to SerializedFile for storage with compression
export const fileToSerializedFile = async (
  file: File,
): Promise<SerializedFile | null> => {
  try {
    let processedFile = file;

    // Compress image if it's too large
    if (file.type.startsWith("image/") && isFileTooLarge(file)) {
      console.log(
        `Compressing large image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
      processedFile = await compressImage(file);
      console.log(
        `Compressed to: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Still too large? Skip this file
    if (isFileTooLarge(processedFile)) {
      console.warn(
        `File too large, skipping: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
      return null;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: processedFile.name,
          size: processedFile.size,
          type: processedFile.type,
          dataUrl: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(processedFile);
    });
  } catch (error) {
    console.error("Failed to process file:", error);
    return null;
  }
};

// Convert SerializedFile back to File for preview
export const serializedFileToFile = (serializedFile: SerializedFile): File => {
  try {
    const byteCharacters = atob(serializedFile.dataUrl.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], serializedFile.name, {
      type: serializedFile.type,
    });
  } catch (error) {
    console.error("Failed to convert serialized file:", error);
    // Return a placeholder file if conversion fails
    return new File([""], serializedFile.name, { type: serializedFile.type });
  }
};

// Convert array of Files to SerializedFiles with size management
export const filesToSerializedFiles = async (
  files: File[],
): Promise<SerializedFile[]> => {
  const results: SerializedFile[] = [];
  let totalSize = 0;
  const maxTotalSize = 8 * 1024 * 1024; // 8MB total limit for all files

  for (const file of files) {
    // Check if we've hit the total size limit
    if (totalSize > maxTotalSize) {
      console.warn(`Skipping remaining files due to total size limit`);
      break;
    }

    const serializedFile = await fileToSerializedFile(file);
    if (serializedFile) {
      results.push(serializedFile);
      totalSize += serializedFile.dataUrl.length;
    }
  }

  console.log(
    `Processed ${results.length} files out of ${files.length}, total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
  );

  // Show warning if some files were skipped
  if (results.length < files.length) {
    setTimeout(() => {
      alert(
        `${files.length - results.length} file(s) were too large and were not saved. Consider using smaller files (under 2MB each).`,
      );
    }, 100);
  }

  return results;
};

// Convert array of SerializedFiles to Files
export const serializedFilesToFiles = (
  serializedFiles: SerializedFile[],
): File[] => {
  return serializedFiles
    .map((sf) => serializedFileToFile(sf))
    .filter((f) => f.size > 0);
};

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
