import { BrowserRouter, NavLink, Route, Routes, Navigate } from "react-router-dom";
import Veille from "./pages/Veille.jsx";
import Collection from "./pages/Collection.jsx";
import Flips from "./pages/Flips.jsx";
import Alertes from "./pages/Alertes.jsx";

const navStyle = {
  display: "flex",
  gap: "0",
  background: "#1a1a1a",
  borderBottom: "1px solid #2a2a2a",
  padding: "0 24px",
  alignItems: "center",
};

const logoStyle = {
  color: "#d4af37",
  fontWeight: "700",
  fontSize: "1.1rem",
  letterSpacing: "0.05em",
  marginRight: "32px",
  padding: "16px 0",
};

const linkStyle = {
  color: "#888",
  textDecoration: "none",
  padding: "16px 16px",
  fontSize: "0.9rem",
  fontWeight: "500",
  borderBottom: "2px solid transparent",
  transition: "color 0.15s",
};

const activeLinkStyle = {
  ...linkStyle,
  color: "#d4af37",
  borderBottom: "2px solid #d4af37",
};

export default function App() {
  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <span style={logoStyle}>WatchFlip</span>
        <NavLink to="/veille" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
          Veille
        </NavLink>
        <NavLink to="/collection" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
          Collection
        </NavLink>
        <NavLink to="/flips" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
          Flips
        </NavLink>
        <NavLink to="/alertes" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
          Alertes
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/veille" replace />} />
        <Route path="/veille" element={<Veille />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/flips" element={<Flips />} />
        <Route path="/alertes" element={<Alertes />} />
      </Routes>
    </BrowserRouter>
  );
}
