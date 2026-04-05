const store = new Map<string, { otp: string; expiresAt: number }>()
export const setOtp = (phone: string, otp: string) =>
  store.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 })
export const verifyOtp = (phone: string, otp: string): boolean => {
  const entry = store.get(phone)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) { store.delete(phone); return false }
  if (entry.otp !== otp) return false
  store.delete(phone)
  return true
}
