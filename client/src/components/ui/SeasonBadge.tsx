export default function SeasonBadge({ season }: { season?: string | null }) {
  if (!season) return null
  return (
    <span style={{
      display: 'inline-block', fontSize: '0.7rem', padding: '1px 8px', borderRadius: 99,
      fontWeight: 600, background: '#1e3a8a33', color: '#93c5fd', border: '1px solid #1e40af66',
      whiteSpace: 'nowrap',
    }}>
      🗓️ Season {season}
    </span>
  )
}
