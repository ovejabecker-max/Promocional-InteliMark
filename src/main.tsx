// import { StrictMode } from 'react' // 🔧 TEMPORAL: Deshabilitado para testing
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode> // 🔧 TEMPORAL: Deshabilitado para testing de duplicación
  <App />
  // </StrictMode>
);
