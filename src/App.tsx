import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// --- COMPONENTES GERAIS ---
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';

// --- PÁGINAS DAS FERRAMENTAS (Sorteios/Bingo) ---
import { Home } from './pages/Home';
import { SorteioNomes } from './pages/ferramentas/SorteioNomes';
import { SorteioNumeros } from './pages/ferramentas/SorteioNumeros';
import { Bingo } from './pages/ferramentas/Bingo';

// --- PÁGINAS DO EVENTO EKKLESIA ---
import { HomeEvento } from './pages/eventos/HomeEvento';
import { EkklesiaStaff } from './pages/eventos/EkklesiaStaff';
import { EkklesiaCredential } from './pages/eventos/EkklesiaCredential';
import { EkklesiaDashboard } from './pages/eventos/EkklesiaDashboard';
import { PublicCatalog } from './pages/eventos/PublicCatalog';
import { MeetingManager } from './pages/eventos/MeetingManager';

const MainContent = () => {
  const location = useLocation();

  // Lógica de Tema
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light';
  });

  useEffect(() => {
    const body = document.body;
    if (isLightMode) {
      body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  // Lógica de Fundo Dinâmico
  const isEkklesiaRoute = location.pathname.includes('/ekklesia');

  const getBackgroundClass = () => {
    if (isLightMode) return 'bg-gray-100 text-gray-900';
    if (isEkklesiaRoute) return 'bg-[#0F0014] text-white'; // Roxo Ekklesia
    return 'bg-[#001233] text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#001E3C] to-[#000911]'; // Azul Ferramentas
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${getBackgroundClass()}`}>

      <Navbar isLightMode={isLightMode} toggleTheme={toggleTheme} />

      {/* CORREÇÃO AQUI: Removi 'flex flex-col items-center'. 
          Agora o main ocupa 100% da largura nativamente. */}
      <main className="flex-grow w-full relative">
        <Routes>

          {/* === 1. FERRAMENTAS (Centralizadas com mx-auto) === */}
          {/* Adicionamos 'max-w-[1200px] mx-auto' AQUI, individualmente */}

          <Route path="/" element={
            <div className="w-full max-w-[1200px] mx-auto p-4 pt-10 flex flex-col items-center">
              <Home isLightMode={isLightMode} />
            </div>
          } />

          <Route path="/sorteio-nomes" element={
            <div className="w-full max-w-[1200px] mx-auto p-4 pt-10 flex flex-col items-center">
              <SorteioNomes />
            </div>
          } />

          <Route path="/sorteio-numeros" element={
            <div className="w-full max-w-[1200px] mx-auto p-4 pt-10 flex flex-col items-center">
              <SorteioNumeros />
            </div>
          } />

          <Route path="/bingo" element={
            <div className="w-full max-w-[1200px] mx-auto p-4 pt-10 flex flex-col items-center">
              <Bingo />
            </div>
          } />

          {/* === 2. EVENTO EKKLESIA (Tela Cheia / Full Width) === */}
          {/* Aqui NÃO tem container restringindo largura */}

          <Route path="/ekklesia" element={<HomeEvento isLightMode={isLightMode} />} />
          <Route path="/ekklesia/credencial" element={<EkklesiaCredential isLightMode={isLightMode} />} />
          <Route path="/ekklesia/loja" element={<PublicCatalog type="STORE" isLightMode={isLightMode} />} />
          <Route path="/ekklesia/gourmet" element={<PublicCatalog type="CANTINA" isLightMode={isLightMode} />} />
          <Route path="/ekklesia/reunioes" element={<MeetingManager isLightMode={isLightMode} />} />

          <Route path="/ekklesia/dashboard" element={
            <PrivateRoute>
              <EkklesiaDashboard isLightMode={isLightMode} />
            </PrivateRoute>
          }
          />

          <Route path="/ekklesia/admin" element={<EkklesiaStaff isLightMode={isLightMode} />} />

        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
}

export default App;