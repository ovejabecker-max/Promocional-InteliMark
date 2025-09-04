import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
// 🚀 LAZY LOADING: HomePage solo se carga cuando es necesario
const HomePage = lazy(() => import("./pages/HomePage"));
import Rebecca from "./pages/Rebecca";
import { useTitleAnimation } from "./hooks/useTitleAnimation";
import { useFaviconAnimation } from "./hooks/useFaviconAnimation";
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

function App() {
  // 🎯 EFECTOS DE PESTAÑA GLOBALES - Activos en todo el sitio
  useFaviconAnimation();
  useTitleAnimation();

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
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100vh",
                  color: "#ff6b35",
                  fontSize: "18px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                Cargando...
              </div>
            }
          >
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

export default App;
