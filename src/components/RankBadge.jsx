export default function RankBadge({ rank, size = 34 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(160deg, #A855F7, #3B82F6)',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size * 0.4,
        color: '#0A0E1A',
        boxShadow: '0 0 14px rgba(168,85,247,0.5)',
        flexShrink: 0,
      }}
    >
      {rank}
    </div>
  );
}
