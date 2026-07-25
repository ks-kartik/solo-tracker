export default function ScreenContainer({ children }) {
  return (
    <div
      style={{
        maxWidth: 420,
        margin: '0 auto',
        padding: '16px 16px 90px',
        paddingTop: 'max(24px, calc(env(safe-area-inset-top) + 12px))',
      }}
    >
      {children}
    </div>
  );
}
