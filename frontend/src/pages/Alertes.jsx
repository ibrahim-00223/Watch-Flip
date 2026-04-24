import { useState, useEffect } from "react";
import { alertes as alertesApi, veille as veilleApi } from "../api.js";
import Modal from "../components/Modal.jsx";
import ResultCard from "../components/ResultCard.jsx";

const page = { padding: "32px 24px", maxWidth: "960px", margin: "0 auto" };
const topBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" };
const titleStyle = { fontSize: "1.25rem", fontWeight: "700" };

const btnPrimary = {
  background: "#d4af37", color: "#0f0f0f", border: "none", borderRadius: "6px",
  padding: "8px 18px", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer",
};

const card = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "16px 20px", marginBottom: "12px",
};

const cardHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" };

const sourceBadge = (src) => ({
  display: "inline-block",
  background: src === "leboncoin" ? "#f9731620" : src === "vinted" ? "#a855f720" : "#3b82f620",
  color: src === "leboncoin" ? "#f97316" : src === "vinted" ? "#a855f7" : "#3b82f6",
  fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px",
  fontWeight: "700", textTransform: "uppercase",
});

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" };
const labelStyle = { fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = {
  background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "6px",
  color: "#e5e5e5", padding: "8px 12px", fontSize: "0.875rem", outline: "none", width: "100%",
};

const togBtn = (active) => ({
  background: active ? "#4ade8020" : "#88888820",
  color: active ? "#4ade80" : "#888",
  border: "none", borderRadius: "4px", padding: "3px 10px",
  fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", textTransform: "uppercase",
});

const actionBtn = {
  background: "none", border: "1px solid #2a2a2a", color: "#888",
  borderRadius: "4px", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer",
};

const dangerBtn = { ...actionBtn, borderColor: "#ef444440", color: "#ef4444" };

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px", marginTop: "12px" };

const defaultForm = { keyword: "", source: "chrono24", prix_max: "" };

export default function Alertes() {
  const [alertes, setAlertes] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [resultats, setResultats] = useState({});
  const [running, setRunning] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await alertesApi.list();
    setAlertes(res.data);
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = async (id) => {
    if (expanded[id]) {
      setExpanded((p) => ({ ...p, [id]: false }));
      return;
    }
    setExpanded((p) => ({ ...p, [id]: true }));
    if (!resultats[id]) {
      const res = await veilleApi.resultats({ alerte_id: id, limit: 10 });
      setResultats((p) => ({ ...p, [id]: res.data }));
    }
  };

  const handleToggleActif = async (alerte) => {
    await alertesApi.update(alerte.id, { actif: !alerte.actif });
    load();
  };

  const handleRun = async (id) => {
    setRunning((p) => ({ ...p, [id]: true }));
    try {
      await alertesApi.run(id);
      const res = await veilleApi.resultats({ alerte_id: id, limit: 10 });
      setResultats((p) => ({ ...p, [id]: res.data }));
      setExpanded((p) => ({ ...p, [id]: true }));
      load();
    } finally {
      setRunning((p) => ({ ...p, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette alerte ?")) return;
    await alertesApi.delete(id);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await alertesApi.create({ ...form, prix_max: parseFloat(form.prix_max) });
      setModalOpen(false);
      setForm(defaultForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div style={page}>
      <div style={topBar}>
        <div style={titleStyle}>Alertes bonnes affaires</div>
        <button style={btnPrimary} onClick={() => setModalOpen(true)}>+ Créer une alerte</button>
      </div>

      {alertes.length === 0 && (
        <div style={{ color: "#555", textAlign: "center", marginTop: "48px", fontSize: "0.9rem" }}>
          Aucune alerte configurée.
        </div>
      )}

      {alertes.map((alerte) => (
        <div key={alerte.id} style={card}>
          <div style={cardHeader}>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontWeight: "600" }}>{alerte.keyword}</span>
                <span style={sourceBadge(alerte.source)}>{alerte.source}</span>
                <span style={{ color: "#888", fontSize: "0.8rem" }}>max {alerte.prix_max?.toLocaleString("fr-FR")} €</span>
              </div>
              {alerte.derniere_execution && (
                <div style={{ color: "#555", fontSize: "0.75rem" }}>
                  Dernière exécution : {new Date(alerte.derniere_execution).toLocaleString("fr-FR")}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button style={togBtn(alerte.actif)} onClick={() => handleToggleActif(alerte)}>
                {alerte.actif ? "Actif" : "Inactif"}
              </button>
              <button style={actionBtn} onClick={() => handleRun(alerte.id)} disabled={running[alerte.id]}>
                {running[alerte.id] ? "…" : "Lancer"}
              </button>
              <button style={actionBtn} onClick={() => toggleExpand(alerte.id)}>
                {expanded[alerte.id] ? "Masquer" : "Résultats"}
              </button>
              <button style={dangerBtn} onClick={() => handleDelete(alerte.id)}>Supprimer</button>
            </div>
          </div>

          {expanded[alerte.id] && (
            <div>
              {!resultats[alerte.id] || resultats[alerte.id].length === 0 ? (
                <div style={{ color: "#555", fontSize: "0.8rem" }}>Aucun résultat. Lancez un scraping.</div>
              ) : (
                <div style={grid}>
                  {resultats[alerte.id].map((r) => (
                    <ResultCard key={r.id} result={r} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {modalOpen && (
        <Modal title="Nouvelle alerte" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Mot-clé *</label>
              <input style={inputStyle} required placeholder="ex: omega speedmaster" {...f("keyword")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Source *</label>
              <select style={inputStyle} required {...f("source")}>
                <option value="leboncoin">LeBonCoin</option>
                <option value="vinted">Vinted</option>
                <option value="chrono24">Chrono24</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Prix max (€) *</label>
              <input style={inputStyle} type="number" required min="0" step="0.01" {...f("prix_max")} />
            </div>
            <button type="submit" style={{ ...btnPrimary, width: "100%", marginTop: "4px" }} disabled={saving}>
              {saving ? "Création…" : "Créer l'alerte"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
