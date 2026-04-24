import { useState, useEffect } from "react";
import { flips as flipsApi, collection as collectionApi } from "../api.js";
import StatBar from "../components/StatBar.jsx";
import Modal from "../components/Modal.jsx";

const page = { padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" };
const topBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" };
const titleStyle = { fontSize: "1.25rem", fontWeight: "700" };

const btnPrimary = {
  background: "#d4af37", color: "#0f0f0f", border: "none", borderRadius: "6px",
  padding: "8px 18px", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer",
};

const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "8px 12px", fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #2a2a2a" };
const td = { padding: "10px 12px", fontSize: "0.875rem", borderBottom: "1px solid #1a1a1a" };

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" };
const labelStyle = { fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = {
  background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "6px",
  color: "#e5e5e5", padding: "8px 12px", fontSize: "0.875rem", outline: "none", width: "100%",
};

const defaultForm = {
  montre_id: "", prix_achat: "", prix_vente: "", plateforme_achat: "",
  plateforme_vente: "", date_achat: "", date_vente: "", frais: "0",
};

const empty = { color: "#555", textAlign: "center", marginTop: "48px", fontSize: "0.9rem" };

export default function Flips() {
  const [data, setData] = useState({ flips: [], summary: null });
  const [montres, setMontres] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [flipsRes, collRes] = await Promise.all([flipsApi.list(), collectionApi.list()]);
    setData(flipsRes.data);
    setMontres(collRes.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await flipsApi.create({
        montre_id: parseInt(form.montre_id),
        prix_achat: parseFloat(form.prix_achat),
        prix_vente: parseFloat(form.prix_vente),
        plateforme_achat: form.plateforme_achat,
        plateforme_vente: form.plateforme_vente,
        date_achat: form.date_achat,
        date_vente: form.date_vente,
        frais: parseFloat(form.frais || 0),
      });
      setModalOpen(false);
      setForm(defaultForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce flip ?")) return;
    await flipsApi.delete(id);
    load();
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const getMontreName = (id) => {
    const m = montres.find((m) => m.id === id);
    return m ? `${m.marque} ${m.nom}` : `#${id}`;
  };

  return (
    <div style={page}>
      <div style={topBar}>
        <div style={titleStyle}>Flips</div>
        <button style={btnPrimary} onClick={() => setModalOpen(true)}>+ Créer un flip</button>
      </div>

      <StatBar summary={data.summary} />

      {data.flips.length === 0 ? (
        <div style={empty}>Aucun flip enregistré.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Montre</th>
                <th style={th}>Achat</th>
                <th style={th}>Vente</th>
                <th style={th}>Plateforme</th>
                <th style={th}>Frais</th>
                <th style={th}>M. brute</th>
                <th style={th}>M. nette</th>
                <th style={th}>Durée</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {data.flips.map((flip) => (
                <tr key={flip.id}>
                  <td style={td}>{getMontreName(flip.montre_id)}</td>
                  <td style={td}>{flip.prix_achat?.toLocaleString("fr-FR")} €</td>
                  <td style={td}>{flip.prix_vente?.toLocaleString("fr-FR")} €</td>
                  <td style={{ ...td, color: "#888", fontSize: "0.8rem" }}>
                    {flip.plateforme_achat} → {flip.plateforme_vente}
                  </td>
                  <td style={td}>{flip.frais} €</td>
                  <td style={{ ...td, color: flip.marge_brute >= 0 ? "#4ade80" : "#f87171", fontWeight: "600" }}>
                    {flip.marge_brute >= 0 ? "+" : ""}{flip.marge_brute?.toLocaleString("fr-FR")} €
                  </td>
                  <td style={{ ...td, color: flip.marge_nette >= 0 ? "#4ade80" : "#f87171", fontWeight: "700" }}>
                    {flip.marge_nette >= 0 ? "+" : ""}{flip.marge_nette?.toLocaleString("fr-FR")} €
                  </td>
                  <td style={{ ...td, color: "#888" }}>{flip.duree_jours}j</td>
                  <td style={td}>
                    <button onClick={() => handleDelete(flip.id)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem" }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="Créer un flip" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Montre *</label>
              <select style={inputStyle} required {...f("montre_id")}>
                <option value="">Sélectionner…</option>
                {montres.map((m) => (
                  <option key={m.id} value={m.id}>{m.marque} {m.nom}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Prix achat (€) *</label>
                <input style={inputStyle} type="number" required min="0" step="0.01" {...f("prix_achat")} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Prix vente (€) *</label>
                <input style={inputStyle} type="number" required min="0" step="0.01" {...f("prix_vente")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Plateforme achat *</label>
                <input style={inputStyle} required placeholder="ex: LeBonCoin" {...f("plateforme_achat")} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Plateforme vente *</label>
                <input style={inputStyle} required placeholder="ex: Vinted" {...f("plateforme_vente")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Date achat *</label>
                <input style={inputStyle} type="date" required {...f("date_achat")} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Date vente *</label>
                <input style={inputStyle} type="date" required {...f("date_vente")} />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Frais (€)</label>
              <input style={inputStyle} type="number" min="0" step="0.01" {...f("frais")} />
            </div>
            <button type="submit" style={{ ...btnPrimary, width: "100%", marginTop: "4px" }} disabled={saving}>
              {saving ? "Enregistrement…" : "Créer le flip"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
