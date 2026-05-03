import { prisma } from '../lib/prisma'

const countConfirmed = (eventId: string) =>
  Promise.all([
    prisma.registration.count({ where: { eventId, status: 'CONFIRMED' } }),
    prisma.guestRegistration.count({ where: { eventId, status: 'CONFIRMED' } }),
  ]).then(([u, g]) => u + g)

const countTotal = (eventId: string) =>
  Promise.all([
    prisma.registration.count({ where: { eventId, status: { in: ['CONFIRMED', 'WAITLIST'] } } }),
    prisma.guestRegistration.count({ where: { eventId, status: { in: ['CONFIRMED', 'WAITLIST'] } } }),
  ]).then(([u, g]) => u + g)

export const register = async (eventId: string, userId: string, guests: { name: string; phone?: string }[] = []) => {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
  if (event.status !== 'OPEN') throw new Error('Registration is not open for this event')

  const existing = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId } }
  })
  if (existing && existing.status !== 'CANCELLED') throw new Error('Already registered for this event')

  const confirmed = await countConfirmed(eventId)
  const total     = await countTotal(eventId)
  const status    = confirmed >= event.maxSeats ? 'WAITLIST' : 'CONFIRMED'
  const position  = total + 1

  const registration = existing
    ? await prisma.registration.update({
        where: { eventId_userId: { eventId, userId } },
        data:  { status, position }
      })
    : await prisma.registration.create({
        data: { eventId, userId, status, position }
      })

  const guestRegistrations = []
  for (const g of guests) {
    const name = g.name.trim()
    if (!name) continue
    const phone      = g.phone?.trim() || null
    const gConfirmed = await countConfirmed(eventId)
    const gTotal     = await countTotal(eventId)
    const gStatus    = gConfirmed >= event.maxSeats ? 'WAITLIST' : 'CONFIRMED'
    const gPosition  = gTotal + 1

    const existing = await prisma.guestRegistration.findUnique({
      where: { eventId_registeredById_name: { eventId, registeredById: userId, name } }
    })
    if (existing && existing.status !== 'CANCELLED') continue

    const gr = existing
      ? await prisma.guestRegistration.update({
          where: { eventId_registeredById_name: { eventId, registeredById: userId, name } },
          data: { status: gStatus, position: gPosition, phone }
        })
      : await prisma.guestRegistration.create({
          data: { eventId, registeredById: userId, name, phone, status: gStatus, position: gPosition }
        })
    guestRegistrations.push(gr)
  }

  return { registration, guestRegistrations }
}

export const cancel = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
  if (!['OPEN', 'CLOSED'].includes(event.status))
    throw new Error('Cannot cancel registration for this event')

  const reg = await prisma.registration.findUniqueOrThrow({
    where: { eventId_userId: { eventId, userId } }
  })
  if (reg.status === 'CANCELLED') throw new Error('Registration already cancelled')

  const wasConfirmed = reg.status === 'CONFIRMED'

  await prisma.registration.update({
    where: { eventId_userId: { eventId, userId } },
    data:  { status: 'CANCELLED' }
  })

  if (event.hostId === userId) {
    await prisma.event.update({ where: { id: eventId }, data: { hostId: null } })
  }

  const guestRegs = await prisma.guestRegistration.findMany({
    where: { eventId, registeredById: userId, status: { not: 'CANCELLED' } }
  })
  const confirmedGuestCount = guestRegs.filter(g => g.status === 'CONFIRMED').length

  if (guestRegs.length > 0) {
    await prisma.guestRegistration.updateMany({
      where: { eventId, registeredById: userId, status: { not: 'CANCELLED' } },
      data:  { status: 'CANCELLED' }
    })
  }

  const totalFreed = (wasConfirmed ? 1 : 0) + confirmedGuestCount
  if (totalFreed > 0) {
    const confirmedNow = await countConfirmed(eventId)
    const available    = event.maxSeats - confirmedNow
    if (available > 0) {
      const [userWaitlist, guestWaitlist] = await Promise.all([
        prisma.registration.findMany({
          where: { eventId, status: 'WAITLIST' }, orderBy: { position: 'asc' }
        }),
        prisma.guestRegistration.findMany({
          where: { eventId, status: 'WAITLIST' }, orderBy: { position: 'asc' }
        }),
      ])
      const allWaitlist = [
        ...userWaitlist.map(r  => ({ type: 'user'  as const, id: r.id, position: r.position })),
        ...guestWaitlist.map(r => ({ type: 'guest' as const, id: r.id, position: r.position })),
      ].sort((a, b) => a.position - b.position).slice(0, available)

      for (const entry of allWaitlist) {
        if (entry.type === 'user') {
          await prisma.registration.update({ where: { id: entry.id }, data: { status: 'CONFIRMED' } })
          console.log(`[waitlist] Promoted user registration ${entry.id} to CONFIRMED`)
        } else {
          await prisma.guestRegistration.update({ where: { id: entry.id }, data: { status: 'CONFIRMED' } })
          console.log(`[waitlist] Promoted guest registration ${entry.id} to CONFIRMED`)
        }
      }
    }
  }

  return { message: 'Cancelled successfully' }
}

export const getRegistrations = async (eventId: string) => {
  const [userRegs, guestRegs] = await Promise.all([
    prisma.registration.findMany({
      where:   { eventId, status: { in: ['CONFIRMED', 'WAITLIST'] } },
      include: { user: { select: { id: true, nickname: true, phone: true } } },
      orderBy: { position: 'asc' },
    }),
    prisma.guestRegistration.findMany({
      where:   { eventId, status: { in: ['CONFIRMED', 'WAITLIST'] } },
      include: { registeredBy: { select: { id: true, nickname: true } } },
      orderBy: { position: 'asc' },
    }),
  ])

  return [
    ...userRegs.map(r  => ({ ...r, isGuest: false as const })),
    ...guestRegs.map(r => ({ ...r, isGuest: true as const, guestName: r.name })),
  ].sort((a, b) => a.position - b.position)
}
