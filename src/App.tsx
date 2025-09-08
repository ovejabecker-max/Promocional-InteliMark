import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
// 🚀 LAZY LOADING: Ambas páginas se cargan solo cuando son necesarias
const HomePage = lazy(() => import("./pages/HomePage"));
const Rebecca = lazy(() => import("./pages/Rebecca"));
import { AnimationProvider } from "./contexts/AnimationContext";
import { useOptimizedTabAnimations } from "./hooks/useOptimizedTabAnimations";
import { useFrameRateLimiter } from "./hooks/useFrameRateLimiter";
import { PageLoader } from "./components/PageLoader";
import "./App.css";

// ✅ COMPONENTE PARA RESTAURAR SCROLL EN NAVEGACIÓN
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // ✅ RESTAURAR SCROLL AL INICIO en cada cambio de ruta
    // console.log(`🎯 Navegando a: ${location.pathname} - restaurando scroll...`);

    // Múltiples métodos para máxima compatibilidad
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // ✅ VERIFICACIÓN ADICIONAL: Asegurar que se mantenga en el top
    const ensureScrollTop = () => {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        // console.log('✅ Scroll corregido después de navegación');
      }
    };

    // Ejecutar después del render
    setTimeout(ensureScrollTop, 0);
    setTimeout(ensureScrollTop, 100);
  }, [location]);

  return null;
}

// ✅ COMPONENTE PRINCIPAL CON ANIMACIONES OPTIMIZADAS
function AppContent() {
  // 🎯 EFECTOS UNIFICADOS DE PESTAÑA - Sistema optimizado
  useOptimizedTabAnimations();

  // 🔧 LIMITADOR DE FRAME RATE - Prevenir violations
  useFrameRateLimiter();

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <ScrollToTop />
        <main className="app-main">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/rebecca" element={<Rebecca />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

// 🎯 APP PRINCIPAL CON PROVIDER DE ANIMACIONES
function App() {
  return (
    <AnimationProvider>
      <AppContent />
    </AnimationProvider>
  );
}

export default App;
