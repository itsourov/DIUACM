"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, SendIcon } from "lucide-react";

import { submitContactForm } from "../actions";

// Define the schema here to use with zodResolver
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    {...field}
                    className="bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs md:text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your email address"
                    type="email"
                    {...field}
                    className="bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs md:text-sm" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                Message
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help you?"
                  className="min-h-[120px] md:min-h-[150px] bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40 resize-none text-sm md:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-xs md:text-sm" />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 px-4 md:px-6 py-2 md:py-2.5 text-white text-sm md:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
