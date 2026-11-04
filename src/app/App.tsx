/**
 * Phase 0 shell. It renders only what exists: the product name and an honest
 * status line. The editor (library, stage, inspector) arrives in Phase 1.
 */
export function App() {
  return (
    <main className="shell">
      <h1 className="shell__title">AI UI Sandbox</h1>
      <p className="shell__status">Foundation build. The component editor arrives in Phase 1.</p>
    </main>
  );
}
