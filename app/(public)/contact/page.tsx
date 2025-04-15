import { Metadata } from "next";
import { ContactForm } from "./components/contact-form";
import { Mail, MessageSquare, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Us - DIU QBank",
  description: "Get in touch with the DIU QBank team for support or feedback.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Contact{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Us
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Have questions or feedback? We&apos;d love to hear from you and help
          with anything you need.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <Card className="lg:col-span-2 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Send us a message
              </h2>
            </div>
            <ContactForm />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-2">
                  <Mail className="h-4 w-4 text-white" />
                </span>
                Contact Information
              </h2>
              <div className="space-y-4 mt-6">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                  <Mail className="h-5 w-5 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">
                      Contact Email
                    </p>
                    <a
                      href="mailto:info@diuacm.com"
                      className="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      info@diuacm.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                  <MessageCircle className="h-5 w-5 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-200">
                      Telegram Channel
                    </p>
                    <a
                      href="https://t.me/+AH0gg2-V5xIxYjA9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      https://t.me/+AH0gg2-V5xIxYjA9
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mr-2">
                  <Clock className="h-4 w-4 text-white" />
                </span>
                Response Time
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mt-3">
                We typically respond to inquiries within 24-48 hours during
                weekdays.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
