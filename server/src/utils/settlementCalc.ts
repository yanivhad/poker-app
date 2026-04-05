// Minimizes the number of transactions to settle all debts
export function calculateSettlements(balances: { id: string; name: string; netNIS: number }[]) {
  const creditors = balances.filter(b => b.netNIS > 0).sort((a, b) => b.netNIS - a.netNIS)
  const debtors   = balances.filter(b => b.netNIS < 0).sort((a, b) => a.netNIS - b.netNIS)

  const transactions: { from: string; fromName: string; to: string; toName: string; amount: number }[] = []

  let i = 0, j = 0
  const cred = creditors.map(c => ({ ...c, remaining: c.netNIS }))
  const debt = debtors.map(d => ({ ...d, remaining: Math.abs(d.netNIS) }))

  while (i < debt.length && j < cred.length) {
    const amount = Math.min(debt[i].remaining, cred[j].remaining)
    if (amount > 0.01) {
      transactions.push({
        from:     debt[i].id,
        fromName: debt[i].name,
        to:       cred[j].id,
        toName:   cred[j].name,
        amount:   Math.round(amount),
      })
    }
    debt[i].remaining -= amount
    cred[j].remaining -= amount
    if (debt[i].remaining < 0.01) i++
    if (cred[j].remaining < 0.01) j++
  }

  return transactions
}