"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { importUsersFromCSV, downloadSampleCSV } from "../actions";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export type ImportMode = "update" | "ignore" | "stop";

interface ImportResult {
  success: boolean;
  message?: string;
  error?: string;
  stats?: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors?: string[];
}

export function ImportUsers() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("update");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      toast.error("Please select a valid CSV file");
      setFile(null);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await downloadSampleCSV();
      if (response.success && response.data) {
        // Create blob and download
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users_sample.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Sample CSV downloaded successfully");
      } else {
        toast.error("Failed to download sample CSV");
      }
    } catch (error) {
      console.error("Error downloading sample:", error);
      toast.error("Failed to download sample CSV");
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", importMode);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await importUsersFromCSV(formData);

      clearInterval(progressInterval);
      setProgress(100);

      setImportResult(result);

      if (result.success) {
        toast.success(result.message || "Import completed successfully");
        // Clear form after successful import
        setFile(null);
        const fileInput = document.getElementById(
          "csv-file"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(result.message || result.error || "Import failed");
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        message: "An unexpected error occurred during import",
      });
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportResult(null);
    setProgress(0);
    const fileInput = document.getElementById("csv-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Upload className="h-4 w-4 mr-2" />
          Import Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple users at once. Download the
            sample file to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sample CSV Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Sample CSV Format
              </CardTitle>
              <CardDescription>
                Download a sample CSV file to understand the required format and
                column headers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadSample}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>

          {/* Import Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-mode">Import Mode</Label>
              <Select
                value={importMode}
                onValueChange={(value: ImportMode) => setImportMode(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">
                    Update existing users (recommended)
                  </SelectItem>
                  <SelectItem value="ignore">Skip existing users</SelectItem>
                  <SelectItem value="stop">
                    Stop if any user already exists
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                {importMode === "update" &&
                  "Updates existing users with new data from CSV"}
                {importMode === "ignore" &&
                  "Skips users that already exist (based on email/username)"}
                {importMode === "stop" &&
                  "Stops the entire import if any user already exists"}
              </div>
            </div>

            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              {file && (
                <div className="text-sm text-muted-foreground mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing users...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  {importResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">
                      {importResult.success
                        ? "Import Successful"
                        : "Import Failed"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {importResult.message ||
                        importResult.error ||
                        "No details available"}
                    </div>

                    {importResult.stats && (
                      <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {importResult.stats.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total Processed
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {importResult.stats.created}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {importResult.stats.updated}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Updated
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {importResult.stats.skipped}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Skipped
                          </div>
                        </div>
                      </div>
                    )}

                    {importResult.errors && importResult.errors.length > 0 && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium mb-2">
                            Errors encountered:
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {importResult.errors
                              .slice(0, 5)
                              .map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            {importResult.errors.length > 5 && (
                              <li className="text-muted-foreground">
                                ... and {importResult.errors.length - 5} more
                                errors
                              </li>
                            )}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isImporting}
          >
            {importResult?.success ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="min-w-[100px]"
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
