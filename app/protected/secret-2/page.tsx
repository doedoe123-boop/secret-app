import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SecretMessageForm from "@/components/secret-message";

export default async function SecretPage2() {
  const supabase = await createClient();

  // Fetch the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is authenticated, redirect to sign-in page
  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center justify-center px-4">
      <h2 className="font-bold text-2xl">Manage Your Secret Message</h2>
      <p>Edit or delete your secret message below.</p>

      {/* Secret message input (create, update, delete) */}
      <SecretMessageForm userId={user.id} allowDelete={true} />
    </div>
  );
}
