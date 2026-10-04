export default function CarregandoHub() {
  return (
    <main aria-busy="true">
      <p role="status" className="hub-eyebrow mb-6">Abrindo…</p>
      <div aria-hidden="true" className="hub-loading">
        <div className="hub-loading-title" />
        <div className="hub-loading-text" />
        <div className="hub-loading-grid">
          {[0, 1, 2].map((i) => <div className="hub-loading-card" key={i} />)}
        </div>
      </div>
    </main>
  );
}
