import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
// 🚀 LAZY LOADING: Ambas páginas se cargan solo cuando son necesarias
const HomePage = lazy(() => import("./pages/HomePage"));
const Rebecca = lazy(() => import("./pages/Rebecca"));
import { AnimationProvider } from "./contexts/AnimationContext";
import { TransitionProvider } from "./contexts/TransitionContext";
import { useOptimizedTabAnimations } from "./hooks/useOptimizedTabAnimations";
import { PageLoader } from "./components/PageLoader";
import "./App.css";

// ✅ COMPONENTE PARA MANEJAR REDIRECCIONES SPA
function SPARedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay una ruta guardada desde 404.html
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

// ✅ COMPONENTE PARA RESTAURAR SCROLL EN NAVEGACIÓN
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Restaurar scroll de forma simple en cada cambio de ruta
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

// ✅ COMPONENTE PRINCIPAL CON ANIMACIONES OPTIMIZADAS
function AppContent() {
  // 🎯 EFECTOS UNIFICADOS DE PESTAÑA - Sistema optimizado
  useOptimizedTabAnimations();

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <SPARedirectHandler />
        <ScrollToTop />
        <main className="app-main">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Ruta embebida: desactiva transición de portal y navegación */}
              <Route path="/home-embed" element={<HomePage embedded />} />
              <Route path="/rebecca" element={<Rebecca />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

// 🎯 APP PRINCIPAL CON PROVIDERS ANIDADOS
function App() {
  return (
    <AnimationProvider>
      <TransitionProvider>
        <AppContent />
        {/* 🔔 Sistema de notificaciones unificado */}
        <Toaster position="top-right" />
      </TransitionProvider>
    </AnimationProvider>
  );
}

export default App;
