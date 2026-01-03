"use server";

import { z } from "zod";
import { ApplicationRepository } from "@/repositories/ApplicationRepository";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { ActionResult, ApplicationStatus } from "@/types";
import type { Application } from "@/entities/Application";

const applicationSchema = z.object({
  borrowerName: z.string().min(1, "Borrower name is required"),
  borrowerEmail: z.string().email("Valid email is required"),
  borrowerPhone: z.string().min(1, "Phone number is required"),
  borrowerAddress: z.string().min(1, "Address is required"),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleYear: z.number().int().min(1900),
  plateNumber: z.string().min(1, "Plate number is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  chassisNumber: z.string().min(1, "Chassis number is required"),
  loanAmount: z.number().positive("Loan amount must be positive"),
  loanTermMonths: z.number().int().positive("Loan term must be positive"),
  interestRate: z.number().min(0, "Interest rate cannot be negative"),
});

export async function createApplication(
  processorId: string,
  data: z.infer<typeof applicationSchema>
): Promise<ActionResult> {
  try {
    const validated = applicationSchema.parse(data);

    const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const application = await ApplicationRepository.create({
      applicationNumber,
      processorId,
      status: "draft",
      wizardStep: 1,
      ...validated,
    });

    // Log creation
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: application.id,
      action: "CREATE",
      userId: processorId,
      newValues: validated,
    });

    return { success: true, data: application };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0].message;
      return { success: false, error: message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateApplication(
  id: string,
  updates: Partial<z.infer<typeof applicationSchema>>,
  userId: string
): Promise<ActionResult> {
  try {
    const oldApplication = await ApplicationRepository.findById(id);
    if (!oldApplication) {
      return { success: false, error: "Application not found" };
    }

    const validated = applicationSchema.partial().parse(updates);
    const updated = await ApplicationRepository.update(id, validated);

    // Log update
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "UPDATE",
      userId,
      oldValues: {
        borrowerName: oldApplication.borrowerName,
        borrowerEmail: oldApplication.borrowerEmail,
        loanAmount: oldApplication.loanAmount,
      },
      newValues: validated,
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0].message;
      return { success: false, error: message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  userId?: string
): Promise<ActionResult> {
  try {
    const oldApplication = await ApplicationRepository.findById(id);
    if (!oldApplication) {
      return { success: false, error: "Application not found" };
    }

    const updates: Partial<typeof oldApplication> = {
      status,
    };

    if (status === "submitted" && !oldApplication.submittedAt) {
      updates.submittedAt = new Date();
    }

    const updated = await ApplicationRepository.update(id, updates);

    // Log status change
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "STATUS_CHANGE",
      userId: userId || oldApplication.processorId || undefined,
      oldValues: { status: oldApplication.status },
      newValues: { status },
    });

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getApplication(id: string): Promise<ActionResult> {
  try {
    const application = await ApplicationRepository.findById(id);
    if (!application) {
      return { success: false, error: "Application not found" };
    }
    return { success: true, data: application };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getApplicationsByProcessor(processorId: string): Promise<ActionResult> {
  try {
    const applications = await ApplicationRepository.findByProcessorId(processorId);
    return { success: true, data: applications };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getAllApplications(): Promise<ActionResult> {
  try {
    const applications = await ApplicationRepository.findAll();
    return { success: true, data: applications };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function deleteApplication(id: string, userId: string): Promise<ActionResult> {
  try {
    const oldApplication = await ApplicationRepository.findById(id);
    if (!oldApplication) {
      return { success: false, error: "Application not found" };
    }

    const deleted = await ApplicationRepository.delete(id);

    if (!deleted) {
      return { success: false, error: "Failed to delete application" };
    }

    // Log deletion
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "DELETE",
      userId,
      oldValues: {
        id: oldApplication.id,
        applicationNumber: oldApplication.applicationNumber,
        status: oldApplication.status,
      },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function fetchApplication(id: string) {
  try {
    const application = await ApplicationRepository.findById(id);
    return application;
  } catch {
    return null;
  }
}

export async function saveBorrowerInfo(
  id: string,
  data: { borrowerName: string; borrowerEmail: string; borrowerPhone: string; borrowerAddress: string }
): Promise<ActionResult> {
  try {
    const application = await ApplicationRepository.findById(id);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    const validated = applicationSchema.partial().parse(data);
    const updated = await ApplicationRepository.update(id, { ...validated, wizardStep: 2 });

    // Log update
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "UPDATE",
      userId: application.processorId,
      oldValues: {
        borrowerName: application.borrowerName,
        borrowerEmail: application.borrowerEmail,
      },
      newValues: validated,
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0].message;
      return { success: false, error: message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function saveVehicleInfo(
  id: string,
  data: { vehicleMake: string; vehicleModel: string; vehicleYear: string; plateNumber: string; engineNumber: string; chassisNumber: string }
): Promise<ActionResult> {
  try {
    const application = await ApplicationRepository.findById(id);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    const convertedData = {
      ...data,
      vehicleYear: parseInt(data.vehicleYear),
    };

    const validated = applicationSchema.partial().parse(convertedData);
    const updated = await ApplicationRepository.update(id, { ...validated, wizardStep: 3 });

    // Log update
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "UPDATE",
      userId: application.processorId,
      oldValues: {
        vehicleMake: application.vehicleMake,
        vehicleModel: application.vehicleModel,
      },
      newValues: validated,
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0].message;
      return { success: false, error: message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function saveLoanDetails(
  id: string,
  data: { loanAmount: string; loanTermMonths: string; interestRate: string }
): Promise<ActionResult> {
  try {
    const application = await ApplicationRepository.findById(id);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    const loanAmount = parseFloat(data.loanAmount);
    const loanTermMonths = parseInt(data.loanTermMonths);
    const interestRate = parseFloat(data.interestRate);

    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment =
      monthlyRate === 0
        ? loanAmount / loanTermMonths
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
          (Math.pow(1 + monthlyRate, loanTermMonths) - 1);

    const convertedData = {
      loanAmount,
      loanTermMonths,
      interestRate,
    };

    const validated = applicationSchema.partial().parse(convertedData);
    const updated = await ApplicationRepository.update(id, {
      ...validated,
      monthlyPayment,
      wizardStep: 4,
    });

    // Log update
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "UPDATE",
      userId: application.processorId,
      oldValues: {
        loanAmount: application.loanAmount,
        interestRate: application.interestRate,
      },
      newValues: validated,
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0].message;
      return { success: false, error: message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function submitApplication(id: string): Promise<ActionResult> {
  try {
    const application = await ApplicationRepository.findById(id);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    const updated = await ApplicationRepository.update(id, {
      status: "submitted",
      submittedAt: new Date(),
    });

    // Log submission
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: id,
      action: "SUBMIT",
      userId: application.processorId,
      oldValues: { status: application.status },
      newValues: { status: "submitted" },
    });

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function generateOrCr(id: string): Promise<ActionResult> {
  try {
    const application = await ApplicationRepository.findById(id);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    if (application.status !== "approved") {
      return { success: false, error: "Application must be approved before generating OR/CR" };
    }

    // Generate OR and CR numbers
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
    const orNumber = `OR-${timestamp}-${randomStr}`;
    const crNumber = `CR-${timestamp}-${randomStr}`;

    const today = new Date();
    const issueDate = today;
    const expiryDate = new Date(today.setFullYear(today.getFullYear() + 1));

    // Create OrCrRecord
    const orCrRecord = {
      applicationId: id,
      orNumber,
      crNumber,
      issueDate,
      expiryDate,
    };

    // Update application status to active
    await ApplicationRepository.update(id, { status: "active" });

    // Log creation
    await AuditLogRepository.create({
      entityType: "OrCrRecord",
      entityId: id,
      action: "CREATE",
      userId: application.processorId,
      newValues: orCrRecord,
    });

    return { success: true, data: orCrRecord };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getOrCreateDraft(processorId?: string): Promise<ActionResult<Application>> {
  try {
    // If no processorId provided, get from Supabase session
    let userId = processorId;
    if (!userId) {
      const { createClient } = await import("@/lib/supabase/server");
      const { UserRepository } = await import("@/repositories/UserRepository");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const dbUser = await UserRepository.findBySupabaseUserId(user.id);
      if (!dbUser) {
        return { success: false, error: "User not found in database" };
      }

      userId = dbUser.id;
    }

    // Try to find existing draft
    const applications = await ApplicationRepository.findByProcessorId(userId);
    const existingDraft = applications.find((app) => app.status === "draft");

    if (existingDraft) {
      return { success: true, data: existingDraft };
    }

    // Create new draft
    const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newDraft = await ApplicationRepository.create({
      applicationNumber,
      processorId: userId,
      status: "draft",
      wizardStep: 1,
    });

    // Log creation
    await AuditLogRepository.create({
      entityType: "Application",
      entityId: newDraft.id,
      action: "CREATE",
      userId,
      newValues: { applicationNumber, status: "draft" },
    });

    return { success: true, data: newDraft };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
