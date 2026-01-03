import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
    isLightMode: boolean;
    toggleTheme: () => void;
}

export const Navbar = ({ isLightMode, toggleTheme }: NavbarProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Função para fechar o menu ao clicar em um link
    const closeMenu = () => setIsMenuOpen(false);

    // Helper para classe ativa
    const isActive = (path: string) => location.pathname === path ? 'text-[#007B9C] font-bold' : 'text-[#cccccc] hover:text-[#007B9C]';

    return (
        <header className="sticky top-0 z-[1000] px-5 h-[70px] flex items-center shadow-lg transition-colors duration-300"
            style={{ backgroundColor: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

            <nav className="flex justify-between items-center w-full max-w-[1200px] mx-auto">

                {/* Logo Pequena */}
                <Link to="/" onClick={closeMenu}>
                    <img src="/assets/logo.png" alt="Logo Sorteador IBMG" className="h-[45px] object-contain" />
                </Link>

                {/* Botão Hamburger (Mobile) */}
                <button
                    className={`md:hidden flex flex-col justify-between w-[30px] h-[21px] bg-transparent border-none cursor-pointer z-[1200] ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Abrir menu"
                >
                    <span className={`block w-full h-[3px] bg-white rounded transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
                    <span className={`block w-full h-[3px] bg-white rounded transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-full h-[3px] bg-white rounded transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
                </button>

                {/* Links de Navegação */}
                <ul className={`
            fixed md:relative top-0 right-0 w-[75%] md:w-auto h-screen md:h-auto 
            bg-[#001A42] md:bg-transparent flex flex-col md:flex-row 
            items-center justify-center md:justify-end gap-8 
            transition-transform duration-400 ease-cubic 
            md:translate-x-0 z-[1100] shadow-[-5px_0_15px_rgba(0,0,0,0.5)] md:shadow-none
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
                    <li><Link to="/" onClick={closeMenu} className={`text-lg md:text-base transition-colors ${isActive('/')}`}>Início</Link></li>
                    <li><Link to="/sorteio-nomes" onClick={closeMenu} className={`text-lg md:text-base transition-colors ${isActive('/sorteio-nomes')}`}>Sortear Nome</Link></li>
                    <li><Link to="/sorteio-numeros" onClick={closeMenu} className={`text-lg md:text-base transition-colors ${isActive('/sorteio-numeros')}`}>Sortear Número</Link></li>
                    <li><Link to="/bingo" onClick={closeMenu} className={`text-lg md:text-base transition-colors ${isActive('/bingo')}`}>Bingo</Link></li>
                    <li><Link to="/ekklesia" onClick={closeMenu} className="bg-gradient-to-r from-[#e94a49] to-[#c95e89] text-white px-4 py-2 rounded-full font-bold hover:shadow-lg transition-all transform hover:scale-105">Ekklesia 2026</Link></li>
                    {/* Botão de Tema */}
                    <li>
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-transform hover:rotate-12"
                            title="Mudar Tema"
                        >
                            {isLightMode ? '☾' : '☀'}
                        </button>
                    </li>
                </ul>

                {/* Backdrop escuro no mobile */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[1000] md:hidden" onClick={closeMenu}></div>
                )}
            </nav>
        </header>
    );
};