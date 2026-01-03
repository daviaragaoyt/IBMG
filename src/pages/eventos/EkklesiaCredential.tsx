import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventoProps {
    isLightMode: boolean;
}

export const EkklesiaCredential = ({ isLightMode }: EventoProps) => {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Tema Vibrante
    const theme = {
        gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
        bg: isLightMode ? '#F3F4F6' : '#0F0014', // Fundo cinza claro ou roxo escuro
        cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
        textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
        textSecondary: isLightMode ? '#666666' : '#AAAAAA',
        inputBg: isLightMode ? '#F9FAFB' : '#2D0A3D',
        inputBorder: isLightMode ? '#E5E7EB' : '#4B1E63',
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setUser(null);
        try {
            const res = await fetch(`${API_URL}/person/by-email?email=${email}`);
            if (res.ok) setUser(await res.json()); else setError('Inscrição não encontrada.');
        } catch { setError('Erro de conexão.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-6 font-sans transition-colors duration-500"
            style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>

            <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-10">
                <Link to="/ekklesia" className="p-2 rounded-full shadow-sm hover:shadow-md transition-all"
                    style={{ backgroundColor: theme.cardBg, color: theme.textPrimary }}>
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="font-bold tracking-widest text-sm uppercase" style={{ color: theme.textSecondary }}>Passaporte Digital</h1>
                <div className="w-9"></div>
            </div>

            {/* Efeito de fundo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[300px] opacity-20 blur-[80px] pointer-events-none"
                style={{ background: theme.gradient }}></div>

            {!user ? (
                // --- TELA DE BUSCA ---
                <div className="w-full max-w-md p-8 rounded-[2rem] shadow-2xl animate-fade-in relative z-10"
                    style={{ backgroundColor: theme.cardBg }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg"
                        style={{ background: theme.gradient }}>
                        <Search size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-center mb-2">Buscar Credencial</h2>
                    <form onSubmit={handleSearch} className="space-y-4 mt-8">
                        <input type="email" required placeholder="seu@email.com"
                            className="w-full p-4 rounded-xl border-2 outline-none font-medium transition-all"
                            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                            onFocus={(e) => e.target.style.borderColor = '#A800E0'}
                            onBlur={(e) => e.target.style.borderColor = theme.inputBorder}
                            value={email} onChange={e => setEmail(e.target.value)} />
                        <button disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: theme.gradient }}>
                            {loading ? 'Buscando...' : 'GERAR ACESSO'}
                        </button>
                    </form>
                    {error && <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-xl text-center font-bold text-sm border border-red-500/20">{error}</div>}
                </div>
            ) : (
                // --- TELA DO QR CODE ---
                <div className="w-full max-w-sm animate-fade-in relative group z-10">
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl relative" style={{ backgroundColor: theme.cardBg }}>
                        {/* Topo com Degradê */}
                        <div className="h-36 relative flex items-center justify-center overflow-hidden" style={{ background: theme.gradient }}>
                            <div className="relative z-10 text-white font-black text-4xl tracking-tighter drop-shadow-lg"
                                style={{ fontFamily: 'Playfair Display' }}>Ekklesia</div>
                        </div>

                        <div className="px-8 pb-10 flex flex-col items-center -mt-12 relative z-10">
                            {/* QR Code sempre em fundo branco para leitura */}
                            <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
                                <QRCode value={user.id} size={180} />
                            </div>
                            <h2 className="text-2xl font-black text-center leading-tight mb-2">{user.name}</h2>
                            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2 ${user.type === 'VISITOR' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                                {user.type === 'VISITOR' ? 'Visitante' : 'Membro'}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setUser(null)} className="w-full mt-6 py-3 font-bold text-sm hover:underline"
                        style={{ color: isLightMode ? '#A800E0' : '#FFFFFF' }}>
                        Buscar outro e-mail
                    </button>
                </div>
            )}
        </div>
    );
};