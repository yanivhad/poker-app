import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt'

export const login = async (phone: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) throw new Error('Invalid credentials')
  if (!user.passwordHash) throw new Error('Password not set for this account — contact an admin')
  if (!user.isActive) throw new Error('Account is inactive')
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')
  return {
    accessToken:  signAccess(user.id, user.role),
    refreshToken: signRefresh(user.id),
    user: { id: user.id, nickname: user.nickname, role: user.role },
  }
}

export const refreshTokens = async (token: string) => {
  const { userId } = verifyRefresh(token)
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return { accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
}
