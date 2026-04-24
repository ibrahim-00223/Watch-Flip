import { useEffect } from "react";

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
};

const box = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
  padding: "24px", minWidth: "400px", maxWidth: "560px", width: "100%",
  maxHeight: "90vh", overflowY: "auto",
};

const header = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginBottom: "20px",
};

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={box}>
        <div style={header}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
