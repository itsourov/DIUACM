import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-full max-w-md p-8 shadow-lg border border-slate-200 dark:border-slate-700 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <div className="text-center mb-6">
          <Badge className="mb-4 px-3.5 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
            Account Recovery
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Password Recovery
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Follow these steps to regain access to your account
          </p>
        </div>

        <div className="space-y-6">
          <ol className="list-decimal list-inside space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/70">
            <li className="pl-1">
              Click on the Google login button on the login page
            </li>
            <li className="pl-1">
              Use your DIU email address (@diu.edu.bd or @s.diu.edu.bd) to sign
              in
            </li>
            <li className="pl-1">
              Once logged in, navigate to your account settings
            </li>
            <li className="pl-1">
              Look for the password change option in your account settings
            </li>
            <li className="pl-1">Set your new password</li>
          </ol>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-xl mt-6 border border-blue-200 dark:border-blue-800/50">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Note: This method only works if you have previously registered
              with your DIU email address.
            </p>
          </div>

          <div className="flex flex-col space-y-4 mt-8">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 font-medium"
            >
              <Link href="/login">
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
