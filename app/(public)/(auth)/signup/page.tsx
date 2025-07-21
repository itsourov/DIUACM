import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignupButton } from "./components/google-signup-button";

export const metadata: Metadata = {
  title: "Sign Up - DIU ACM",
  description: "Create your DIU ACM account",
};

function SignupPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Join{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              DIU ACM
            </span>
          </h1>
          <div className="mx-auto w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">
            Join our competitive programming community
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Use your DIU email address to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    DIU Email Required
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      Only students and faculty with @diu.edu.bd or
                      @s.diu.edu.bd email addresses can create accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="h-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
              }
            >
              <GoogleSignupButton callbackUrl="/" />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
