import { prisma } from '../lib/prisma'
import { EventFormat, EventStatus, EventType } from '@prisma/client'
const eventInclude = { host: { select: { id: true, nickname: true } }, registrations: { where: { status: { in: ['CONFIRMED' as const, 'WAITLIST' as const] } }, include: { user: { select: { id: true, nickname: true } } }, orderBy: { position: 'asc' as const } } }
export const getAllEvents    = (gangId?: string) => prisma.event.findMany({ where: gangId ? { gangId } : {}, orderBy: { date: 'desc' }, include: eventInclude })
export const getEventById   = (id: string) => prisma.event.findUnique({ where: { id }, include: { ...eventInclude, checklist: true, guests: true, eventPlayers: { include: { user: { select: { id: true, nickname: true } }, guest: true } } } })
export const getUpcomingEvent = (gangId?: string) => prisma.event.findFirst({ where: { ...(gangId ? { gangId } : {}), status: { in: ['DRAFT', 'OPEN'] }, date: { gte: new Date() } }, orderBy: { date: 'asc' }, include: eventInclude })
const DEFAULT_CHECKLIST = [
  'Beers 🍺',
  'Snacks 🥨',
  'Heater 🔥',
]

export const getActiveEvents = (gangId?: string) =>
  prisma.event.findMany({
    where:   { ...(gangId ? { gangId } : {}), status: { in: ['DRAFT', 'OPEN', 'CLOSED'] } },
    orderBy: { date: 'asc' },
    include: eventInclude,
  })

  export const createEvent = async (data: any, createdById: string) => {
    // Max 2 active events
    const activeCount = await prisma.event.count({
      where: { status: { in: ['DRAFT', 'OPEN', 'CLOSED'] } }
    })
    if (activeCount >= 2)
      throw new Error('Maximum of 2 active events allowed')
  
    // No events within 3 hours of each other
    const threeHoursBefore = new Date(data.date)
    threeHoursBefore.setHours(threeHoursBefore.getHours() - 3)
    const threeHoursAfter = new Date(data.date)
    threeHoursAfter.setHours(threeHoursAfter.getHours() + 3)
  
    const conflicting = await prisma.event.findFirst({
      where: {
        status: { in: ['DRAFT', 'OPEN', 'CLOSED'] },
        date:   { gte: threeHoursBefore, lte: threeHoursAfter },
      }
    })
    if (conflicting)
      throw new Error('Another event is already scheduled within 3 hours of this time')
  
    const status = new Date(data.registrationOpensAt) <= new Date() ? 'OPEN' : 'DRAFT'
    const event  = await prisma.event.create({ data: { ...data, status, gangId: data.gangId ?? null } })
  
    if (data.format === 'IN_PERSON') {
      await prisma.checklistItem.createMany({
        data: DEFAULT_CHECKLIST.map(label => ({
          eventId:   event.id,
          label,
          addedById: createdById,
        }))
      })
    }
  
    return event
  }

export const updateEvent    = (id: string, data: any) => prisma.event.update({ where: { id }, data })
export const deleteEvent    = (id: string) => prisma.event.delete({ where: { id } })
