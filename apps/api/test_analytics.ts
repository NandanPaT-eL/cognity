import { db } from './src/db/index.js';
import { sessions, activityEvents } from './src/db/schema.js';
import { eq, and, isNotNull, sql, desc } from 'drizzle-orm';

async function test() {
  try {
    const orgId = '00000000-0000-0000-0000-000000000000'; // dummy uuid
    const [totalResult] = await db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(sessions)
      .where(eq(sessions.org_id, orgId));
    console.log('Total:', totalResult);

    const stuckPages = await db
      .select({
        page_path:  activityEvents.page_path,
        idle_count: sql<number>`cast(count(*) as int)`,
      })
      .from(activityEvents)
      .where(and(eq(activityEvents.org_id, orgId), eq(activityEvents.event_type, 'idle')))
      .groupBy(activityEvents.page_path)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);
    console.log('Stuck pages:', stuckPages);
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
test();
