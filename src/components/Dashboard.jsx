import { useGame } from '../context/GameContext';
import RankBadge from './RankBadge';
import StatBar from './StatBar';
import TaskItem from './TaskItem';

const panelStyle = {
  background: 'var(--panel)',
  border: '1px solid var(--panel-border)',
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
  boxShadow: '0 0 20px rgba(59,130,246,0.05), inset 0 0 30px rgba(59,130,246,0.03)',
};

export default function Dashboard() {
  const { loading, stats, tasks, overall, rank } = useGame();

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-heading)' }}>
        Loading the System…
      </div>
    );
  }

  const percent = Math.round((overall.xpIntoLevel / overall.xpForNextLevel) * 100);
  const todaysTasks = tasks.filter((t) => t.type === 'daily' || t.type === 'one-time');
  const longestStreak = Math.max(0, ...tasks.map((t) => t.streak?.longest || 0));
  const currentStreak = Math.max(0, ...tasks.filter((t) => t.type === 'daily').map((t) => t.streak?.current || 0));

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px 90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            letterSpacing: 2,
            color: 'var(--blue-light)',
            textShadow: '0 0 8px rgba(96,165,250,0.6)',
          }}
        >
          ◆ THE SYSTEM
        </span>
        <RankBadge rank={rank} />
      </div>

      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--blue-light)',
              textShadow: '0 0 10px rgba(96,165,250,0.5)',
            }}
          >
            LEVEL {overall.level}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-heading)' }}>
            {overall.xpIntoLevel} / {overall.xpForNextLevel} XP
          </span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(96,165,250,0.2)' }}>
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #3B82F6, #22D3EE)',
              boxShadow: '0 0 10px rgba(34,211,238,0.7)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      <div style={panelStyle}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Stats
        </div>
        {stats.map((stat) => (
          <StatBar key={stat.id} stat={stat} />
        ))}
      </div>

      <div style={panelStyle}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Today's quests
        </div>
        {todaysTasks.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No quests yet. Add one to begin.</div>
        )}
        {todaysTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <div style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-heading)' }}>CURRENT STREAK</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--violet)', textShadow: '0 0 10px rgba(168,85,247,0.5)' }}>
            {currentStreak} days
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-heading)' }}>LONGEST</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--cyan)', textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
            {longestStreak} days
          </div>
        </div>
      </div>
    </div>
  );
}
