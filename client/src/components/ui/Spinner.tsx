export default function Spinner() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #374151',
          borderTopColor: '#16a34a',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }