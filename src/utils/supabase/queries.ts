import type { SupabaseClient } from '@supabase/supabase-js';

// export const getUserById = async (supabase: SupabaseClient, userId: string) => {
//   const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

//   if (error) throw error;
//   return data;
// };
