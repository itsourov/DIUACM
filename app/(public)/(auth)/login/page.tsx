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
import { Separator } from "@/components/ui/separator";
import LoginForm from "./components/LoginForm";
import { GoogleLoginButton } from "./components/google-login-button";

export const metadata: Metadata = {
  title: "Login - DIU ACM",
  description: "Sign in to your DIU ACM account",
};

function LoginPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              DIU ACM
            </span>
          </h1>
          <div className="mx-auto w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Suspense
              fallback={
                <div className="h-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
              }
            >
              <GoogleLoginButton callbackUrl="/" />
            </Suspense>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-4 text-slate-500 dark:text-slate-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
