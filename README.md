# Artist Portfolio Project Setup Guide

This guide will walk you through setting up the Artist Portfolio project, a Next.js application with Supabase integration for image uploads and user authentication.

## Prerequisites

- Node.js (latest LTS version recommended)
- Git
- PostgreSQL (for local development)
- Supabase account (for database and authentication)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/artist-portfolio.git
cd artist-portfolio
```

## Step 2: Environment Setup

1. Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

2. Fill in the environment variables:

```
PORT=3000                           # Port for local development
NODE_ENV=development                # development or production
SENTRY_AUTH_TOKEN=                  # Sentry token for error tracking (optional)
NEXT_PUBLIC_API_KEY=                # Your API key if needed
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Your site URL
NEXT_PUBLIC_API_BASE_URL=           # Base URL for API calls
NEXT_PUBLIC_DATADOG_SITE=           # DataDog site (optional for monitoring)
NEXT_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Your Supabase anon/public key
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=   # DataDog client token (optional)
NEXT_PUBLIC_DATADOG_APPLICATION_ID= # DataDog application ID (optional)
```

## Step 3: Supabase Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and anon key from the project settings
3. Add these to your `.env` file
4. Set up the database schema using the provided `seed.sql` file:

   - Navigate to the SQL Editor in your Supabase dashboard
   - Create a new query and paste the contents of `seed.sql`
   - Run the query to create the necessary tables

The `seed.sql` file creates an `image_uploads` table with the following structure:

- `id`: UUID primary key
- `user_id`: UUID foreign key referencing auth.users
- `file_name`: Text field for the uploaded file name
- `file_path`: Text field for the file storage path
- `title`: Optional text field for image title
- `description`: Optional text field for image description
- `created_at`: Timestamp with timezone

## Step 4: Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun (recommended based on the package.json):

```bash
bun install
```

## Step 5: Run the Development Server

```bash
npm run dev
# or
bun run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000) (or the port you specified in your `.env` file).

## Step 6: Project Structure Overview

- `/src`: Main source code directory
  - `/components`: React components
  - `/pages`: Next.js pages
  - `/styles`: CSS and styling files
  - `/lib`: Utility functions and shared code
  - `/hooks`: Custom React hooks

## Step 7: Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run linting checks
- `npm run lint:bun`: Run Biome and Stylelint checks with automatic fixes
- `npm run type-check`: Run TypeScript type checking

## Step 8: Setting Up Image Uploads

1. Configure Supabase Storage:
   - Create a new bucket in Supabase Storage for image uploads
   - Set appropriate permissions for the bucket

2. Implement the upload functionality using `react-dropzone` (already included in dependencies)

3. Store image metadata in the `image_uploads` table after successful upload

## Additional Information

- The project uses [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) is used for styling
- [React Query](https://tanstack.com/query/latest) is used for data fetching
- [Zod](https://zod.dev/) is used for schema validation
- [Supabase](https://supabase.com/) provides authentication and database services

## Deployment

For production deployment:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start
```

3. Consider deploying to Vercel or Netlify for optimal Next.js support.

## Troubleshooting

- If you encounter database connection issues, verify your Supabase credentials
- For authentication problems, check the Supabase authentication settings
- For image upload issues, verify storage bucket permissions

Happy coding!
