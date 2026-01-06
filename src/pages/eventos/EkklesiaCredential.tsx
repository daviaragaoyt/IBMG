import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft, Search, MapPin, Download, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventoProps { isLightMode: boolean; }

export const EkklesiaCredential = ({ isLightMode }: EventoProps) => {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    const mouseRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(null);
    const targetPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });

    // --- TEMA (Mesmo da Home) ---
    const theme = {
        pageBg: isLightMode ? '#FFFFFF' : '#0F0014',
        text: isLightMode ? '#1A1A1A' : '#FFFFFF',
        brandGradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
        inputBg: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
        inputBorder: isLightMode ? '#E5E7EB' : '#2D0A3D',
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            targetPos.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            const ease = 0.08;
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

            if (mouseRef.current) {
                mouseRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setUser(null);
        try {
            const res = await fetch(`${API_URL}/person/by-email?email=${email}`);
            if (res.ok) setUser(await res.json()); else setError('E-mail não encontrado na lista de convidados.');
        } catch { setError('Erro de conexão.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500 relative overflow-hidden"
            style={{ backgroundColor: theme.pageBg, color: theme.text }}>

            {/* --- MOUSE FLOW EFFECT --- */}
            <div
                ref={mouseRef}
                className={`fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none blur-[100px] z-0 transition-opacity duration-500
                    ${isLightMode ? 'opacity-30 mix-blend-multiply' : 'opacity-20 mix-blend-screen'}`}
                style={{ background: theme.brandGradient }}
            ></div>

            {/* --- BOTÃO VOLTAR (CORRIGIDO) --- */}
            {/* Agora com tamanho fixo (w-12 h-12) para garantir que seja uma bolinha */}
            <Link to="/ekklesia"
                className="fixed top-24 left-6 z-150 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 border hover:scale-110 active:scale-95 group"
                style={{
                    backgroundColor: isLightMode ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderColor: theme.inputBorder,
                    color: theme.text
                }}
                title="Voltar para Home"
            >
                <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
            </Link>

            {!user ? (
                // --- TELA DE BUSCA ---
                <div className="w-full max-w-md animate-fade-in-up relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] mb-6 shadow-2xl shadow-purple-500/30"
                            style={{ background: theme.brandGradient }}>
                            <Search size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Credencial</h1>
                        <p className="opacity-60 text-lg">Digite seu e-mail para gerar seu acesso.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <input type="email" required placeholder="seu@email.com"
                            className="w-full p-6 rounded-3xl border-2 outline-none font-bold text-xl text-center transition-all focus:border-purple-500 focus:scale-[1.02] shadow-sm backdrop-blur-sm"
                            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                            value={email} onChange={e => setEmail(e.target.value)} />

                        <button disabled={loading} className="w-full py-6 rounded-3xl text-white font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: theme.brandGradient }}>
                            {loading ? 'GERANDO...' : 'ACESSAR TICKET'}
                        </button>
                    </form>
                    {error && <div className="mt-6 p-4 bg-red-500/10 text-red-500 rounded-2xl text-center font-bold border border-red-500/20 animate-shake">{error}</div>}
                </div>
            ) : (
                // --- O TICKET PREMIUM ---
                <div className="w-full max-w-[360px] animate-flip-in-y relative group perspective-1000 z-10 flex flex-col items-center">

                    {/* Brilho Suave atrás do Ticket */}
                    <div className="absolute top-4 left-4 right-4 bottom-20 bg-gradient-to-b from-purple-600 to-orange-600 rounded-[3rem] blur-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-700"></div>

                    <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-white transform transition-transform duration-500 hover:scale-[1.01]">

                        {/* 1. TOPO (A Marca - Cores da Home) */}
                        <div className="relative h-60 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
                            style={{ background: theme.brandGradient }}>

                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                            <div className="absolute top-5 w-12 h-2 bg-black/20 rounded-full backdrop-blur-md border border-white/10"></div>

                            <h1 className="relative z-10 text-white font-black text-5xl tracking-wide drop-shadow-lg mt-6"
                                style={{ fontFamily: 'Inter, sans-serif' }}>
                                EKKLESIA
                            </h1>
                            <div className="relative z-10 mt-2">
                                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.3em]">
                                    2026
                                </span>
                            </div>
                        </div>

                        {/* 2. MIOLO (Dados do Usuário) */}
                        <div className="bg-white px-6 pt-10 pb-8 flex flex-col items-center relative z-10">

                            <div className={`absolute -top-5 shadow-lg border-[3px] border-white px-5 py-2 rounded-xl flex items-center gap-2 transform -translate-y-1/2
                                            ${user.type === 'VISITOR' ? 'bg-orange-500' : 'bg-purple-600'}`}>
                                {user.type === 'VISITOR' ? <Sparkles size={16} className="text-white" /> : <CheckCircle2 size={16} className="text-white" />}
                                <span className="text-white font-bold text-xs uppercase tracking-wider">
                                    {user.type === 'VISITOR' ? 'Visitante' : 'Membro'}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 text-center leading-tight mb-1 mt-4">{user.name}</h2>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 mb-6">
                                <MapPin size={10} /> {user.church || 'Igreja Convidada'}
                            </p>

                            <div className="w-[120%] h-[2px] border-t-2 border-dashed border-gray-200 relative my-2">
                                <div className="absolute -left-2 -top-3 w-6 h-6 rounded-full" style={{ backgroundColor: theme.pageBg }}></div>
                                <div className="absolute -right-2 -top-3 w-6 h-6 rounded-full" style={{ backgroundColor: theme.pageBg }}></div>
                            </div>

                            <div className="pt-6 flex flex-col items-center w-full">
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4">Acesso Liberado</p>
                                <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <QRCode value={user.id} size={140} />
                                </div>
                                <p className="text-[9px] text-gray-300 mt-3 font-mono tracking-widest">{user.id.split('-')[0].toUpperCase()}</p>
                            </div>

                            <button onClick={() => window.print()} className="mt-6 w-full py-3.5 rounded-xl font-bold text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition-all flex items-center justify-center gap-2 border border-gray-100">
                                <Download size={14} /> BAIXAR CREDENCIAL
                            </button>
                        </div>
                    </div>

                    {/* Botão de Nova Busca */}
                    <button
                        onClick={() => setUser(null)}
                        className="mt-8 flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 group hover:scale-105 active:scale-95 border backdrop-blur-sm"
                        style={{
                            backgroundColor: theme.inputBg,
                            color: theme.text,
                            borderColor: theme.inputBorder
                        }}
                    >
                        <div className="p-1.5 rounded-full bg-current opacity-10 group-hover:opacity-25 transition-opacity">
                            <ArrowLeft size={16} className="text-current transition-transform group-hover:-translate-x-1" />
                        </div>
                        <span>Buscar outra credencial</span>
                    </button>

                </div>
            )}
        </div>
    );
};