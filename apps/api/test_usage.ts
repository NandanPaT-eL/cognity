import { db } from './src/db/index.js';
import { usageCounters } from './src/db/schema.js';

async function test() {
  try {
    const rows = await db.select().from(usageCounters);
    console.log(rows);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
test();
