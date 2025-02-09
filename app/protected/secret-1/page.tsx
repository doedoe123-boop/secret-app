"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/utils/supabase/client"; 
import { Button } from "../../../components/ui/button";
import UpdateProfile from "@/components/update-profile";
import SecretMessageForm from "@/components/secret-message";
import { signOutAction, deleteUserAction } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function SecretPage1() {
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user:", error.message);
        // Redirect or handle the error appropriately if no user is found
        return;
      }
      
      if (user) {
        setUser(user);
      } else {
        // Redirect to the sign-in page if no user is authenticated
        router.push("/sign-in");
      }
    }

    fetchUser();
  }, [supabase, router]);

  // If user is not loaded, we can render a loading state
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center justify-center px-4">
      <h2 className="font-bold text-2xl">Welcome to Your Secret Page</h2>
      <p>This is your secret space that you can only see and your friend.</p>

      {/* Update profile */}
      <UpdateProfile userId={user.id} />

      {/* Secret message */}
      <SecretMessageForm userId={user.id} allowDelete={false} />

      {/* Delete Account Button */}
      <Button 
        onClick={() => {
          if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            startTransition(async () => {
              const result = await deleteUserAction();
              if (result.success) {
                router.push("/");
              }
            });
          }
        }}
        variant="destructive" 
        disabled={isPending}
      >
        {isPending ? "Deleting..." : "Delete Account"}
      </Button>

      {/* Sign Out Button */}
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
