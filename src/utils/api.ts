import { edenFetch } from '@elysiajs/eden';
import type { App } from '../app/api/[[...slugs]]/route';
import { getURL } from './helpers';
export const api = edenFetch<App>(getURL());
