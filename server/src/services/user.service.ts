import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { GameType, DayOfWeek } from '@prisma/client'
const userSelect = { id: true, fullName: true, nickname: true, phone: true, role: true, isActive: true, favoriteGames: true, preferredDays: true, createdAt: true }
export const getAllUsers  = (includeInactive = false) => prisma.user.findMany({ where: includeInactive ? {} : { isActive: true }, select: userSelect, orderBy: { nickname: 'asc' } })
export const getUserById  = (id: string) => prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect })
export const updateUser   = (id: string, data: { fullName?: string; nickname?: string; favoriteGames?: GameType[]; preferredDays?: DayOfWeek[] }) => prisma.user.update({ where: { id }, data })
export const setUserActive= (id: string, isActive: boolean) => prisma.user.update({ where: { id }, data: { isActive } })
export const createUser   = async (data: { fullName: string; nickname: string; phone: string; role?: 'ADMIN' | 'PLAYER'; password?: string }) => {
  const { password, ...rest } = data
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined
  return prisma.user.create({ data: { ...rest, ...(passwordHash && { passwordHash }) } })
}
export const setPassword  = async (id: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
}
export const changeOwnPassword = async (id: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id } })
  if (!user.passwordHash) throw new Error('No password set on this account')
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw new Error('Current password is incorrect')
  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
}
