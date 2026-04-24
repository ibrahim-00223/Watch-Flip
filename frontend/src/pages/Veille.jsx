import { useState } from "react";
import { veille as veilleApi } from "../api.js";
import MistralPanel from "../components/MistralPanel.jsx";
import ResultCard from "../components/ResultCard.jsx";

const page = { padding: "32px 24px", maxWidth: "960px", margin: "0 auto" };
const title = { fontSize: "1.25rem", fontWeight: "700", marginBottom: "24px" };

const form = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "20px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px",
};

const row = { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" };

const field = { display: "flex", flexDirection: "column", gap: "6px", flex: "1", minWidth: "160px" };

const label = { fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" };

const input = {
  background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "6px",
  color: "#e5e5e5", padding: "8px 12px", fontSize: "0.875rem", outline: "none",
};

const btnPrimary = {
  background: "#d4af37", color: "#0f0f0f", border: "none", borderRadius: "6px",
  padding: "10px 24px", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer",
  alignSelf: "flex-end",
};

const btnDisabled = { ...btnPrimary, opacity: 0.5, cursor: "not-allowed" };

const sources = ["leboncoin", "vinted", "chrono24"];

const grid = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "12px",
};

const sourceLabel = {
  display: "flex", alignItems: "center", gap: "8px",
  fontSize: "0.875rem", cursor: "pointer",
};

export default function Veille() {
  const [keyword, setKeyword] = useState("");
  const [selectedSources, setSelectedSources] = useState(["leboncoin", "chrono24"]);
  const [prixMax, setPrixMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [analyse, setAnalyse] = useState(null);

  const toggleSource = (src) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || selectedSources.length === 0 || !prixMax) return;
    setLoading(true);
    setError("");
    setResults([]);
    setAnalyse(null);
    try {
      const res = await veilleApi.scrape({
        keyword: keyword.trim(),
        sources: selectedSources,
        prix_max: parseFloat(prixMax),
      });
      setResults(res.data.resultats || []);
      setAnalyse(res.data.analyse || null);
    } catch (err) {
      setError("Erreur lors du scraping. Vérifiez les logs backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={title}>Veille marché</div>

      <form style={form} onSubmit={handleSubmit}>
        <div style={row}>
          <div style={field}>
            <label style={label}>Mot-clé</label>
            <input
              style={input} type="text" placeholder="ex: rolex submariner"
              value={keyword} onChange={(e) => setKeyword(e.target.value)} required
            />
          </div>
          <div style={field}>
            <label style={label}>Prix max (€)</label>
            <input
              style={input} type="number" placeholder="ex: 8000" min="0"
              value={prixMax} onChange={(e) => setPrixMax(e.target.value)} required
            />
          </div>
        </div>

        <div>
          <div style={{ ...label, marginBottom: "10px" }}>Sources</div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {sources.map((src) => (
              <label key={src} style={sourceLabel}>
                <input
                  type="checkbox" checked={selectedSources.includes(src)}
                  onChange={() => toggleSource(src)}
                  style={{ accentColor: "#d4af37" }}
                />
                {src}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={loading ? btnDisabled : btnPrimary} disabled={loading}>
          {loading ? "Scraping en cours…" : "Lancer la veille"}
        </button>
      </form>

      {error && <div style={{ color: "#ef4444", marginBottom: "16px", fontSize: "0.875rem" }}>{error}</div>}

      {analyse && <MistralPanel analyse={analyse} />}

      {results.length > 0 && (
        <>
          <div style={{ color: "#888", fontSize: "0.8rem", marginBottom: "12px" }}>
            {results.length} résultat(s) trouvé(s)
          </div>
          <div style={grid}>
            {results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
