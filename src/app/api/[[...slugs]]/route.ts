import imageUploadsApi from '@/app/api/image-uploads';
import { Elysia } from 'elysia';

const app = new Elysia().use(imageUploadsApi).get('/', () => 'Hello from Elysia API');

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;

export type App = typeof app;
