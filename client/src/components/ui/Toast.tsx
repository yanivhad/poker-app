import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  const colors: Record<string, string> = {
    success: '#16a34a',
    error:   '#ef4444',
    info:    '#3b82f6',
  }

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: colors[type], color: 'white', padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem', fontWeight: 500, fontSize: '0.875rem',
      zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  )
}