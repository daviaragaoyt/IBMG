import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';

// Imports Corrigidos para 'eventos' (Plural)
import { HomeEvento } from './pages/eventos/HomeEvento';
import { EkklesiaStaff } from './pages/eventos/EkklesiaStaff';
import { EkklesiaCredential } from './pages/eventos/EkklesiaCredential';

// Páginas Ferramentas
import { Home } from './pages/Home';
import { SorteioNomes } from './pages/ferramentas/SorteioNomes';
import { SorteioNumeros } from './pages/ferramentas/SorteioNumeros';
import { Bingo } from './pages/ferramentas/Bingo';
// Os antigos podem ficar aí se quiser, mas vamos usar os novos do Ekklesia
import { FindTicketPage } from './pages/eventos/FindTicketPage';
import { StaffScanner } from './components/StaffScanner';

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
            {/* Rotas Antigas / Ferramentas */}
            <Route path="/" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><Home isLightMode={isLightMode} /></div>} />
            <Route path="/sorteio-nomes" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><SorteioNomes /></div>} />
            <Route path="/sorteio-numeros" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><SorteioNumeros /></div>} />
            <Route path="/bingo" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><Bingo /></div>} />

            {/* --- ROTAS DO EKKLESIA (Agora passando a prop isLightMode) --- */}
            <Route path="/ekklesia" element={<HomeEvento isLightMode={isLightMode} />} />

            <Route path="/ekklesia/admin" element={
              <div className="w-full"><EkklesiaStaff isLightMode={isLightMode} /></div>
            } />

            <Route path="/ekklesia/credencial" element={
              <div className="w-full"><EkklesiaCredential isLightMode={isLightMode} /></div>
            } />
            {/* Admin e Credencial novos */}
            <Route path="/ekklesia/admin" element={<div className="w-full"><EkklesiaStaff isLightMode={isLightMode} /></div>} />
            <Route path="/ekklesia/credencial" element={<div className="w-full"><EkklesiaCredential isLightMode={isLightMode} /></div>} />

            {/* Mantendo as rotas antigas caso precise */}
            <Route path="/credencial" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><FindTicketPage /></div>} />
            <Route path="/admin" element={<div className="w-full max-w-[1200px] p-4 pt-10 flex flex-col items-center"><StaffScanner /></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;