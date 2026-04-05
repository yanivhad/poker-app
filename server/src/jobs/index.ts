import cron from 'node-cron'
import { prisma } from '../lib/prisma'
cron.schedule('0 8 * * 3', async () => {
  const events = await prisma.event.findMany({ where: { status: 'DRAFT', registrationOpensAt: { lte: new Date() } } })
  for (const evt of events) {
    await prisma.event.update({ where: { id: evt.id }, data: { status: 'OPEN' } })
    console.log(`[cron] Opened registration for event ${evt.id}`)
  }
})
console.log('[cron] Jobs registered')
