"use client";

import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { GenderType, type users } from "@/db/schema";

import {
  userFormSchema,
  userUpdateFormSchema,
  type UserFormValues,
  type UserUpdateFormValues,
} from "../schemas/user";
import { createUser, updateUser } from "../actions";

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

interface UserFormProps {
  initialData?: Partial<typeof users.$inferSelect> | null;
  isEditing?: boolean;
}

export function UserForm({ initialData, isEditing = false }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Use the appropriate schema based on whether we're editing or creating
  const formSchema = isEditing ? userUpdateFormSchema : userFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      username: initialData?.username || "",
      password: "",
      gender: initialData?.gender || undefined,
      phone: initialData?.phone || "",
      codeforcesHandle: initialData?.codeforcesHandle || "",
      atcoderHandle: initialData?.atcoderHandle || "",
      vjudgeHandle: initialData?.vjudgeHandle || "",
      startingSemester: initialData?.startingSemester || "",
      department: initialData?.department || "",
      studentId: initialData?.studentId || "",
      image: initialData?.image || "",
    },
  });

  const onSubmit = async (values: UserFormValues | UserUpdateFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && initialData?.id) {
        response = await updateUser(
          initialData.id as string,
          values as UserUpdateFormValues
        );
      } else {
        response = await createUser(values as UserFormValues);
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
          // Show specific field errors in form
          if (response.error && typeof response.error === "object" && "email" in response.error) {
            form.setError("email", {
              type: "manual",
              message: (response.error as Record<string, string[]>).email[0],
            });
          }
          if (response.error && typeof response.error === "object" && "username" in response.error) {
            form.setError("username", {
              type: "manual",
              message: (response.error as Record<string, string[]>).username[0],
            });
          }
          toast.error("Please check the form for errors.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again." + error);
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
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
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
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col">
                      <FormLabel>
                        {isEditing
                          ? "Password (leave blank to keep current)"
                          : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            isEditing
                              ? "Leave blank to keep current password"
                              : "Enter password"
                          }
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      {isEditing && (
                        <FormDescription className="text-xs pt-1">
                          Leave blank to keep current password
                        </FormDescription>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                        {Object.values(GenderType).map((gender) => (
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

            <div className="grid gap-6 md:grid-cols-3">
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

            <FormField
              control={form.control}
              name="startingSemester"
              render={({ field }) => (
                <FormItem className="w-full md:max-w-[50%]">
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

            <div className="flex justify-end gap-3">
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
