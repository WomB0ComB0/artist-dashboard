import pwa from '@ducanh2912/next-pwa';
import MillionLint from '@million/lint';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import million from 'million/compiler';

const withPwa = pwa({
  dest: 'public',
  disable: true,
  register: true,
  sw: '/sw.js',
  publicExcludes: ['!noprecache/**/*'],
});

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'http', hostname: 'localhost:3000' },
      { protocol: 'https', hostname: 'media.licdn.com' },
    ],
  },
  experimental: {
    optimizeCss: true,
    swcMinify: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      { source: '/healthz', destination: '/api/health' },
      { source: '/api/healthz', destination: '/api/health' },
      { source: '/health', destination: '/api/health' },
      { source: '/ping', destination: '/api/health' },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
      {
        source: '/(.*).png',
        headers: [{ key: 'Content-Type', value: 'image/png' }],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
      type: 'asset',
      generator: {
        filename: 'static/media/[hash][ext][query]',
      },
    });
    return config;
  },
  publicRuntimeConfig: {
    basePath: '',
  },
};

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const millionConfig = {
  auto: true,
};

const finalConfig = withBundleAnalyzerConfig(
  withPwa(
    // million.next(
    //   MillionLint.next({
    //     production: process.env.NODE_ENV === 'production',
    //     rsc: true,
    //     filter: {
    //       exclude: ['**/node_modules/**/*', '**/components/ui/**/*.{mtsx,mjsx,tsx,jsx}'],
    //       include: '**/components/**/*.{mtsx,mjsx,tsx,jsx}',
    //     },
    //   })(config),
    //   millionConfig,
    // ),
    config,
  ),
);

const shouldUseSentry = process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN;

let exportedConfig = finalConfig;

if (shouldUseSentry) {
  exportedConfig = withSentryConfig(finalConfig, {
    org: 'womb0comb0',
    project: '<project-name>',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: process.env.NODE_ENV === 'production',
    // release: {
    //   name: process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now()}`,
    //   create: true,
    //   setCommits: {
    //     auto: true,
    //     ignoreMissing: true,
    //   },
    // },
    sourcemaps: {
      assets: './**/*.{js,map}',
      ignore: ['node_modules/**/*'],
    },
    hideSourceMaps: true,
    widenClientFileUpload: true,
    autoInstrumentServerFunctions: true,
    autoInstrumentMiddleware: true,
    autoInstrumentAppDirectory: true,
    tunnelRoute: '/monitoring',
    disableLogger: true,
    automaticVercelMonitors: true,
    reactComponentAnnotation: {
      enabled: true,
    },
  });
}

export default exportedConfig;
