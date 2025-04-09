import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (isPublicAsset(req)) return res;
  return res;
}

function isPublicAsset(request: NextRequest): boolean {
  const publicAssetPaths: string[] = [
    '/assets/',
    '/pwa/',
    '/images/',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.webmanifest',
    '/sw.js',
  ];

  return publicAssetPaths.some((path) => request.nextUrl.pathname.startsWith(path));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
