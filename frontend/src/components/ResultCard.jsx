const card = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "16px", display: "flex", flexDirection: "column", gap: "8px",
};

const sourceBadge = (source) => ({
  display: "inline-block",
  background: source === "leboncoin" ? "#f97316" + "20" : source === "vinted" ? "#a855f7" + "20" : "#3b82f6" + "20",
  color: source === "leboncoin" ? "#f97316" : source === "vinted" ? "#a855f7" : "#3b82f6",
  fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px",
  fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em",
});

const flagBadge = {
  display: "inline-block", background: "#4ade8020", color: "#4ade80",
  fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px",
  fontWeight: "700", marginLeft: "6px",
};

export default function ResultCard({ result }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={sourceBadge(result.source)}>{result.source}</span>
        {result.flag_sous_evalue && <span style={flagBadge}>Sous-évaluée</span>}
      </div>
      <a href={result.url} target="_blank" rel="noopener noreferrer"
        style={{ color: "#e5e5e5", fontWeight: "500", fontSize: "0.9rem", textDecoration: "none", lineHeight: "1.4" }}>
        {result.titre}
      </a>
      <div style={{ color: "#d4af37", fontWeight: "700", fontSize: "1.1rem" }}>
        {result.prix?.toLocaleString("fr-FR")} €
      </div>
    </div>
  );
}
