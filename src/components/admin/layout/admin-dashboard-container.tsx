'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useState } from 'react';

const AdminTable = dynamic(() => import('@/components/admin/components/admin-table'), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
  ssr: false,
});

const UploadComponent = dynamic(() => import('@/components/admin/components/upload-component'), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
  ssr: false,
});

const FloatingNav = memo(() => (
  <nav className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50">
    <Link
      href="/"
      className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
    >
      <Image
        src="/assets/images/logo.png"
        alt="Mel Dreams Logo"
        width={32}
        height={32}
        className="relative z-10 transition-transform duration-300 group-hover:scale-110"
      />
    </Link>
  </nav>
));

FloatingNav.displayName = 'FloatingNav';

const ViewButton = memo(
  ({
    isActive,
    onClick,
    children,
  }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
    <Button
      variant={isActive ? 'default' : 'outline'}
      onClick={onClick}
      className={`flex-1 sm:flex-none ${isActive ? 'bg-[#a07ef9] text-white' : 'border-[#a07ef9] text-[#a07ef9]'} hover:bg-[#8b6ad6] hover:text-white`}
    >
      {children}
    </Button>
  ),
);

ViewButton.displayName = 'ViewButton';

const viewButtons = [
  { view: 'table', label: 'Table View' },
  { view: 'upload', label: 'Upload' },
];

export const DashboardContainer = () => {
  const [activeView, setActiveView] = useState('table');

  const handleSetActiveView = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <FloatingNav />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <h1 className="mb-8 text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {viewButtons.map(({ view, label }) => (
            <ViewButton
              key={view}
              isActive={activeView === view}
              onClick={() => handleSetActiveView(view)}
            >
              {label}
            </ViewButton>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
          {activeView === 'upload' ? <UploadComponent /> : <AdminTable />}
        </div>
      </main>
    </div>
  );
};

export default DashboardContainer;
