'use server';

import { createServer } from '@/utils';

export default async function getUserSession() {
  const supabase = await createServer();
  return supabase.auth.getSession();
}
