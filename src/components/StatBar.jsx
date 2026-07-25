import { levelFromXp } from '../lib/gameLogic';

export default function StatBar({ stat }) {
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(stat.xp);
  const percent = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: `${stat.color}1A`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className={`ti ${stat.icon}`} style={{ fontSize: 14, color: stat.color }} aria-hidden="true" />
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, width: 70, flexShrink: 0 }}>
        {stat.name}
      </div>
      <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: stat.color,
            borderRadius: 5,
            boxShadow: `0 0 6px ${stat.color}99`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--muted)', width: 26, textAlign: 'right', flexShrink: 0 }}>
        {level}
      </div>
    </div>
  );
}
