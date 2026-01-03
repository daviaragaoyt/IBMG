import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Páginas
import { Home } from './pages/Home';
import { SorteioNomes } from './pages/ferramentas/SorteioNomes';
import { SorteioNumeros } from './pages/ferramentas/SorteioNumeros';
import { Bingo } from './pages/ferramentas/Bingo';
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
      {/* min-h-screen garante que o site ocupe 100% da altura da tela */}
      <div className="flex flex-col min-h-screen">
        <Navbar isLightMode={isLightMode} toggleTheme={toggleTheme} />

        {/* MUDANÇA AQUI:
            flex-grow: Ocupa todo o espaço que sobra.
            flex flex-col: Organiza filhos em coluna.
            items-center: Centraliza HORIZONTALMENTE.
            justify-center: Centraliza VERTICALMENTE.
            w-full: Garante largura total.
        */}
        <main className="flex-grow w-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[1200px] flex flex-col items-center">
            <Routes>
              <Route path="/" element={<Home isLightMode={isLightMode} />} />

              <Route path="/sorteio-nomes" element={<SorteioNomes />} />
              <Route path="/sorteio-numeros" element={<SorteioNumeros />} />
              <Route path="/bingo" element={<Bingo />} />

              <Route path="/credencial" element={<FindTicketPage />} />
              <Route path="/admin" element={<StaffScanner />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;