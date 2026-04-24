const panel = {
  background: "#161b22", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "20px", marginBottom: "24px",
};

const sectionTitle = {
  fontSize: "0.75rem", color: "#d4af37", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: "12px", fontWeight: "600",
};

const statRow = { display: "flex", gap: "32px", marginBottom: "16px" };

const statItem = { display: "flex", flexDirection: "column", gap: "4px" };

const statLabel = { fontSize: "0.7rem", color: "#888", textTransform: "uppercase" };

const statVal = { fontSize: "1.1rem", fontWeight: "600", color: "#e5e5e5" };

const pickCard = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px",
  padding: "12px", marginBottom: "8px",
};

const badgeStyle = {
  display: "inline-block", background: "#d4af3720", color: "#d4af37",
  fontSize: "0.7rem", padding: "2px 8px", borderRadius: "4px",
  fontWeight: "600", marginRight: "8px",
};

export default function MistralPanel({ analyse }) {
  if (!analyse || analyse.nb_analyses === 0) return null;
  return (
    <div style={panel}>
      <div style={sectionTitle}>Analyse Mistral</div>
      <div style={statRow}>
        <div style={statItem}>
          <span style={statLabel}>Prix médian</span>
          <span style={statVal}>{analyse.prix_median?.toLocaleString("fr-FR")} €</span>
        </div>
        <div style={statItem}>
          <span style={statLabel}>Prix moyen</span>
          <span style={statVal}>{analyse.prix_moyen?.toLocaleString("fr-FR")} €</span>
        </div>
        <div style={statItem}>
          <span style={statLabel}>Annonces analysées</span>
          <span style={statVal}>{analyse.nb_analyses}</span>
        </div>
      </div>

      {analyse.recommandation && (
        <p style={{ color: "#ccc", fontSize: "0.875rem", lineHeight: "1.6", marginBottom: "16px" }}>
          {analyse.recommandation}
        </p>
      )}

      {analyse.top_sous_evaluees?.length > 0 && (
        <>
          <div style={{ ...sectionTitle, marginTop: "4px" }}>Top opportunités</div>
          {analyse.top_sous_evaluees.map((pick, i) => (
            <div key={i} style={pickCard}>
              <div style={{ marginBottom: "4px" }}>
                <span style={badgeStyle}>Sous-évaluée</span>
                <a href={pick.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: "#e5e5e5", fontWeight: "500", fontSize: "0.875rem" }}>
                  {pick.titre}
                </a>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <span style={{ color: "#4ade80", fontWeight: "700" }}>{pick.prix?.toLocaleString("fr-FR")} €</span>
                {pick.raison && <span style={{ color: "#888", fontSize: "0.8rem" }}>{pick.raison}</span>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
