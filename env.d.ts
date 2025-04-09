/// <reference types="node" />

enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: NodeEnv;
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SENTRY_AUTH_TOKEN: string;
      NEXT_PUBLIC_SITE_URL: string;
      NEXT_PUBLIC_AUTHORIZED_EMAILS: string;
    }
  }
}

export {};
