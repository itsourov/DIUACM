"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { users, GenderType } from "@/db/schema";

import { userFormSchema, type UserFormValues } from "../schemas/user";
import { createUser, updateUser } from "../actions";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for User based on Drizzle schema
type User = typeof users.$inferSelect;

interface UserFormProps {
  initialData?: User | null;
  isEditing?: boolean;
  userId?: string;
}

export function UserForm({
  initialData,
  isEditing = false,
  userId,
}: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      username: initialData?.username || "",
      studentId: initialData?.studentId || "",
      gender: initialData?.gender || undefined,
      phone: initialData?.phone || "",
      department: initialData?.department || "",
      startingSemester: initialData?.startingSemester || "",
      codeforcesHandle: initialData?.codeforcesHandle || "",
      atcoderHandle: initialData?.atcoderHandle || "",
      vjudgeHandle: initialData?.vjudgeHandle || "",
      maxCfRating: initialData?.maxCfRating
        ? initialData.maxCfRating.toString()
        : "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && userId) {
        response = await updateUser(userId, values);
      } else {
        response = await createUser(values);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "User updated successfully!"
            : "User created successfully!"
        );
        router.push("/admin/users");
      } else {
        if (typeof response.error === "string") {
          toast.error(response.error);
        } else {
          toast.error("Please check the form for errors.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit User" : "Create New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student ID" {...field} />
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={GenderType.MALE}>Male</SelectItem>
                          <SelectItem value={GenderType.FEMALE}>
                            Female
                          </SelectItem>
                          <SelectItem value={GenderType.OTHER}>
                            Other
                          </SelectItem>
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Academic & Programming Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Academic & Programming Information
                </h3>

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department" {...field} />
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
                        <Input placeholder="e.g., Fall 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codeforcesHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codeforces Handle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Codeforces username"
                          {...field}
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
                          placeholder="Enter AtCoder username"
                          {...field}
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
                      <FormLabel>VJudge Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter VJudge username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCfRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Codeforces Rating</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter max rating"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update User"
                  : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
