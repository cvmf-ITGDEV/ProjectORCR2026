import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDraft } from "@/actions/application";

export default async function NewApplicationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getOrCreateDraft();

  if (result.success && result.data) {
    redirect(`/application/${result.data.id}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Creating application...</p>
    </div>
  );
}
