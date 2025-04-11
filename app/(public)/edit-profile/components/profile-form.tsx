"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Gender, type User } from "@prisma/client";

import { profileFormSchema, type ProfileFormValues } from "../schema";
import { updateProfile, getPresignedUrl } from "../actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Separator } from "@/components/ui/separator";
import {
  SaveIcon,
  Loader2,
  Camera,
  X,
  User as UserIcon,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropper } from "@/components/image-cropper";

interface ProfileFormProps {
  userData: User;
}

export function ProfileForm({ userData }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    userData?.image || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData?.name || "",
      username: userData?.username || "",
      password: "",
      gender: userData?.gender || undefined,
      phone: userData?.phone || "",
      codeforcesHandle: userData?.codeforcesHandle || "",
      atcoderHandle: userData?.atcoderHandle || "",
      vjudgeHandle: userData?.vjudgeHandle || "",
      startingSemester: userData?.startingSemester || "",
      department: userData?.department || "",
      studentId: userData?.studentId || "",
      image: userData?.image || "",
    },
  });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to update just the profile image
  const updateProfileImage = async (imageUrl: string) => {
    try {
      // Create a partial update with just the image field
      const response = await updateProfile({
        ...form.getValues(),
        image: imageUrl,
      });

      if (response.success) {
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(
          typeof response.error === "string"
            ? response.error
            : "Failed to update profile picture"
        );

        // Reset the profile image URL on error
        setProfileImageUrl(userData?.image || null);
        form.setValue("image", userData?.image || "");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");

      // Reset the profile image URL on error
      setProfileImageUrl(userData?.image || null);
      form.setValue("image", userData?.image || "");
    }
  };

  // Function to handle image upload
  const handleImageUpload = async (croppedImage: string) => {
    try {
      setIsUploadingImage(true);

      // Get a presigned URL for uploading to S3
      const urlResponse = await getPresignedUrl();

      if (!urlResponse.success || !urlResponse.data) {
        toast.error("Failed to get upload URL");
        return;
      }

      const { uploadUrl, publicUrl } = urlResponse.data;

      // Convert base64 image to blob for upload
      const base64Data = croppedImage.replace(/^data:image\/\w+;base64,/, "");
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(
        (res) => res.blob()
      );

      // Upload the image using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Update the form value with the new image URL
      form.setValue("image", publicUrl);
      setProfileImageUrl(publicUrl);

      // Save the profile picture immediately
      await updateProfileImage(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      setShowImageCropper(false);
    }
  };

  // Function to handle image removal
  const handleRemoveImage = async () => {
    try {
      setIsUploadingImage(true);
      setProfileImageUrl(null);
      form.setValue("image", "");

      // Save the profile with empty image immediately
      await updateProfileImage("");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove profile picture");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await updateProfile(values);

      if (response.success) {
        toast.success("Profile updated successfully!");
        // Navigate to user's programmer page
        router.push(`/programmers/${values.username}`);
      } else {
        if (typeof response.error === "string") {
          toast.error(response.error);
        } else {
          // Show specific field errors in form
          if (response.error?.username) {
            form.setError("username", {
              type: "manual",
              message: response.error.username[0],
            });
          }
          toast.error("Please check the form for errors.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile picture and personal info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <UserIcon className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-700 shadow-md">
                    <AvatarImage
                      src={profileImageUrl || undefined}
                      alt={userData.name}
                    />
                    <AvatarFallback className="text-3xl bg-slate-100 dark:bg-slate-700">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>

                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-white dark:bg-slate-700 shadow-sm"
                    onClick={() => setShowImageCropper(true)}
                    disabled={isUploadingImage}
                    type="button"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <span className="sr-only">Change profile picture</span>
                  </Button>
                </div>

                {profileImageUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove photo
                  </Button>
                )}
              </div>

              {/* Static Info Display */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Email
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {userData.email}
                    </p>
                  </div>
                </div>

                {userData.createdAt && (
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Member Since
                      </p>
                      <p className="text-slate-900 dark:text-slate-100">
                        {new Date(userData.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      Personal Information
                    </h3>
                    <Separator className="my-2" />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                              />
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
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormDescription>
                              This will be used in your public profile URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Leave blank to keep current password"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank to keep current password
                            </FormDescription>
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
                              defaultValue={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(Gender).map((gender) => (
                                  <SelectItem key={gender} value={gender}>
                                    {gender.charAt(0).toUpperCase() +
                                      gender.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
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
                              <Input
                                placeholder="Phone number (optional)"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      Academic Information
                    </h3>
                    <Separator className="my-2" />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Student ID (optional)"
                                {...field}
                                value={field.value || ""}
                              />
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
                              <Input
                                placeholder="Department (optional)"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="startingSemester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Semester</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Fall 2020 (optional)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Competitive Programming Profiles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      Competitive Programming Profiles
                    </h3>
                    <Separator className="my-2" />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="codeforcesHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codeforces Handle</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Codeforces handle (optional)"
                                {...field}
                                value={field.value || ""}
                              />
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
                              <Input
                                placeholder="AtCoder handle (optional)"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="vjudgeHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VJudge Handle</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="VJudge handle (optional)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Cropper Dialog */}
      {showImageCropper && (
        <ImageCropper
          onComplete={handleImageUpload}
          onCancel={() => setShowImageCropper(false)}
        />
      )}
    </>
  );
}
