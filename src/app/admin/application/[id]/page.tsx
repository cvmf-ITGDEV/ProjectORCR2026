"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApplication, updateApplicationStatus, generateOrCr as generateOrCrAction } from "@/actions/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle, XCircle, FileCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Application } from "@/entities/Application";

export default function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showOrCrDialog, setShowOrCrDialog] = useState(false);

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
    } catch {
      setError("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: "approved" | "rejected" | "under_review") => {
    setProcessing(true);
    setError(null);
    try {
      const result = await updateApplicationStatus(resolvedParams.id, status);
      if (result.success) {
        await loadApplication();
        setShowApproveDialog(false);
        setShowRejectDialog(false);
      } else {
        setError(result.error || "Failed to update status");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateOrCr = async () => {
    setProcessing(true);
    setError(null);
    try {
      const result = await generateOrCrAction(resolvedParams.id);
      if (result.success) {
        await loadApplication();
        setShowOrCrDialog(false);
      } else {
        setError(result.error || "Failed to generate OR/CR");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setProcessing(false);
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
            <Link href="/admin">
              <Button className="mt-4">Back to Admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) return null;

  const orCrRecord = application.orCrRecord as any;
  const statusVariant = (status: string) => {
    switch (status) {
      case "submitted": return "default";
      case "under_review": return "warning";
      case "approved": return "success";
      case "rejected": return "destructive";
      case "active": return "success";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="font-semibold">Application Review</span>
            <Badge variant={statusVariant(application.status)}>{application.status}</Badge>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Application #{application.applicationNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold">Borrower Information</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{application.borrowerName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{application.borrowerEmail || "---"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{application.borrowerPhone || "---"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Address</dt>
                    <dd className="font-medium">{application.borrowerAddress || "---"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Vehicle Information</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Make & Model</dt>
                    <dd className="font-medium">
                      {application.vehicleMake} {application.vehicleModel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Year</dt>
                    <dd className="font-medium">{application.vehicleYear}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Plate Number</dt>
                    <dd className="font-medium">{application.plateNumber || "---"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Engine Number</dt>
                    <dd className="font-medium">{application.engineNumber || "---"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Chassis Number</dt>
                    <dd className="font-medium">{application.chassisNumber || "---"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Loan Details</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Loan Amount</dt>
                    <dd className="font-medium">{formatCurrency(application.loanAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Term</dt>
                    <dd className="font-medium">{application.loanTermMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Interest Rate</dt>
                    <dd className="font-medium">{application.interestRate}%</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Monthly Payment</dt>
                    <dd className="font-bold text-lg">{formatCurrency(application.monthlyPayment)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Application Timeline</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(application.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="font-medium">{formatDate(application.submittedAt)}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          {orCrRecord && (
            <Card>
              <CardHeader>
                <CardTitle>OR/CR Records</CardTitle>
                <CardDescription>Official Receipt and Certificate of Registration</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">OR Number</dt>
                    <dd className="font-mono font-medium">{orCrRecord.orNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">CR Number</dt>
                    <dd className="font-mono font-medium">{orCrRecord.crNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Issue Date</dt>
                    <dd className="font-medium">{formatDate(orCrRecord.issueDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Expiry Date</dt>
                    <dd className="font-medium">{formatDate(orCrRecord.expiryDate)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {application.status === "submitted" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Review and update application status</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("under_review")}
                  disabled={processing}
                >
                  Mark Under Review
                </Button>
                <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="default" disabled={processing}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Application</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to approve this application? This action can be reversed.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleStatusChange("approved")} disabled={processing}>
                        {processing ? "Processing..." : "Approve"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={processing}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Application</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reject this application? This action can be reversed.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusChange("rejected")}
                        disabled={processing}
                      >
                        {processing ? "Processing..." : "Reject"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {application.status === "approved" && !orCrRecord && (
            <Card>
              <CardHeader>
                <CardTitle>Generate OR/CR</CardTitle>
                <CardDescription>Generate official receipt and certificate of registration</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showOrCrDialog} onOpenChange={setShowOrCrDialog}>
                  <DialogTrigger asChild>
                    <Button disabled={processing}>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Generate OR/CR
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate OR/CR Records</DialogTitle>
                      <DialogDescription>
                        This will generate official receipt and certificate of registration numbers for this
                        application and mark it as active. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowOrCrDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateOrCr} disabled={processing}>
                        {processing ? "Generating..." : "Generate"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
