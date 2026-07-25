const tabs = [
  { id: 'dashboard', label: 'Home', icon: 'ti-home' },
  { id: 'tasks', label: 'Quests', icon: 'ti-sword' },
  { id: 'settings', label: 'Settings', icon: 'ti-settings' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--panel)',
        borderTop: '1px solid var(--panel-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0 calc(10px + env(safe-area-inset-bottom))',
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: isActive ? 'var(--blue-light)' : 'var(--muted)',
              textShadow: isActive ? '0 0 8px rgba(96,165,250,0.5)' : 'none',
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ fontSize: 20 }} aria-hidden="true" />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
