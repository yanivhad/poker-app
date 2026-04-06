import { PrismaClient, Role, CaseType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const DEFAULT_PASSWORD = 'poker123' // change after first login

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  const admin = await prisma.user.upsert({
    where:  { phone: '+972504078908' },
    update: { passwordHash },
    create: {
      fullName:      'Yaniv Hadad',
      nickname:      'Ref',
      phone:         '+972504078908',
      passwordHash,
      role:          Role.ADMIN,
      isActive:      true,
      favoriteGames: ['TEXAS_HOLDEM'],
      preferredDays: ['THU', 'SAT'],
    }
  })

  const players = await Promise.all([
    { fullName: 'Oren Reiss',       nickname: 'The Raise',   phone: '+972525394384' },
    { fullName: 'Aviv Feffer',      nickname: 'CEO',         phone: '+972523229855' },
    { fullName: 'Shaul Tsur',       nickname: 'The Cat',     phone: '+972549980323' },
    { fullName: 'Assaf ',           nickname: 'Is loading',  phone: '+972507759929' },
    { fullName: 'Aviv Brin',        nickname: 'Brino',       phone: '+972545596662' },
    { fullName: 'Efi Barazani',     nickname: 'Barazani',    phone: '+972525869996' },
    { fullName: 'Hezi  Shawrtz',    nickname: 'Mojtaba',     phone: '+972549997510' },
    { fullName: 'Oded Shapira',     nickname: 'Odedi',       phone: '+972525867056' },
    { fullName: 'Ronen Zilberman',  nickname: 'Roneni',      phone: '+972546090379' },
    { fullName: 'Tomer',            nickname: 'OMAHA LAKRAN',phone: '+972545204299' },
    { fullName: 'Uri Kaftori',      nickname: 'The pilot',   phone: '+972546654798' },
  ].map(p => prisma.user.upsert({
    where:  { phone: p.phone },
    update: { passwordHash },
    create: {
      ...p,
      passwordHash,
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
  console.log(`   Default password: "${DEFAULT_PASSWORD}" — remind users to change it`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())