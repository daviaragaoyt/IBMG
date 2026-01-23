import React, { useState, useEffect, useRef } from 'react';
import { Lock, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api'; // Importando o serviço centralizado
import {
    getTheme, Toast, EvangelismScreen, ReceptionScreen, KidsScreen,
    PrayerScreen, ConsolidationScreen, StoreScreen
} from '../../components/StaffComponents';

// --- TELA DE LOGIN (COM ANIMAÇÃO DE MOUSE) ---
const StaffLogin = ({ onLogin, isLightMode }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Efeito de Spotlight do Mouse
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
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const theme = getTheme(isLightMode);
    const gradient = 'linear-gradient(135deg, #A800E0, #FF3D00)';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await api.login(email);
            onLogin(data);
        } catch (err) {
            setError('Acesso negado. Verifique o e-mail.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500" style={{ background: theme.bgApp }}>
            <div ref={mouseRef} className={`fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none blur-[100px] z-0 transition-opacity duration-500 ${isLightMode ? 'opacity-30 mix-blend-multiply' : 'opacity-20 mix-blend-screen'}`} style={{ background: gradient }}></div>

            <div className="w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl border relative z-10 backdrop-blur-md" style={{ background: isLightMode ? 'rgba(255,255,255,0.7)' : 'rgba(26, 5, 36, 0.7)', borderColor: theme.borderColor }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg text-white transform hover:scale-110 transition-transform duration-300" style={{ background: gradient }}><Lock size={32} /></div>

                <h2 className="text-3xl font-black text-center mb-2 tracking-tight" style={{ color: theme.textPrimary }}>Staff Access</h2>
                <p className="text-center text-xs font-bold uppercase tracking-widest opacity-50 mb-8" style={{ color: theme.textSecondary }}>Área Exclusiva</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <input type="email" required placeholder="Seu e-mail de staff"
                            className="w-full p-5 rounded-2xl border outline-none font-bold transition-all focus:scale-[1.02] focus:shadow-lg"
                            style={{ borderColor: theme.borderColor, color: theme.textPrimary, background: theme.inputBg }}
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <button disabled={loading} className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-all hover:brightness-110" style={{ background: gradient }}>
                        {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'ACESSAR'}
                    </button>
                </form>

                {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 text-red-500 text-center text-sm font-bold flex items-center gap-2 justify-center animate-pulse"><AlertCircle size={16} />{error}</div>}

                <Link to="/ekklesia" className="flex items-center justify-center gap-2 mt-8 text-xs font-bold opacity-50 hover:opacity-100 transition-opacity" style={{ color: theme.textPrimary }}>
                    <ArrowLeft size={12} /> Voltar ao Início
                </Link>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (ROTEADOR DE DEPARTAMENTOS) ---
export const EkklesiaStaff = ({ isLightMode }: { isLightMode: boolean }) => {
    const [staffUser, setStaffUser] = useState<any>(() => {
        const s = localStorage.getItem('ekklesia_staff_user');
        return s ? JSON.parse(s) : null;
    });

    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [toasts, setToasts] = useState<any[]>([]);

    const theme = getTheme(isLightMode);

    // Carrega Locais ao logar
    useEffect(() => {
        if (staffUser) {
            api.getCheckpoints().then((data: any) => {
                setCheckpoints(data);
                // Tenta selecionar o local automaticamente baseado no departamento
                if (data.length > 0 && staffUser.department) {
                    const dept = staffUser.department.toUpperCase();
                    const match = data.find((c: any) => {
                        const name = c.name.toUpperCase();
                        if (dept === 'KIDS' && name.includes('KIDS')) return true;
                        if (dept === 'RECEPTION' && (name.includes('RECEP') || name.includes('ENTRADA'))) return true;
                        if (dept === 'EVANGELISM' && name.includes('KOMBI')) return true;
                        if ((dept === 'PRAYER' || dept === 'PROPHETIC') && (name.includes('TENDA') || name.includes('PROFETICA') || name.includes('MARTIRES'))) return true;
                        if (dept === 'STORE' && (name.includes('CANTINA') || name.includes('LIVRARIA') || name.includes('PSALMS'))) return true;
                        return false;
                    });
                    if (match) setSelectedSpot(match.id);
                }
            }).catch(console.error);
        }
    }, [staffUser]);

    const addToast = (msg: string, type: 'success' | 'error' | 'warning') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const handleLogout = () => {
        setStaffUser(null);
        localStorage.removeItem('ekklesia_staff_user');
    };

    const handleCount = async (payload: any, label: string) => {
        if (!selectedSpot) return addToast("Selecione o Local no topo!", 'error');
        if (navigator.vibrate) navigator.vibrate(50);
        try {
            await api.count({ checkpointId: selectedSpot, quantity: 1, ...payload });
            addToast(label, 'success');
        } catch (e) {
            addToast("Erro de conexão", 'error');
        }
    };

    if (!staffUser) return <StaffLogin onLogin={(user: any) => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    // Props comuns para todas as telas
    const commonProps = {
        user: staffUser,
        checkpoints,
        selectedSpot,
        setSelectedSpot,
        handleCount,
        onLogout: handleLogout,
        theme,
        addToast
    };

    const dept = staffUser.department?.toUpperCase();

    return (
        <div className="h-full">
            {/* TOASTS FLUTUANTES */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none w-auto">
                {toasts.map(t => <div key={t.id} className="pointer-events-auto"><Toast msg={t.msg} type={t.type} /></div>)}
            </div>

            {/* ROTEAMENTO CONDICIONAL */}
            {dept === 'CONSOLIDATION' ? <ConsolidationScreen {...commonProps} /> :
                dept === 'KIDS' ? <KidsScreen {...commonProps} /> :
                    dept === 'RECEPTION' ? <ReceptionScreen {...commonProps} /> :
                        (dept === 'PRAYER' || dept === 'PROPHETIC') ? <PrayerScreen {...commonProps} /> :
                            (dept === 'STORE' || dept === 'CANTINA') ? <StoreScreen {...commonProps} /> : // <--- A TELA COMPLETA DE VENDAS/AUDITORIA
                                <EvangelismScreen {...commonProps} />}
        </div>
    );
};