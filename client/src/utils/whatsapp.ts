export function waLink(text: string) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }
  
  export function shareEventOpen(event: any) {
    const date = new Date(event.date)
    const dateStr = date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    const text = [
      '🃏 *Poker Night*',
      `📅 ${dateStr} בשעה ${timeStr}`,
      `📍 ${event.format === 'ONLINE' ? 'Online 💻' : 'In Person 🏠'}`,
      `👥 ${event.registrations?.filter((r: any) => r.status === 'CONFIRMED').length ?? 0}/${event.maxSeats} players registered`,
      '',
      '👉 Open the app to register!',
    ].join('\n')
    return waLink(text)
  }
  
  export function shareResults(event: any, results: any[]) {
    const date = new Date(event.date)
    const dateStr = date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
    const sorted = [...results].sort((a, b) => b.netNIS - a.netNIS)
    const lines = [
      `🃏 *Poker Night Results — ${dateStr}*`,
      '',
      ...sorted.map((r: any, i: number) => {
        const name   = r.user?.nickname ?? r.guest?.name ?? 'Guest'
        const net    = r.netNIS
        const emoji  = i === 0 ? '🥇' : net > 0 ? '✅' : net === 0 ? '➖' : '❌'
        const buyIns = r.buyIn?.count ?? 1
        return `${emoji} *${name}* — ${net >= 0 ? '+' : ''}${net.toFixed(0)}₪ (${buyIns} buy-in${buyIns > 1 ? 's' : ''})`
      }),
    ]
    return waLink(lines.join('\n'))
  }
  
  export function shareSettlement(settlements: any[]) {
    const lines = [
      '💸 *Settlement*',
      '',
      ...settlements.map((s: any) => {
        const from = s.fromUser?.nickname ?? s.fromGuestName ?? 'Guest'
        const to   = s.toUser?.nickname   ?? s.toGuestName   ?? 'Guest'
        return `${from} → ${to}: *${s.amountNIS}₪*`
      }),
    ]
    return waLink(lines.join('\n'))
  }