'use client';

import { BackgroundLines } from '@/components';
import { Card } from '@/components/ui/card';
import ShimmerButton from '@/components/ui/shimmer-button';
import { useUser } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import Loading from '../loading';

export default function HomeClient() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/admin/dashboard');
      } else {
        toast.error('No user found, staying on home page');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  const handleDashboardClick = () => {
    if (user) {
      router.push('/admin/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <BackgroundLines>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card
          className={
            'w-full max-w-md mx-auto rounded-xl overflow-hidden bg-white/20 backdrop-blur-lg border border-white/30'
          }
        >
          <div className="relative p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Welcome to Mel Dreams
              </h1>
              <ShimmerButton
                onClick={handleDashboardClick}
                className="font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                {user ? 'Go to Dashboard' : 'Login'}
              </ShimmerButton>
            </div>
          </div>
        </Card>
      </main>
    </BackgroundLines>
  );
}
