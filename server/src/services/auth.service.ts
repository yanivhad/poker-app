import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt'

export const login = async (nickname: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { nickname } })
  if (!user) throw new Error('Invalid credentials')
  if (!user.passwordHash) throw new Error('Password not set for this account — contact an admin')
  if (!user.isActive) throw new Error('Account is inactive')
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')

  const memberships = await prisma.gangMember.findMany({
    where:   { userId: user.id, status: 'APPROVED' },
    include: { gang: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const gangs = memberships.map(m => ({ id: m.gang.id, name: m.gang.name, role: m.role }))

  return {
    accessToken:  signAccess(user.id, user.role),
    refreshToken: signRefresh(user.id),
    user:  { id: user.id, nickname: user.nickname, role: user.role },
    gangs,
  }
}

export const refreshTokens = async (token: string) => {
  const { userId } = verifyRefresh(token)
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return { accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
}