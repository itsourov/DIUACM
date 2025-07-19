"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Camera, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropper } from "@/components/image-cropper";
import { updateProfile, generatePresignedUrl } from "../actions";
import type { User } from "@/db/schema";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  gender: z.enum(["male", "female", "other"]).optional(),
  phone: z.string().optional(),
  codeforcesHandle: z.string().optional(),
  atcoderHandle: z.string().optional(),
  vjudgeHandle: z.string().optional(),
  startingSemester: z.string().optional(),
  department: z.string().optional(),
  studentId: z.string().optional(),
  image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [profileImage, setProfileImage] = useState(user.image || "");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      gender: user.gender || undefined,
      phone: user.phone || "",
      codeforcesHandle: user.codeforcesHandle || "",
      atcoderHandle: user.atcoderHandle || "",
      vjudgeHandle: user.vjudgeHandle || "",
      startingSemester: user.startingSemester || "",
      department: user.department || "",
      studentId: user.studentId || "",
      image: user.image || "",
    },
  });

  const handleImageComplete = async (croppedImage: string) => {
    try {
      setIsLoading(true);

      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // Get presigned URL
      const urlResult = await generatePresignedUrl(blob.type, blob.size);

      if (!urlResult.success || !urlResult.data) {
        throw new Error(urlResult.error || "Failed to get upload URL");
      }

      // Upload to S3
      const uploadResponse = await fetch(urlResult.data.presignedUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": blob.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Update form and state
      setProfileImage(urlResult.data.fileUrl);
      form.setValue("image", urlResult.data.fileUrl);
      setShowImageCropper(false);

      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsLoading(true);

      const result = await updateProfile({
        ...values,
        phone: values.phone || null,
        codeforcesHandle: values.codeforcesHandle || null,
        atcoderHandle: values.atcoderHandle || null,
        vjudgeHandle: values.vjudgeHandle || null,
        startingSemester: values.startingSemester || null,
        department: values.department || null,
        studentId: values.studentId || null,
        image: values.image || null,
      });

      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profileImage || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full p-2"
                    onClick={() => setShowImageCropper(true)}
                    disabled={isLoading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to update your profile picture
                </p>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startingSemester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting Semester</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Spring 2024"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Competitive Programming Profiles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Competitive Programming Profiles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="codeforcesHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codeforces Handle</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="atcoderHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AtCoder Handle</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vjudgeHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VJudge Handle</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={isLoading || !user.username}
                >
                  <Link href={`/programmers/${user.username || ""}`}>
                    View Profile
                  </Link>
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showImageCropper && (
        <ImageCropper
          onComplete={handleImageComplete}
          onCancel={() => setShowImageCropper(false)}
        />
      )}
    </>
  );
}
