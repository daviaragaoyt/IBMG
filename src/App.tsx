import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardEvento } from './pages/eventos/DashboardEvento';
// Páginas do Evento Ekklesia
import { HomeEvento } from './pages/eventos/HomeEvento';
import { EkklesiaStaff } from './pages/eventos/EkklesiaStaff';
import { EkklesiaCredential } from './pages/eventos/EkklesiaCredential';

// Páginas das Ferramentas (Sorteios/Bingo)
import { Home } from './pages/Home';
import { SorteioNomes } from './pages/ferramentas/SorteioNomes';
import { SorteioNumeros } from './pages/ferramentas/SorteioNumeros';
import { Bingo } from './pages/ferramentas/Bingo';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
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

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar isLightMode={isLightMode} toggleTheme={toggleTheme} />

        <main className="flex-grow w-full flex flex-col items-center">
          <Routes>
            {/* FERRAMENTAS (Centralizadas) */}
            <Route path="/" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><Home isLightMode={isLightMode} /></div>} />
            <Route path="/sorteio-nomes" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><SorteioNomes /></div>} />
            <Route path="/sorteio-numeros" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><SorteioNumeros /></div>} />
            <Route path="/bingo" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><Bingo /></div>} />

            {/* EVENTO EKKLESIA (Tela Cheia) */}
            <Route path="/ekklesia" element={<HomeEvento isLightMode={isLightMode} />} />
            <Route path="/ekklesia/credencial" element={<div className="w-full"><EkklesiaCredential isLightMode={isLightMode} /></div>} />
            <Route
              path="/ekklesia/dashboard"
              element={
                <PrivateRoute>
                  <DashboardEvento />
                </PrivateRoute>
              }
            />

            {/* ADMIN STAFF (Protegido por Login no próprio componente) */}
            <Route path="/ekklesia/admin" element={<div className="w-full"><EkklesiaStaff isLightMode={isLightMode} /></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;