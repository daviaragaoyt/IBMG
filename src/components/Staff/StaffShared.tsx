import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CheckCircle2, AlertCircle, XCircle, LayoutDashboard, CalendarClock, LogOut, MapPin, RefreshCw, ArrowLeft, Lock, ArrowUpCircle } from 'lucide-react';

// --- UTILITIES ---
export const formatPhone = (v: string) => v.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
export const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const getTheme = (isLightMode: boolean) => ({
    bgApp: isLightMode ? '#F3F4F6' : '#0F0014',
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
    borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D',
    inputBg: isLightMode ? '#F9FAFB' : '#0F0014',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#666666' : '#9CA3AF',
});

// --- TOAST ---
export const Toast = ({ msg, type }: any) => (
    <div className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border-l-4 animate-slide-in-right bg-white text-gray-800 ${type === 'success' ? 'border-emerald-500' : type === 'warning' ? 'border-yellow-500' : 'border-red-500'}`}>
        {type === 'success' ? <CheckCircle2 className="text-emerald-500" size={20} /> : type === 'warning' ? <AlertCircle className="text-yellow-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
        <span className="font-bold text-sm">{msg}</span>
    </div>
);

// --- DEFAULT LAYOUT ---
export const ScreenLayout = ({ user, title, icon, accentColor, onLogout, checkpoints, selectedSpot, theme, children }: any) => {
    const currentSpotName = checkpoints.find((c: any) => c.id === selectedSpot)?.name || "Local Indefinido";
    return (
        <div className="flex flex-col h-full min-h-screen transition-colors duration-500" style={{ background: theme.bgApp, color: theme.textPrimary }}>
            <div className={`pt-8 pb-6 px-6 relative z-20 border-b-2`} style={{ borderColor: accentColor }}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl shadow-lg" style={{ color: accentColor, background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>{icon}</div>
                        <div>
                            <h1 className="font-black text-xl uppercase tracking-tight leading-none" style={{ color: theme.textPrimary }}>{title}</h1>
                            <p className="text-xs font-bold opacity-60" style={{ color: accentColor }}>Olá, {user.name.split(' ')[0]}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/ekklesia/dashboard" className="p-3 rounded-2xl transition-colors bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 flex items-center justify-center"><LayoutDashboard size={20} /></Link>
                        <Link to="/ekklesia/reunioes" className="p-3 rounded-2xl transition-colors bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 flex items-center justify-center"><CalendarClock size={20} /></Link>
                        <button onClick={onLogout} className="p-3 rounded-2xl transition-colors text-white hover:bg-white/10" style={{ border: `1px solid ${theme.borderColor}`, color: theme.textPrimary }}><LogOut size={20} /></button>
                    </div>
                </div>
                <div className="relative p-4 rounded-xl flex items-center gap-3 border transition-all shadow-sm" style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 animate-pulse"><MapPin size={18} /></div>
                    <div><p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Você está operando em:</p><p className="font-black text-sm">{currentSpotName}</p></div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]"></div></div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
    );
};

// --- LOGIN ---
export const StaffLogin = ({ onLogin, isLightMode }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const theme = getTheme(isLightMode);

    // Mouse Animation
    const mouseRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(null);
    const targetPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => { targetPos.current = { x: e.clientX, y: e.clientY }; };
        const animate = () => {
            const ease = 0.08;
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;
            if (mouseRef.current) mouseRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
            requestRef.current = requestAnimationFrame(animate);
        };
        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);
        return () => { window.removeEventListener('mousemove', handleMouseMove); if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try { const data = await api.login(email); onLogin(data); } catch (err) { setError('Acesso negado.'); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500" style={{ background: theme.bgApp }}>
            <div ref={mouseRef} className={`fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none blur-[100px] z-0 transition-opacity duration-500 ${isLightMode ? 'opacity-30 mix-blend-multiply' : 'opacity-20 mix-blend-screen'}`} style={{ background: 'linear-gradient(135deg, #A800E0, #FF3D00)' }}></div>
            <div className="w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl border relative z-10 backdrop-blur-md" style={{ background: isLightMode ? 'rgba(255,255,255,0.7)' : 'rgba(26, 5, 36, 0.7)', borderColor: theme.borderColor }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg text-white transform hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #A800E0, #FF3D00)' }}><Lock size={32} /></div>
                <h2 className="text-3xl font-black text-center mb-2 tracking-tight" style={{ color: theme.textPrimary }}>Staff Access</h2>
                <form onSubmit={handleLogin} className="space-y-5">
                    <input type="email" required placeholder="Seu e-mail de staff" className="w-full p-5 rounded-2xl border outline-none font-bold transition-all focus:scale-[1.02] focus:shadow-lg" style={{ borderColor: theme.borderColor, color: theme.textPrimary, background: theme.inputBg }} value={email} onChange={e => setEmail(e.target.value)} />
                    <button disabled={loading} className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #A800E0, #FF3D00)' }}>{loading ? <RefreshCw className="animate-spin mx-auto" /> : 'ACESSAR'}</button>
                </form>
                {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 text-red-500 text-center text-sm font-bold flex items-center gap-2 justify-center animate-pulse"><AlertCircle size={16} />{error}</div>}
                <Link to="/ekklesia" className="flex items-center justify-center gap-2 mt-8 text-xs font-bold opacity-50 hover:opacity-100 transition-opacity" style={{ color: theme.textPrimary }}><ArrowLeft size={12} /> Voltar ao Início</Link>
            </div>
        </div>
    );
};

// --- MEETING COUNTER ---
export const MeetingCounter = ({ theme }: any) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    useEffect(() => { api.getMeetingCount().then((d: any) => setCount(d.count)).catch(() => { }); }, []);
    const increment = async () => {
        if (!confirm(`Deseja iniciar a Reunião #${count + 1}?`)) return;
        setLoading(true);
        if (navigator.vibrate) navigator.vibrate(100);
        try { const data = await api.incrementMeetingCount(); setCount(data.count); } finally { setLoading(false); }
    };
    return (
        <div className="mx-6 mt-4 mb-2 p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/10 rounded-xl text-purple-500"><CalendarClock size={24} /></div><div><p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Contagem Oficial</p><h3 className="text-xl font-black leading-none" style={{ color: theme.textPrimary }}>REUNIÃO #{count}</h3></div></div>
            <button onClick={increment} disabled={loading} className="p-3 rounded-xl bg-purple-600 text-white shadow-lg active:scale-95 transition-all hover:bg-purple-700 flex flex-col items-center">{loading ? <span className="animate-spin">↻</span> : <ArrowUpCircle size={24} />}</button>
        </div>
    );
};