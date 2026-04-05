import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import * as RegistrationService from '../services/registration.service'
export const registerForEvent    = async (req: AuthRequest, res: Response) => { try { res.status(201).json(await RegistrationService.register(req.params.id, req.user!.userId)) } catch (e: any) { res.status(400).json({ message: e.message }) } }
export const cancelRegistration  = async (req: AuthRequest, res: Response) => { try { res.json(await RegistrationService.cancel(req.params.id, req.user!.userId)) } catch (e: any) { res.status(400).json({ message: e.message }) } }
export const listRegistrations   = async (req: AuthRequest, res: Response) => { try { res.json(await RegistrationService.getRegistrations(req.params.id)) } catch (e: any) { res.status(500).json({ message: e.message }) } }
