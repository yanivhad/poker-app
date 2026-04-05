import { PrismaClient, Role, CaseType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { phone: '+972500000000' },
    update: {},
    create: {
      fullName:      'Admin User',
      nickname:      'Boss',
      phone:         '+972500000000',
      role:          Role.ADMIN,
      isActive:      true,
      favoriteGames: ['TEXAS_HOLDEM'],
      preferredDays: ['THU', 'FRI'],
    }
  })

  const players = await Promise.all([
    { fullName: 'Yossi Cohen', nickname: 'Yossi', phone: '+972501111111' },
    { fullName: 'Dana Levi',   nickname: 'Dana',  phone: '+972502222222' },
    { fullName: 'Avi Mizrahi', nickname: 'Avi',   phone: '+972503333333' },
  ].map(p => prisma.user.upsert({
    where:  { phone: p.phone },
    update: {},
    create: {
      ...p,
      role:          Role.PLAYER,
      isActive:      true,
      favoriteGames: ['TEXAS_HOLDEM', 'OMAHA'],
      preferredDays: ['THU'],
    }
  })))


  await prisma.pokerCase.createMany({
    skipDuplicates: true,
    data: [
      { label: 'Regular (Primary)', type: CaseType.PRIMARY,   heldByUserId: admin.id },
      { label: 'Big one',            type: CaseType.SECONDARY, heldByUserId: players[0].id },
      { label: 'Gray Kit',          type: CaseType.SECONDARY, heldByUserId: players[1].id },
    ]
  })

  console.log('✅ Seed complete')
  console.log(`   Admin: ${admin.nickname} (${admin.phone})`)
  console.log(`   Players: ${players.map(p => p.nickname).join(', ')}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())