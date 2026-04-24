import { useState, useEffect } from "react";
import { collection as collectionApi } from "../api.js";
import WatchCard from "../components/WatchCard.jsx";
import Modal from "../components/Modal.jsx";

const page = { padding: "32px 24px", maxWidth: "960px", margin: "0 auto" };

const topBar = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginBottom: "24px", flexWrap: "wrap", gap: "12px",
};

const title = { fontSize: "1.25rem", fontWeight: "700" };

const filters = { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" };

const select = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px",
  color: "#e5e5e5", padding: "6px 10px", fontSize: "0.8rem", outline: "none",
};

const btnPrimary = {
  background: "#d4af37", color: "#0f0f0f", border: "none", borderRadius: "6px",
  padding: "8px 18px", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer",
};

const grid = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "12px",
};

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" };
const labelStyle = { fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle = {
  background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "6px",
  color: "#e5e5e5", padding: "8px 12px", fontSize: "0.875rem", outline: "none", width: "100%",
};

const empty = { color: "#555", textAlign: "center", marginTop: "48px", fontSize: "0.9rem" };

const defaultForm = {
  nom: "", marque: "", reference: "", prix_achat: "", date_achat: "",
  etat: "Bon état", statut: "en_stock", notes: "", photo_url: "",
};

export default function Collection() {
  const [montres, setMontres] = useState([]);
  const [filterStatut, setFilterStatut] = useState("");
  const [filterMarque, setFilterMarque] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const params = {};
    if (filterStatut) params.statut = filterStatut;
    if (filterMarque) params.marque = filterMarque;
    const res = await collectionApi.list(params);
    setMontres(res.data);
  };

  useEffect(() => { load(); }, [filterStatut, filterMarque]);

  const marques = [...new Set(montres.map((m) => m.marque))].sort();

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (montre) => {
    setEditing(montre);
    setForm({
      nom: montre.nom, marque: montre.marque, reference: montre.reference || "",
      prix_achat: montre.prix_achat, date_achat: montre.date_achat,
      etat: montre.etat, statut: montre.statut,
      notes: montre.notes || "", photo_url: montre.photo_url || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette montre ?")) return;
    await collectionApi.delete(id);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        prix_achat: parseFloat(form.prix_achat),
        reference: form.reference || null,
        notes: form.notes || null,
        photo_url: form.photo_url || null,
      };
      if (editing) {
        await collectionApi.update(editing.id, payload);
      } else {
        await collectionApi.create(payload);
      }
      setModalOpen(false);
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
        <div style={title}>Collection</div>
        <div style={filters}>
          <select style={select} value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="en_stock">En stock</option>
            <option value="vendu">Vendu</option>
          </select>
          <select style={select} value={filterMarque} onChange={(e) => setFilterMarque(e.target.value)}>
            <option value="">Toutes marques</option>
            {marques.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button style={btnPrimary} onClick={openCreate}>+ Ajouter</button>
        </div>
      </div>

      {montres.length === 0 ? (
        <div style={empty}>Aucune montre. Commencez par en ajouter une.</div>
      ) : (
        <div style={grid}>
          {montres.map((m) => (
            <WatchCard key={m.id} montre={m} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Modifier la montre" : "Ajouter une montre"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nom *</label>
              <input style={inputStyle} required placeholder="ex: Submariner Date" {...f("nom")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Marque *</label>
              <input style={inputStyle} required placeholder="ex: Rolex" {...f("marque")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Référence</label>
              <input style={inputStyle} placeholder="ex: 126610LN" {...f("reference")} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Prix achat (€) *</label>
                <input style={inputStyle} type="number" required min="0" step="0.01" {...f("prix_achat")} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Date achat *</label>
                <input style={inputStyle} type="date" required {...f("date_achat")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>État *</label>
                <select style={{ ...inputStyle }} required {...f("etat")}>
                  <option>Neuf</option>
                  <option>Très bon état</option>
                  <option>Bon état</option>
                  <option>Usé</option>
                </select>
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Statut</label>
                <select style={{ ...inputStyle }} {...f("statut")}>
                  <option value="en_stock">En stock</option>
                  <option value="vendu">Vendu</option>
                </select>
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} {...f("notes")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Photo URL</label>
              <input style={inputStyle} type="url" placeholder="https://..." {...f("photo_url")} />
            </div>
            <button type="submit" style={{ ...btnPrimary, width: "100%", marginTop: "4px" }} disabled={saving}>
              {saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Ajouter"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
