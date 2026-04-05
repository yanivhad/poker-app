import dotenv from 'dotenv'
dotenv.config()
export const ENV = {
  PORT:               process.env.PORT || 3001,
  JWT_SECRET:         process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  CLIENT_URL:         process.env.CLIENT_URL || 'http://localhost:5173',
  WHATSAPP_TOKEN:     process.env.WHATSAPP_TOKEN || '',
  WHATSAPP_PHONE_ID:  process.env.WHATSAPP_PHONE_ID || '',
  NODE_ENV:           process.env.NODE_ENV || 'development',
}
