import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function LoginPage() {
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')
  const [step, setStep]       = useState<'phone' | 'otp'>('phone')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { requestOtp, verifyOtp } = useAuthStore()
  const navigate = useNavigate()

  const handleRequestOtp = async () => {
    setError('')
    setLoading(true)
    try {
      await requestOtp(phone)
      setStep('otp')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setLoading(true)
    try {
      await verifyOtp(phone, otp)
      navigate('/')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-2">🃏</div>
          <h1 className="text-2xl font-bold text-brand">Poker App</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in with your phone number</p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone number</label>
              <input
                className="input"
                type="tel"
                placeholder="+972500000000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRequestOtp()}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              className="btn-primary w-full"
              onClick={handleRequestOtp}
              disabled={loading || !phone}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Enter OTP sent to {phone}</label>
              <input
                className="input text-center text-2xl tracking-widest"
                type="text"
                maxLength={6}
                placeholder="······"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              className="btn-primary w-full"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              className="text-gray-400 text-sm w-full text-center hover:text-white"
              onClick={() => { setStep('phone'); setOtp(''); setError('') }}
            >
              ← Change number
            </button>
          </div>
        )}
      </div>
    </div>
  )
}