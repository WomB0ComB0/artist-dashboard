import { createClient } from '@/utils';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const origin = headers().get('origin');
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) throw error;

    if (!data.url) {
      throw new Error('No URL returned from Supabase');
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return NextResponse.json(
      {
        error: 'Authentication Failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
