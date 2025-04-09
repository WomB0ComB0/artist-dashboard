'use server';

import type { CreateUserInput } from '@/schemas/user';
import { createServer } from '@/utils';

export async function signUpWithEmailAndPassword({
  data,
  emailRedirectTo,
}: {
  data: CreateUserInput;
  emailRedirectTo?: string;
}) {
  const supabase = await createServer();
  try {
    const result = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo,
        data: {
          name: data.name,
        },
      },
    });

    if (result.error) {
      console.error('Supabase signUp error:', result.error);
      return JSON.stringify({ error: result.error });
    }

    return JSON.stringify(result);
  } catch (error) {
    console.error('Unexpected error during signUp:', error);
    return JSON.stringify({ error: { message: 'An unexpected error occurred' } });
  }
}
