declare const __APP_VERSION__: string

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '4rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Optionality</h1>
      <p style={{ color: '#666', marginTop: '0.5rem' }}>
        AI-judged options trading drill. Scaffold v{__APP_VERSION__}.
      </p>
      <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '2rem' }}>
        The full UI lands when the canonical artifact is ported into <code>src/components/Optionality.tsx</code>.
      </p>
    </main>
  )
}
