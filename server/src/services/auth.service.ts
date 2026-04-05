import { prisma } from '../lib/prisma'
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt'
import { setOtp, verifyOtp } from '../utils/otpStore'
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()
export const requestOtp = async (phone: string) => {
  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) throw new Error('Phone number not registered')
  const otp = generateOtp()
  setOtp(phone, otp)
  console.log(`OTP for ${phone}: ${otp}`)
  return { message: 'OTP sent' }
}
export const verifyOtpAndLogin = async (phone: string, otp: string) => {
  if (!verifyOtp(phone, otp)) throw new Error('Invalid or expired OTP')
  const user = await prisma.user.findUniqueOrThrow({ where: { phone } })
  return {
    accessToken:  signAccess(user.id, user.role),
    refreshToken: signRefresh(user.id),
    user: { id: user.id, nickname: user.nickname, role: user.role }
  }
}
export const refreshTokens = async (token: string) => {
  const { userId } = verifyRefresh(token)
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return { accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
}
