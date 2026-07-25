import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function LevelUpModal() {
  const { levelUpQueue, dismissLevelUp } = useGame();
  const event = levelUpQueue[0];

  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(dismissLevelUp, 2400);
    return () => clearTimeout(timer);
  }, [event, dismissLevelUp]);

  if (!event) return null;

  const isOverall = event.type === 'overall';
  const glowColor = isOverall ? '#60A5FA' : event.color || '#60A5FA';

  return (
    <div
      onClick={dismissLevelUp}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,14,26,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'lu-fade-in 0.25s ease',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          animation: 'lu-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 13,
            letterSpacing: 4,
            color: 'var(--muted)',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          {isOverall ? 'Rank up incoming' : `${event.name} increased`}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 42,
            color: glowColor,
            textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}66`,
          }}
        >
          LEVEL UP
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--text)',
            marginTop: 10,
          }}
        >
          {isOverall ? `Overall Lv. ${event.level}` : `Lv. ${event.level}`}
        </div>
      </div>

      <style>{`
        @keyframes lu-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lu-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
