import { ensureDatabase } from '../lib/db';

await ensureDatabase();
console.log('PostgreSQL database migrated and seeded (or already up to date).');
