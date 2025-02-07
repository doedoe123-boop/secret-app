import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "../../../components/ui/button";
import UpdateProfile from "@/components/update-profile";
import SecretMessageForm from "@/components/secret-message";

export default async function SecretPage1() {
  const supabase = await createClient();
  
  // Fetch the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  // If no user is authenticated, redirect to sign-in page
  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center justify-center px-4">
      <h2 className="font-bold text-2xl">Welcome to Your Secret Page</h2>
      <p>This is your secret space that you can only see and your friend.</p>

      {/* Update profile */}
      <UpdateProfile userId={user.id} />

      {/* Secret message */}
      <SecretMessageForm userId={user.id} allowDelete={false} />
    </div>
  );
}
