"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { contactFormSubmissions } from "@/db/schema";

// Contact form validation schema
const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

export async function submitContactForm(formData: ContactFormValues) {
  try {
    // Validate the form data
    const validatedData = ContactFormSchema.parse(formData);

    // Save to database
    await db.insert(contactFormSubmissions).values({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
    });

    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.issues,
      };
    }

    return {
      success: false,
      message: "Failed to send message. Please try again later.",
    };
  }
}
