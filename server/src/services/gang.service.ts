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

export const updateGang = (id: string, data: { name?: string; whatsappLink?: string | null }) =>
  prisma.gang.update({ where: { id }, data })

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

  const [user, gang] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true, nickname: true } }),
    prisma.gang.findUniqueOrThrow({ where: { id: gangId }, select: { whatsappLink: true, name: true } }),
  ])
  const isGlobalAdmin = user.role === 'ADMIN' || user.role === 'MASTER'
  const autoApprove   = isGlobalAdmin

  let member
  if (existing) {
    if (existing.status === 'APPROVED') throw new Error('Already a member')
    if (existing.status === 'PENDING' && !autoApprove) throw new Error('Request already pending')
    member = await prisma.gangMember.update({
      where: { gangId_userId: { gangId, userId } },
      data:  { status: autoApprove ? 'APPROVED' : 'PENDING', role: autoApprove ? 'ADMIN' : existing.role },
    })
  } else {
    member = await prisma.gangMember.create({
      data: { gangId, userId, status: autoApprove ? 'APPROVED' : 'PENDING', role: autoApprove ? 'ADMIN' : 'MEMBER' }
    })
  }

  return { ...member, gangWhatsappLink: gang.whatsappLink, gangName: gang.name, nickname: user.nickname }
}

export const updateMember = (gangId: string, userId: string, data: { role?: 'ADMIN' | 'MEMBER'; status?: 'APPROVED' | 'REJECTED' }) =>
  prisma.gangMember.update({ where: { gangId_userId: { gangId, userId } }, data })

export const removeMember = (gangId: string, userId: string) =>
  prisma.gangMember.delete({ where: { gangId_userId: { gangId, userId } } })
