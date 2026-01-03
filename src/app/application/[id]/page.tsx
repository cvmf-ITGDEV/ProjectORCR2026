"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchApplication,
  saveBorrowerInfo,
  saveVehicleInfo,
  saveLoanDetails,
  submitApplication,
} from "@/actions/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, FileText } from "lucide-react";
import { formatCurrency, calculateMonthlyPayment } from "@/lib/utils";
import type { Application } from "@/entities/Application";

export default function ApplicationWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadApplication();
  }, [resolvedParams.id]);

  const loadApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const app = await fetchApplication(resolvedParams.id);
      if (!app) {
        setError("Application not found");
        return;
      }
      setApplication(app);
      setCurrentStep(app.wizardStep);
    } catch {
      setError("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        borrowerName: formData.get("borrowerName") as string,
        borrowerEmail: formData.get("borrowerEmail") as string,
        borrowerPhone: formData.get("borrowerPhone") as string,
        borrowerAddress: formData.get("borrowerAddress") as string,
      };
      const result = await saveBorrowerInfo(resolvedParams.id, data);
      if (result.success) {
        await loadApplication();
        setCurrentStep(2);
      } else {
        setError(result.error || "Failed to save");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        vehicleMake: formData.get("vehicleMake") as string,
        vehicleModel: formData.get("vehicleModel") as string,
        vehicleYear: formData.get("vehicleYear") as string,
        plateNumber: formData.get("plateNumber") as string,
        engineNumber: formData.get("engineNumber") as string,
        chassisNumber: formData.get("chassisNumber") as string,
      };
      const result = await saveVehicleInfo(resolvedParams.id, data);
      if (result.success) {
        await loadApplication();
        setCurrentStep(3);
      } else {
        setError(result.error || "Failed to save");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        loanAmount: formData.get("loanAmount") as string,
        loanTermMonths: formData.get("loanTermMonths") as string,
        interestRate: formData.get("interestRate") as string,
      };
      const result = await saveLoanDetails(resolvedParams.id, data);
      if (result.success) {
        await loadApplication();
        setCurrentStep(4);
      } else {
        setError(result.error || "Failed to save");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await submitApplication(resolvedParams.id);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Failed to submit");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Link href="/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) return null;

  const progress = (currentStep / 4) * 100;
  const isReadOnly = application.status !== "draft";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Application {application.applicationNumber}</span>
            </div>
            <Badge variant={application.status === "draft" ? "secondary" : "default"}>
              {application.status}
            </Badge>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>Complete all steps to submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Borrower Information</CardTitle>
              <CardDescription>Enter the borrower&apos;s personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBorrowerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowerName">Full Name *</Label>
                  <Input
                    id="borrowerName"
                    name="borrowerName"
                    defaultValue={application.borrowerName || ""}
                    required
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrowerEmail">Email</Label>
                  <Input
                    id="borrowerEmail"
                    name="borrowerEmail"
                    type="email"
                    defaultValue={application.borrowerEmail || ""}
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrowerPhone">Phone</Label>
                  <Input
                    id="borrowerPhone"
                    name="borrowerPhone"
                    defaultValue={application.borrowerPhone || ""}
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrowerAddress">Address</Label>
                  <Input
                    id="borrowerAddress"
                    name="borrowerAddress"
                    defaultValue={application.borrowerAddress || ""}
                    disabled={isReadOnly || saving}
                  />
                </div>
                {!isReadOnly && (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Vehicle Information</CardTitle>
              <CardDescription>Enter vehicle details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Make *</Label>
                    <Input
                      id="vehicleMake"
                      name="vehicleMake"
                      defaultValue={application.vehicleMake || ""}
                      required
                      disabled={isReadOnly || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model *</Label>
                    <Input
                      id="vehicleModel"
                      name="vehicleModel"
                      defaultValue={application.vehicleModel || ""}
                      required
                      disabled={isReadOnly || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Year *</Label>
                  <Input
                    id="vehicleYear"
                    name="vehicleYear"
                    type="number"
                    min="1900"
                    max="2100"
                    defaultValue={application.vehicleYear || ""}
                    required
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    name="plateNumber"
                    defaultValue={application.plateNumber || ""}
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineNumber">Engine Number</Label>
                  <Input
                    id="engineNumber"
                    name="engineNumber"
                    defaultValue={application.engineNumber || ""}
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chassisNumber">Chassis Number</Label>
                  <Input
                    id="chassisNumber"
                    name="chassisNumber"
                    defaultValue={application.chassisNumber || ""}
                    disabled={isReadOnly || saving}
                  />
                </div>
                {!isReadOnly && (
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Loan Details</CardTitle>
              <CardDescription>Enter loan amount and terms</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoanSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount (PHP) *</Label>
                  <Input
                    id="loanAmount"
                    name="loanAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={application.loanAmount || ""}
                    required
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanTermMonths">Loan Term (Months) *</Label>
                  <Input
                    id="loanTermMonths"
                    name="loanTermMonths"
                    type="number"
                    min="1"
                    max="360"
                    defaultValue={application.loanTermMonths || ""}
                    required
                    disabled={isReadOnly || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                  <Input
                    id="interestRate"
                    name="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={application.interestRate || ""}
                    required
                    disabled={isReadOnly || saving}
                  />
                </div>
                {!isReadOnly && (
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Review & Submit</CardTitle>
              <CardDescription>Review your application before submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Borrower Information</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{application.borrowerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="font-medium">{application.borrowerEmail || "---"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd className="font-medium">{application.borrowerPhone || "---"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Vehicle Information</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vehicle:</dt>
                    <dd className="font-medium">
                      {application.vehicleMake} {application.vehicleModel} ({application.vehicleYear})
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Plate:</dt>
                    <dd className="font-medium">{application.plateNumber || "---"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Loan Details</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Amount:</dt>
                    <dd className="font-medium">{formatCurrency(application.loanAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Term:</dt>
                    <dd className="font-medium">{application.loanTermMonths} months</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Interest Rate:</dt>
                    <dd className="font-medium">{application.interestRate}%</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <dt className="font-semibold">Monthly Payment:</dt>
                    <dd className="font-bold">{formatCurrency(application.monthlyPayment)}</dd>
                  </div>
                </dl>
              </div>

              {!isReadOnly && (
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? "Submitting..." : "Submit Application"}
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
