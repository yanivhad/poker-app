export function waLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function shareEventOpen(event: any) {
  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  const confirmed = (event.registrations ?? []).filter((r: any) => r.status === 'CONFIRMED')
  const playerNames: string[] = confirmed.map((r: any) => r.user?.nickname ?? 'Guest')

  const lines = [
    '🃏 *Poker Night*',
    `📅 ${dateStr} | ${timeStr}`,
    `📍 ${event.format === 'ONLINE' ? 'Online' : 'In Person'}`,
    `👥 ${confirmed.length}/${event.maxSeats} registered`,
  ]

  if (playerNames.length > 0) {
    lines.push('')
    lines.push('*Players:*')
    playerNames.forEach(name => lines.push(`• ${name}`))
  }

  lines.push('')
  lines.push('👉 Open the app to register!')

  return waLink(lines.join('\n'))
}

export function shareResults(event: any, results: any[]) {
  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
  const sorted = [...results].sort((a, b) => b.netNIS - a.netNIS)

  const lines = [
    `🃏 *Poker Night — ${dateStr}*`,
    `👥 ${sorted.length} players`,
    '',
    ...sorted.map((r: any, i: number) => {
      const name   = r.user?.nickname ?? r.guest?.name ?? 'Guest'
      const net    = r.netNIS
      const emoji  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : net > 0 ? '✅' : net === 0 ? '➖' : '❌'
      const buyIns = r.buyIn?.count ?? 1
      return `${emoji} *${name}* ${net >= 0 ? '+' : ''}${net.toFixed(0)}₪ (${buyIns}x)`
    }),
  ]

  return waLink(lines.join('\n'))
}

export function shareSettlement(settlements: any[]) {
  const players = Array.from(
    new Set(
      settlements.flatMap((s: any) => [
        s.fromUser?.nickname ?? s.fromGuestName,
        s.toUser?.nickname   ?? s.toGuestName,
      ]).filter(Boolean)
    )
  )

  const lines = [
    '💸 *Settlement*',
    `👥 ${players.join(', ')}`,
    '',
    ...settlements.map((s: any) => {
      const from = s.fromUser?.nickname ?? s.fromGuestName ?? 'Guest'
      const to   = s.toUser?.nickname   ?? s.toGuestName   ?? 'Guest'
      return `• *${from}* → *${to}*: ${s.amountNIS}₪`
    }),
  ]

  return waLink(lines.join('\n'))
}