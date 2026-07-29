export default function StatusToggle({ isActive, onToggle, loading = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={isActive ? 'Click to deactivate' : 'Click to activate'}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        background: isActive ? '#16a34a' : '#ef4444',
        transition: 'background 0.2s ease',
        opacity: loading ? 0.6 : 1,
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: isActive ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading && (
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '2px solid #94a3b8',
              borderTopColor: 'transparent',
              animation: 'spin 0.6s linear infinite',
              display: 'block',
            }}
          />
        )}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
