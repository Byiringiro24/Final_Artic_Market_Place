import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en-US', 'fr', 'ar', 'rw', 'sw'],
  defaultLocale: 'en-US',
});
