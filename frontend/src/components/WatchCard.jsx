const card = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "16px", display: "flex", flexDirection: "column", gap: "8px",
};

const statutBadge = (statut) => ({
  display: "inline-block",
  background: statut === "en_stock" ? "#4ade8020" : "#88888820",
  color: statut === "en_stock" ? "#4ade80" : "#888",
  fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px",
  fontWeight: "700", textTransform: "uppercase",
});

const actions = { display: "flex", gap: "8px", marginTop: "4px" };

const btn = (variant) => ({
  background: "none", border: `1px solid ${variant === "danger" ? "#ef444440" : "#2a2a2a"}`,
  color: variant === "danger" ? "#ef4444" : "#888", borderRadius: "4px",
  padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer",
});

export default function WatchCard({ montre, onEdit, onDelete }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{montre.nom}</div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginTop: "2px" }}>{montre.marque}</div>
        </div>
        <span style={statutBadge(montre.statut)}>
          {montre.statut === "en_stock" ? "En stock" : "Vendu"}
        </span>
      </div>
      {montre.reference && (
        <div style={{ color: "#666", fontSize: "0.8rem" }}>Réf. {montre.reference}</div>
      )}
      <div style={{ display: "flex", gap: "16px" }}>
        <div>
          <span style={{ color: "#888", fontSize: "0.75rem" }}>Achat </span>
          <span style={{ fontWeight: "600", color: "#d4af37" }}>{montre.prix_achat?.toLocaleString("fr-FR")} €</span>
        </div>
        <div>
          <span style={{ color: "#888", fontSize: "0.75rem" }}>État </span>
          <span style={{ fontSize: "0.85rem" }}>{montre.etat}</span>
        </div>
      </div>
      {montre.notes && (
        <div style={{ color: "#666", fontSize: "0.8rem", fontStyle: "italic" }}>{montre.notes}</div>
      )}
      <div style={actions}>
        <button style={btn()} onClick={() => onEdit(montre)}>Modifier</button>
        <button style={btn("danger")} onClick={() => onDelete(montre.id)}>Supprimer</button>
      </div>
    </div>
  );
}
