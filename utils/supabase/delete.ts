import { createClient } from './server';

export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  const supabase = await createClient();
  
   const { error } = await supabase.auth.admin.deleteUser(userId);
   
  if (error) {
    throw new Error(error.message);
  }

  return true;
};
