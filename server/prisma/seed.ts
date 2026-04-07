import { PrismaClient, Role, CaseType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hash(password: string) {
  return bcrypt.hash(password, 10)
}

async function main() {
  const admin = await prisma.user.upsert({
    where:  { phone: '+972504078908' },
    update: { passwordHash: await hash('poker123') },
    create: {
      fullName:      'Yaniv Hadad',
      nickname:      'Ref',
      phone:         '+972504078908',
      passwordHash:  await hash('poker123'),
      role:          Role.ADMIN,
      isActive:      true,
      favoriteGames: ['TEXAS_HOLDEM'],
      preferredDays: ['THU', 'SAT'],
    }
  })

  const players = await Promise.all([
    { fullName: 'Oren Reiss',       nickname: 'The Raise',    phone: '+972525394384', password: 'poker123' },
    { fullName: 'Aviv Feffer',      nickname: 'CEO',          phone: '+972523229855', password: 'poker123' },
    { fullName: 'Shaul Tsur',       nickname: 'The Cat',      phone: '+972549980323', password: 'poker123' },
    { fullName: 'Assaf ',           nickname: 'Is loading',   phone: '+972507759929', password: 'poker123' },
    { fullName: 'Aviv Brin',        nickname: 'Brino',        phone: '+972545596662', password: 'poker123' },
    { fullName: 'Efi Barazani',     nickname: 'Barazani',     phone: '+972525869996', password: 'poker123' },
    { fullName: 'Hezi  Shawrtz',    nickname: 'Mojtaba',      phone: '+972549997510', password: 'poker123' },
    { fullName: 'Oded Shapira',     nickname: 'Odedi',        phone: '+972525867056', password: 'poker123' },
    { fullName: 'Ronen Zilberman',  nickname: 'Roneni',       phone: '+972546090379', password: 'poker123' },
    { fullName: 'Tomer',            nickname: 'OMAHA LAKRAN', phone: '+972545204299', password: 'poker123' },
    { fullName: 'Uri Kaftori',      nickname: 'The pilot',    phone: '+972546654798', password: 'poker123' },
  ].map(async ({ password, ...p }) => prisma.user.upsert({
    where:  { phone: p.phone },
    update: { passwordHash: await hash(password) },
    create: {
      ...p,
      passwordHash:  await hash(password),
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