const bar = {
  display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap",
};

const card = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "16px 24px", flex: "1", minWidth: "160px",
};

const label = { fontSize: "0.75rem", color: "#888", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" };
const value = { fontSize: "1.4rem", fontWeight: "700", color: "#e5e5e5" };
const positive = { ...value, color: "#4ade80" };
const neutral = { ...value, color: "#d4af37" };

function fmt(n) { return n?.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €"; }

export default function StatBar({ summary }) {
  if (!summary) return null;
  return (
    <div style={bar}>
      <div style={card}>
        <div style={label}>Flips réalisés</div>
        <div style={neutral}>{summary.nb_flips}</div>
      </div>
      <div style={card}>
        <div style={label}>Total investi</div>
        <div style={value}>{fmt(summary.total_investi)}</div>
      </div>
      <div style={card}>
        <div style={label}>Total dégagé</div>
        <div style={value}>{fmt(summary.total_degage)}</div>
      </div>
      <div style={card}>
        <div style={label}>Marge nette moy.</div>
        <div style={summary.marge_moyenne >= 0 ? positive : { ...value, color: "#f87171" }}>
          {fmt(summary.marge_moyenne)}
        </div>
      </div>
    </div>
  );
}
