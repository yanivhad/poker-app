import { prisma } from '../lib/prisma'
import { GameType, DayOfWeek } from '@prisma/client'
const userSelect = { id: true, fullName: true, nickname: true, phone: true, role: true, isActive: true, favoriteGames: true, preferredDays: true, createdAt: true }
export const getAllUsers  = (includeInactive = false) => prisma.user.findMany({ where: includeInactive ? {} : { isActive: true }, select: userSelect, orderBy: { nickname: 'asc' } })
export const getUserById  = (id: string) => prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect })
export const updateUser   = (id: string, data: { fullName?: string; nickname?: string; favoriteGames?: GameType[]; preferredDays?: DayOfWeek[] }) => prisma.user.update({ where: { id }, data })
export const setUserActive= (id: string, isActive: boolean) => prisma.user.update({ where: { id }, data: { isActive } })
export const createUser   = (data: { fullName: string; nickname: string; phone: string; role?: 'ADMIN' | 'PLAYER' }) => prisma.user.create({ data })
