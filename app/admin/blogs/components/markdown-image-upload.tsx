"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePresignedUrl } from "../actions";

// 5MB in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface MarkdownImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export function MarkdownImageUpload({
  onImageUploaded,
}: MarkdownImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle image upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (limit to 5MB) before making server request
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Get presigned URL only after validating file size
      const response = await generatePresignedUrl(file.type, file.size);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate upload URL");
      }

      // Upload to presigned URL
      const uploadResponse = await fetch(response.data.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Call the callback with the image URL
      onImageUploaded(response.data.fileUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isUploading}
      onClick={() => fileInputRef.current?.click()}
      className="mr-2"
    >
      <Upload className="h-4 w-4 mr-2" />
      {isUploading ? "Uploading..." : "Upload Image"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading}
        ref={fileInputRef}
      />
    </Button>
  );
}
