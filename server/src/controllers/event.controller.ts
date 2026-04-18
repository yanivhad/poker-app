import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import * as EventService from '../services/event.service'
import { prisma } from '../lib/prisma'

const parseDates = (body: any) => ({
  ...body,
  date:                body.date                ? new Date(body.date)                : undefined,
  registrationOpensAt: body.registrationOpensAt ? new Date(body.registrationOpensAt) : undefined,
  lastRoundTime:       body.lastRoundTime       ? new Date(body.lastRoundTime)       : undefined,
})

export const getAll      = async (req: AuthRequest, res: Response) => { try { res.json(await EventService.getAllEvents(req.gangId)) } catch (e: any) { res.status(500).json({ message: e.message }) } }
export const getUpcoming = async (req: AuthRequest, res: Response) => { try { res.json(await EventService.getUpcomingEvent(req.gangId)) } catch (e: any) { res.status(500).json({ message: e.message }) } }
export const getOne      = async (req: AuthRequest, res: Response) => { try { res.json(await EventService.getEventById(req.params.id)) } catch { res.status(404).json({ message: 'Event not found' }) } }
export const getActive = async (req: AuthRequest, res: Response) => {
  try { res.json(await EventService.getActiveEvents(req.gangId)) }
  catch (e: any) { res.status(500).json({ message: e.message }) }
}

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...parseDates(req.body), gangId: req.gangId ?? req.body.gangId ?? null }
    res.status(201).json(await EventService.createEvent(data, req.user!.userId))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
}

export const update = async (req: AuthRequest, res: Response) => { try { res.json(await EventService.updateEvent(req.params.id, parseDates(req.body))) } catch (e: any) { res.status(400).json({ message: e.message }) } }
export const remove = async (req: AuthRequest, res: Response) => { try { res.json(await EventService.deleteEvent(req.params.id)) } catch (e: any) { res.status(400).json({ message: e.message }) } }

export const assignHost = async (req: AuthRequest, res: Response) => {
  try {
    const reg = await prisma.registration.findUnique({
      where: { eventId_userId: { eventId: req.params.id, userId: req.user!.userId } }
    })
    if (!reg || reg.status !== 'CONFIRMED')
      return res.status(403).json({ message: 'Only confirmed attendees can become host' })
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data:  { hostId: req.user!.userId }
    })
    res.json(event)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}
