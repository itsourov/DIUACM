"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export type PresignResponse = {
  presignedUrl: string;
  fileUrl: string;
};

export type GeneratePresignedUrl = (
  fileType: string,
  fileSize: number
) => Promise<{
  success: boolean;
  data?: PresignResponse;
  error?: string;
}>;

interface AdminImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  generate: GeneratePresignedUrl;
  accept?: string; // e.g. "image/*"
  maxSizeMB?: number; // default 5MB
  ratio?: number; // aspect ratio like 16/9
  className?: string;
  previewClassName?: string;
  uploadLabel?: string;
  changeLabel?: string;
  removeLabel?: string;
}

export function AdminImageUpload({
  value,
  onChange,
  generate,
  accept = "image/*",
  maxSizeMB = 5,
  ratio = 16 / 9,
  className,
  previewClassName,
  uploadLabel = "Upload Image",
  changeLabel = "Change Image",
  removeLabel = "Remove",
}: AdminImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const containerClass = className ?? "max-w-xl";

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (accept.startsWith("image/") && !file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        e.target.value = "";
        return;
      }

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`Image must be less than ${maxSizeMB}MB`);
        e.target.value = "";
        return;
      }

      setIsUploading(true);
      try {
        const res = await generate(file.type, file.size);
        if (!res.success || !res.data) {
          throw new Error(res.error || "Failed to generate upload URL");
        }

        const { presignedUrl, fileUrl } = res.data;
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }
        onChange(fileUrl);
        toast.success("Image uploaded");
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    },
    [accept, generate, maxSizeMB, onChange]
  );

  const handleRemove = useCallback(() => {
    onChange("");
    toast.success("Image removed");
  }, [onChange]);

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          asChild
        >
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            {value ? changeLabel : uploadLabel}
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </Button>
        {value && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {removeLabel}
          </Button>
        )}
      </div>

      {isUploading && (
        <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
      )}

      {value && (
        <div
          className={`mt-3 w-full overflow-hidden rounded-md border ${
            previewClassName ?? ""
          }`}
        >
          <AspectRatio ratio={ratio}>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </AspectRatio>
        </div>
      )}
    </div>
  );
}
