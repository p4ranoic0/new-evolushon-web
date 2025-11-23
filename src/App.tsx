import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Surf from "./pages/Surf";
import SurfSkate from "./pages/SurfSkate";
import SurfTrips from "./pages/SurfTrips";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";

export default function App() {
  const { t } = useTranslation();
  const [, setTheme] = useState(0);
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(prev => prev + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="min-h-dvh flex flex-col bg-ocean-50 dark:bg-ocean-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clases/surf" element={<Surf />} />
          <Route path="/clases/surfskate" element={<SurfSkate />} />
          <Route path="/surftrips" element={<SurfTrips />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/contacto" element={<Contact />} />
          <Route
            path="*"
            element={
              <div className="p-8 text-center">{t("common.notFound")}</div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
