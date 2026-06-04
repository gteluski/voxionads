export function AppFooter() {
  return (
    <footer
      className="flex items-center justify-end px-6"
      style={{
        height: '48px',
        background: 'var(--color-bg-dark)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-tiny)',
          color: 'var(--color-accent-dim)',
          letterSpacing: '0.03em',
        }}
      >
        Powered by{' '}
        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Voxion Studio</span>
        {' '}· {new Date().getFullYear()}
      </span>
    </footer>
  );
}
