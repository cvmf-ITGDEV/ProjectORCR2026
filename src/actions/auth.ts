"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserSyncService } from "@/lib/auth/user-sync";
import { ActionResult } from "@/types";

export async function login(formData: FormData): Promise<ActionResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to sign in" };
    }

    await UserSyncService.ensureUserExists(
      data.user.id,
      data.user.email || email,
      data.user.user_metadata?.full_name
    );

    redirect("/dashboard");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function register(formData: FormData): Promise<ActionResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || undefined,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to create account" };
    }

    await UserSyncService.syncUserOnFirstLogin(
      data.user.id,
      email,
      fullName || undefined
    );

    redirect("/dashboard");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signUp(email: string, password: string, fullName?: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || undefined,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to create user" };
    }

    const user = await UserSyncService.syncUserOnFirstLogin(
      data.user.id,
      email,
      fullName
    );

    return { success: true, data: user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function signIn(email: string, password: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to sign in" };
    }

    const user = await UserSyncService.ensureUserExists(
      data.user.id,
      data.user.email || email,
      data.user.user_metadata?.full_name
    );

    return { success: true, data: user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getSession(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.session) {
      return { success: false, error: "No active session" };
    }

    const user = await UserSyncService.getUserBySupabaseId(data.session.user.id);

    return { success: true, data: { user, session: data.session } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function resetPassword(email: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { message: "Password reset email sent" } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
