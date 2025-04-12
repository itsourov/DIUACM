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
import {
  SaveIcon,
  Loader2,
  Camera,
  X,
  User as UserIcon,
  Mail,
  Phone,
  UserCheck,
  GraduationCap,
  School,
  Code,
  Upload,
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
      {/* Profile Header with Picture */}
      <div className="mb-10 py-8 px-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative">
            <div className="relative flex items-center justify-center">
              {/* Ambient light effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-2xl opacity-25 dark:opacity-40 group-hover:opacity-30 dark:group-hover:opacity-50 transition-opacity duration-500"></div>

              <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-lg relative z-10">
                <AvatarImage
                  src={profileImageUrl || undefined}
                  alt={userData.name}
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => setShowImageCropper(true)}
                className="absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-2.5 shadow-lg hover:scale-105 transition-all z-20"
                aria-label="Change profile picture"
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {userData.name || userData.username}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {userData.email}
            </p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageCropper(true)}
                disabled={isUploadingImage}
                className="border-slate-200 hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 transition-colors"
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                )}
                {profileImageUrl ? "Change" : "Upload"} Photo
              </Button>

              {profileImageUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={isUploadingImage}
                  className="text-red-600 hover:text-red-700 border-slate-200 hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:border-slate-700 dark:hover:border-red-900 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="relative w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 relative z-0"
          >
            {/* Personal Information Section */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mr-4">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Full Name
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Username
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Enter username"
                          {...field}
                          className="border-slate-300 dark:border-slate-600 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500 dark:text-slate-400">
                        This will be used in your public profile URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Password
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current password"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500 dark:text-slate-400">
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
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Gender
                        </FormLabel>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors">
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
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Phone Number
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Phone number (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center mr-4">
                  <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Academic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <School className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Student ID
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Student ID (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
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
                      <div className="flex items-center gap-2 mb-2">
                        <School className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Department
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Department (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                        />
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
                      <div className="flex items-center gap-2 mb-2">
                        <School className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Starting Semester
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="e.g. Fall 2020 (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Competitive Programming Profiles */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center mr-4">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Competitive Programming Profiles
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="codeforcesHandle"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          Codeforces Handle
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Codeforces handle (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-colors"
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
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          AtCoder Handle
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="AtCoder handle (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
                        />
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
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <FormLabel className="text-slate-700 dark:text-slate-300 m-0">
                          VJudge Handle
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="VJudge handle (optional)"
                          {...field}
                          value={field.value || ""}
                          className="border-slate-300 dark:border-slate-600 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="text-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
