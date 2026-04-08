import { prisma } from '../lib/prisma'

export const register = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })

  if (event.status !== 'OPEN')
    throw new Error('Registration is not open for this event')

  const existing = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId } }
  })
  if (existing && existing.status !== 'CANCELLED')
    throw new Error('Already registered for this event')

  const confirmedCount = await prisma.registration.count({
    where: { eventId, status: 'CONFIRMED' }
  })
  const totalCount = await prisma.registration.count({
    where: { eventId, status: { in: ['CONFIRMED', 'WAITLIST'] } }
  })

  const status   = confirmedCount >= event.maxSeats ? 'WAITLIST' : 'CONFIRMED'
  const position = totalCount + 1

  if (existing) {
    return prisma.registration.update({
      where: { eventId_userId: { eventId, userId } },
      data:  { status, position }
    })
  }

  return prisma.registration.create({
    data: { eventId, userId, status, position }
  })
}

export const cancel = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })

  if (!['OPEN', 'CLOSED'].includes(event.status))
    throw new Error('Cannot cancel registration for this event')

  const reg = await prisma.registration.findUniqueOrThrow({
    where: { eventId_userId: { eventId, userId } }
  })

  if (reg.status === 'CANCELLED')
    throw new Error('Registration already cancelled')

  const wasConfirmed = reg.status === 'CONFIRMED'

  await prisma.registration.update({
    where: { eventId_userId: { eventId, userId } },
    data:  { status: 'CANCELLED' }
  })

  // If the cancelling user was the host, clear the host slot
  if (event.hostId === userId) {
    await prisma.event.update({
      where: { id: eventId },
      data:  { hostId: null }
    })
  }

  // FIFO waitlist promotion
  if (wasConfirmed) {
    const confirmedCount = await prisma.registration.count({
      where: { eventId, status: 'CONFIRMED' }
    })

    if (confirmedCount < event.maxSeats) {
      const next = await prisma.registration.findFirst({
        where:   { eventId, status: 'WAITLIST' },
        orderBy: { position: 'asc' }   // FIFO — earliest registration first
      })
      if (next) {
        await prisma.registration.update({
          where: { id: next.id },
          data:  { status: 'CONFIRMED' }
        })
        // TODO: send WhatsApp notification to next.userId
        console.log(`[waitlist] Promoted user ${next.userId} to CONFIRMED`)
      }
    }
  }

  return { message: 'Cancelled successfully' }
}

export const getRegistrations = (eventId: string) =>
  prisma.registration.findMany({
    where:   { eventId, status: { in: ['CONFIRMED', 'WAITLIST'] } },
    include: { user: { select: { id: true, nickname: true, phone: true } } },
    orderBy: { position: 'asc' },
  })