import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Clock, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">OR/CR System</span>
            </div>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Vehicle Loan <span className="text-blue-600">OR/CR Processing</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Streamline your loan application process with our comprehensive OR/CR management system.
            Fast, secure, and efficient document processing.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-blue-600" />
              <CardTitle className="mt-4">Fast Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Quick turnaround on loan applications with our streamlined workflow
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-emerald-600" />
              <CardTitle className="mt-4">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level security for all your sensitive documents and data
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-amber-600" />
              <CardTitle className="mt-4">Digital OR/CR</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate official receipts and certificates electronically
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-teal-600" />
              <CardTitle className="mt-4">Track Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time updates on your application status
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-24 border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-600">
          <p>OR/CR Loan Processing System</p>
        </div>
      </footer>
    </div>
  );
}
