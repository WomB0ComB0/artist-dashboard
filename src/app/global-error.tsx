'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as Sentry from '@sentry/nextjs';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center text-red-400 text-2xl font-bold">
              <AlertOctagon className="w-8 h-8 mr-2 animate-pulse" />
              Oops! Something went wrong
            </CardTitle>
          </CardHeader>
          <Separator className="my-4 bg-gray-700" />
          <CardContent>
            <p className="text-gray-300 mb-4">
              We're sorry, but an unexpected error occurred. Our team has been notified and is
              working on a fix.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-900 rounded-md text-sm text-gray-300 overflow-auto">
                <p className="font-semibold mb-2">Error details:</p>
                <pre className="whitespace-pre-wrap break-words">{error.message}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
