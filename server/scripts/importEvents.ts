/// <reference types="node" />
/**
 * Import historical events from a JSON file.
 *
 * Usage:
 *   npx ts-node scripts/importEvents.ts path/to/events.json
 *
 * JSON format:
 * [
 *   {
 *     "date": "2025-11-13T19:30:00",
 *     "type": "ORDINARY" | "SPECIAL",          // optional, default ORDINARY
 *     "format": "IN_PERSON" | "ONLINE",         // optional, default IN_PERSON
 *     "hostNickname": "yaniv",                  // optional
 *     "players": [
 *       { "nickname": "yaniv", "buyIns": 2, "finalChips": 1450 },  // existing user
 *       { "name": "Guest Guy", "buyIns": 1, "finalChips": 300  }   // guest
 *     ]
 *   }
 * ]
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const ATLIT_GANG_ID = 'cmo1ug4a90000omv9bo180450'

const round25 = (n: number) => Math.round(n / 25) * 25

function calculateSettlements(balances: { id: string; name: string; netNIS: number; isGuest: boolean }[]) {
  const creditors = balances.filter(b => b.netNIS > 0).sort((a, b) => b.netNIS - a.netNIS)
  const debtors   = balances.filter(b => b.netNIS < 0).sort((a, b) => a.netNIS - b.netNIS)
  const cred = creditors.map(c => ({ ...c, remaining: c.netNIS }))
  const debt = debtors.map(d => ({ ...d, remaining: Math.abs(d.netNIS) }))
  const txns: { from: string; fromName: string; to: string; toName: string; amount: number; fromIsGuest: boolean; toIsGuest: boolean }[] = []

  let i = 0, j = 0
  while (i < debt.length && j < cred.length) {
    const amount  = Math.min(debt[i].remaining, cred[j].remaining)
    const rounded = round25(amount)
    if (rounded > 0) {
      txns.push({
        from:        debt[i].id,
        fromName:    debt[i].name,
        to:          cred[j].id,
        toName:      cred[j].name,
        amount:      rounded,
        fromIsGuest: debt[i].isGuest,
        toIsGuest:   cred[j].isGuest,
      })
    }
    debt[i].remaining -= amount
    cred[j].remaining -= amount
    if (debt[i].remaining < 0.01) i++
    if (cred[j].remaining < 0.01) j++
  }
  return txns
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx ts-node scripts/importEvents.ts <path-to-json>')
    process.exit(1)
  }

  const raw    = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const events = JSON.parse(raw) as any[]

  console.log(`\nImporting ${events.length} event(s)...\n`)

  for (let idx = 0; idx < events.length; idx++) {
    const ev = events[idx]
    const eventDate = new Date(ev.date)
    const label     = eventDate.toLocaleDateString('en-IL', { day: 'numeric', month: 'short', year: 'numeric' })

    console.log(`[${idx + 1}/${events.length}] ${label}`)

    // Resolve host
    let hostId: string | null = null
    if (ev.hostNickname) {
      const host = await prisma.user.findUnique({ where: { nickname: ev.hostNickname } })
      if (!host) {
        console.warn(`  ⚠  Host "${ev.hostNickname}" not found — skipping host assignment`)
      } else {
        hostId = host.id
      }
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        type:                ev.type   ?? 'ORDINARY',
        format:              ev.format ?? 'IN_PERSON',
        status:              'DONE',
        date:                eventDate,
        registrationOpensAt: eventDate,
        maxSeats:            ev.maxSeats ?? 9,
        gangId:              ATLIT_GANG_ID,
        hostId,
      },
    })

    const balances: { id: string; name: string; netNIS: number; isGuest: boolean }[] = []

    for (const p of ev.players) {
      const buyIns     = p.buyIns ?? 1
      const finalChips = p.finalChips ?? 0
      const netNIS     = (finalChips - buyIns * 500) / 10

      if (p.nickname) {
        // Existing user
        const user = await prisma.user.findUnique({ where: { nickname: p.nickname } })
        if (!user) {
          console.warn(`  ⚠  Player "${p.nickname}" not found — skipping`)
          continue
        }

        await prisma.eventPlayer.create({ data: { eventId: event.id, userId: user.id, source: 'ATTENDEE' } })
        await prisma.buyIn.create({ data: { eventId: event.id, userId: user.id, count: buyIns } })
        await prisma.result.create({ data: { eventId: event.id, userId: user.id, finalChips, netNIS } })
        balances.push({ id: user.id, name: user.nickname, netNIS, isGuest: false })
        console.log(`  ✓  ${user.nickname.padEnd(16)} buyIns=${buyIns}  chips=${finalChips}  net=${netNIS >= 0 ? '+' : ''}${netNIS.toFixed(0)}₪`)

      } else if (p.name) {
        // Guest
        const guest = await prisma.guest.create({ data: { name: p.name, eventId: event.id } })
        await prisma.eventPlayer.create({ data: { eventId: event.id, guestId: guest.id, source: 'GUEST' } })
        await prisma.buyIn.create({ data: { eventId: event.id, guestId: guest.id, count: buyIns } })
        await prisma.result.create({ data: { eventId: event.id, guestId: guest.id, finalChips, netNIS } })
        balances.push({ id: guest.id, name: p.name, netNIS, isGuest: true })
        console.log(`  ✓  ${p.name.padEnd(16)} buyIns=${buyIns}  chips=${finalChips}  net=${netNIS >= 0 ? '+' : ''}${netNIS.toFixed(0)}₪ (guest)`)

      } else {
        console.warn(`  ⚠  Player entry has neither "nickname" nor "name" — skipping`)
      }
    }

    // Calculate and save settlements
    const txns = calculateSettlements(balances)
    for (const t of txns) {
      await prisma.settlement.create({
        data: {
          eventId:       event.id,
          fromUserId:    t.fromIsGuest ? null : t.from,
          fromGuestId:   t.fromIsGuest ? t.from : null,
          fromGuestName: t.fromIsGuest ? t.fromName : null,
          toUserId:      t.toIsGuest   ? null : t.to,
          toGuestId:     t.toIsGuest   ? t.to   : null,
          toGuestName:   t.toIsGuest   ? t.toName : null,
          amountNIS:     t.amount,
          isGuestParty:  t.fromIsGuest || t.toIsGuest,
        },
      })
      console.log(`  💸 ${t.fromName} → ${t.toName}: ${t.amount}₪`)
    }

    console.log(`  → Event ${event.id} created with ${ev.players.length} players, ${txns.length} settlement(s)\n`)
  }

  console.log('✅ Import complete.')
}

main()
  .catch(e => { console.error('❌ Import failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
