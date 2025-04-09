import '@/styles/globals.css';
import { Providers } from '@/providers';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              function setTheme(theme) {
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.style.colorScheme = theme;
              }

              var savedTheme = localStorage.getItem('theme');
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

              setTheme(savedTheme || systemTheme);
            })();
          `}
        </Script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
