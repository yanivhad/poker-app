import { prisma } from '../lib/prisma'

const gangInclude = {
  members: {
    include: { user: { select: { id: true, nickname: true, fullName: true } } },
    orderBy: { createdAt: 'asc' as const },
  }
}

export const getAllGangs = () =>
  prisma.gang.findMany({ orderBy: { name: 'asc' }, include: gangInclude })

export const getUserGangs = (userId: string) =>
  prisma.gangMember.findMany({
    where:   { userId, status: 'APPROVED' },
    include: { gang: true },
    orderBy: { createdAt: 'asc' },
  })

export const getGangById = (id: string) =>
  prisma.gang.findUniqueOrThrow({ where: { id }, include: gangInclude })

export const createGang = (name: string) =>
  prisma.gang.create({ data: { name } })

export const updateGang = (id: string, name: string) =>
  prisma.gang.update({ where: { id }, data: { name } })

export const deleteGang = (id: string) =>
  prisma.gang.delete({ where: { id } })

export const getGangMembers = (gangId: string) =>
  prisma.gangMember.findMany({
    where:   { gangId },
    include: { user: { select: { id: true, nickname: true, fullName: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  })

export const requestJoin = async (gangId: string, userId: string) => {
  const existing = await prisma.gangMember.findUnique({
    where: { gangId_userId: { gangId, userId } }
  })
  if (existing) {
    if (existing.status === 'APPROVED') throw new Error('Already a member')
    if (existing.status === 'PENDING')  throw new Error('Request already pending')
    // REJECTED → re-request
    return prisma.gangMember.update({
      where: { gangId_userId: { gangId, userId } },
      data:  { status: 'PENDING' },
    })
  }
  return prisma.gangMember.create({ data: { gangId, userId } })
}

export const updateMember = (gangId: string, userId: string, data: { role?: 'ADMIN' | 'MEMBER'; status?: 'APPROVED' | 'REJECTED' }) =>
  prisma.gangMember.update({ where: { gangId_userId: { gangId, userId } }, data })

export const removeMember = (gangId: string, userId: string) =>
  prisma.gangMember.delete({ where: { gangId_userId: { gangId, userId } } })
