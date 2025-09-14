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
      // console.log(`🔄 Redirigiendo desde 404 a: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

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
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Configuración por defecto para todos los toasts
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            // Configuraciones específicas por tipo
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </TransitionProvider>
    </AnimationProvider>
  );
}

export default App;
