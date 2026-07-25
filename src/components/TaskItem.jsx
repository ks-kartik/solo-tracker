import { useGame } from '../context/GameContext';

function formatMeta(task) {
  if (task.type === 'daily') {
    if (task.status === 'done') return 'Daily · completed';
    if (task.status === 'failed') return 'Daily · missed';
    return task.deadlineTime ? `Daily · deadline ${task.deadlineTime}` : 'Daily';
  }
  if (task.isPenaltyQuest) return 'Penalty quest';
  if (task.penaltyEnabled) return `One-time · penalty: ${task.penaltyQuest?.title || 'set'}`;
  return 'One-time quest';
}

export default function TaskItem({ task }) {
  const { completeTask, stats } = useGame();
  const done = task.status === 'done';
  const failed = task.status === 'failed';

  const totalXp = task.linkedStats.reduce((sum, l) => sum + l.xpValue, 0);
  const primaryStat = stats.find((s) => s.id === task.linkedStats[0]?.statId);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <button
        onClick={() => !done && completeTask(task.id)}
        aria-label={done ? 'Task completed' : 'Mark task complete'}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `1.5px solid ${done ? 'var(--cyan)' : 'var(--blue-light)'}`,
          background: done ? 'var(--cyan)' : 'transparent',
          boxShadow: done ? '0 0 8px rgba(34,211,238,0.6)' : 'none',
          flexShrink: 0,
          padding: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: done ? 'var(--muted)' : 'var(--text)',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: failed || task.penaltyEnabled ? 'var(--red)' : 'var(--muted)',
            fontFamily: 'var(--font-heading)',
            marginTop: 2,
          }}
        >
          {formatMeta(task)}
        </div>
      </div>
      {!done && !failed && (
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 600, color: 'var(--cyan)', flexShrink: 0 }}>
          +{totalXp} {primaryStat ? primaryStat.name.slice(0, 3).toUpperCase() : 'XP'}
        </div>
      )}
    </div>
  );
}
