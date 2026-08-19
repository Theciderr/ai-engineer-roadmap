// Importing lib/db runs migrate() + seed() as a side effect, so this script
// just needs to trigger that import. Useful for pre-seeding a fresh
// container/volume before the first request comes in.
import '../lib/db';

console.log('Database migrated and seeded (or already up to date) at data/mission-control.db');
