import jwt from 'jsonwebtoken'
import { ENV } from '../config/env'

export const signAccess   = (userId: string, role: string) =>
  jwt.sign({ userId, role }, ENV.JWT_SECRET, { expiresIn: '7d' })  // extended to 7 days

export const signRefresh  = (userId: string) =>
  jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, { expiresIn: '30d' })

export const verifyAccess = (token: string) =>
  jwt.verify(token, ENV.JWT_SECRET) as { userId: string; role: string }

export const verifyRefresh = (token: string) =>
  jwt.verify(token, ENV.JWT_REFRESH_SECRET) as { userId: string }