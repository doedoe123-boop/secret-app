import { createClient } from "@supabase/supabase-js";

export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  // Use Service Role Key (only on the server!)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } } 
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(`Failed to delete user account: ${error.message}`);
  }

  return true;
};
