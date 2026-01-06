import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle2, XCircle, QrCode, UserPlus, MapPin, ArrowLeft,
    Users, MousePointerClick, Plus, LogOut, ChevronDown, Lock, Baby, User, UserCheck, LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- TEMA ---
const getTheme = (isLightMode: boolean) => ({
    gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
    bg: isLightMode ? '#F3F4F6' : '#0F0014', // Fundo mais clean
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#666666' : '#AAAAAA',
    borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D',
    activeBorder: '#A800E0',
});

// --- COMPONENTE TOAST (NOTIFICAÇÃO ELEGANTE) ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Inicia a saída um pouco antes do tempo total (3000ms)
        const exitTimer = setTimeout(() => setIsExiting(true), 2600);
        // Remove o componente do DOM após a animação de saída terminar
        const closeTimer = setTimeout(onClose, 3000);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(closeTimer);
        };
    }, [onClose]);

    return (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border-l-4 transition-all
            ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
            ${type === 'success' ? 'bg-white/90 border-green-500 text-gray-800' : 'bg-white/90 border-red-500 text-gray-800'}`}>
            {type === 'success' ? <CheckCircle2 className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
            <div>
                <h4 className="font-bold text-sm uppercase tracking-wider">{type === 'success' ? 'Sucesso' : 'Erro'}</h4>
                <p className="font-medium text-sm text-gray-600">{msg}</p>
            </div>
        </div>
    );
};

// --- LOGIN ---
const StaffLogin = ({ onLogin, isLightMode }: { onLogin: (user: any) => void, isLightMode: boolean }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) onLogin(data);
            else setError(data.error || 'Acesso negado.');
        } catch (err) { setError('Erro de conexão.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-sans" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="w-full max-w-sm p-8 rounded-[2rem] shadow-xl relative z-10 border bg-white/5 backdrop-blur-sm" style={{ borderColor: theme.borderColor }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg" style={{ background: theme.gradient }}><Lock size={28} /></div>
                <h2 className="text-2xl font-black text-center mb-6 tracking-tight">Staff Access</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" required placeholder="Seu e-mail" className="w-full p-4 rounded-xl border outline-none font-medium focus:border-purple-500 transition-all bg-transparent" style={{ borderColor: theme.borderColor }} value={email} onChange={e => setEmail(e.target.value)} />
                    <button disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all" style={{ background: theme.gradient }}>{loading ? 'Entrando...' : 'ACESSAR'}</button>
                </form>
                {error && <p className="mt-4 text-red-500 text-center text-sm font-bold">{error}</p>}
                <Link to="/ekklesia" className="block text-center mt-6 text-xs opacity-50 hover:opacity-100">Voltar</Link>
            </div>
        </div>
    );
};
export const EkklesiaStaff = ({ isLightMode }: { isLightMode: boolean }) => {
    const [staffUser, setStaffUser] = useState<any>(() => {
        const saved = localStorage.getItem('ekklesia_staff_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [mode, setMode] = useState<'COUNTER' | 'SCAN' | 'REGISTER'>('COUNTER');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [churches, setChurches] = useState<string[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [selectedChurch, setSelectedChurch] = useState('Ibmg Sede');
    const [regSource, setRegSource] = useState('');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('ADULTO');
    const [selectedGender, setSelectedGender] = useState('M'); // NOVO: Gênero

    const [toasts, setToasts] = useState<any[]>([]); // Sistema de Toasts
    const [pauseScan, setPauseScan] = useState(false);

    const [regName, setRegName] = useState('');
    const [regAge, setRegAge] = useState('');
    const [regPhone, setRegPhone] = useState(''); // Novo: WhatsApp
    const [regType, setRegType] = useState('VISITOR');
    const [regGender, setRegGender] = useState('M'); // Novo: Gênero
    const [regChurch, setRegChurch] = useState('Ibmg Sede'); // Novo: Igreja
    const [regIsStaff, setRegIsStaff] = useState(false);
    const [loadingReg, setLoadingReg] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    useEffect(() => {
        if (staffUser) {
            fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(setCheckpoints).catch(console.error);
            fetch(`${API_URL}/config/churches`).then(res => res.json()).then(setChurches).catch(console.error);
        }
    }, [staffUser]);

    const addToast = (msg: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleLogout = () => {
        setStaffUser(null);
        localStorage.removeItem('ekklesia_staff_user');
    };

    // 1. CONTADOR MANUAL (AGORA COM GÊNERO)
    const handleCount = async (type: 'MEMBER' | 'VISITOR') => {
        if (!selectedSpot) return addToast("Selecione o Local primeiro!", 'error');

        try {
            const res = await fetch(`${API_URL}/count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkpointId: selectedSpot,
                    type,
                    church: selectedChurch,
                    ageGroup: selectedAgeGroup,
                    gender: selectedGender, // <--- Enviando Gênero
                    quantity: 1
                })
            });

            if (res.ok) {
                const genderLabel = selectedGender === 'M' ? 'Homem' : 'Mulher';
                const ageLabel = selectedAgeGroup === 'CRIANCA' ? 'Criança' : selectedAgeGroup === 'JOVEM' ? 'Jovem' : 'Adulto';
                addToast(`+1 ${genderLabel} ${ageLabel} (${type === 'MEMBER' ? 'Membro' : 'Visitante'})`, 'success');
            }
        } catch (error) { addToast("Erro de conexão.", 'error'); }
    };

    // 2. SCANNER
    const handleTrack = async (id: string) => {
        if (!selectedSpot) return addToast("Selecione o Local antes de bipar!", 'error');
        setPauseScan(true);
        try {
            const res = await fetch(`${API_URL}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personId: id, checkpointId: selectedSpot })
            });
            const data = await res.json();
            addToast(data.message, data.status === 'SUCCESS' ? 'success' : 'error');
        } catch (err) { addToast("Erro de conexão", 'error'); }
        setTimeout(() => { setPauseScan(false); }, 2500);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpot) return addToast("Selecione o local primeiro.", 'error');

        setLoadingReg(true);
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: regName,
                    type: regType,
                    church: regChurch,
                    age: regAge,
                    gender: regGender,
                    phone: regPhone,
                    isStaff: regIsStaff,
                    marketingSource: regSource // <--- ADICIONE ISTO AQUI
                })
            });

            if (res.ok) {
                const newUser = await res.json();
                await handleTrack(newUser.id);

                // Limpa tudo
                setRegName('');
                setRegAge('');
                setRegPhone('');
                setRegSource(''); // <--- LIMPA A ORIGEM TAMBÉM
                setRegIsStaff(false);

                addToast("Cadastro realizado com sucesso!", 'success');
            }
        } catch (e) { addToast("Erro ao cadastrar", 'error'); }
        finally { setLoadingReg(false); }
    };

    if (!staffUser) return <StaffLogin onLogin={user => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    return (
        <div className="min-h-screen w-full font-sans flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>

            {/* TOAST CONTAINER */}
            <div className="fixed top-0 right-0 p-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} />
                    </div>
                ))}
            </div>

            {/* HEADER FIXO */}
            <div className="px-6 py-6 pb-12 shadow-sm relative z-20 flex justify-between items-start" style={{ background: theme.cardBg }}>

                {/* Lado Esquerdo: Voltar e Info do Usuário */}
                <div className="flex items-center gap-3">
                    <Link to="/ekklesia" className="p-2 rounded-full hover:bg-gray-100 transition-all"><ArrowLeft size={20} /></Link>
                    <div>
                        <h1 className="font-black text-xl tracking-tight leading-none">STAFF AREA</h1>
                        <p className="text-xs opacity-60 mt-1 font-medium">Olá, {staffUser.name.split(' ')[0]}</p>
                    </div>
                </div>

                {/* Lado Direito: Botões de Ação */}
                <div className="flex items-center gap-2">

                    {/* NOVO: BOTÃO DASHBOARD */}
                    <Link to="/ekklesia/dashboard"
                        className="p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all flex items-center gap-2 shadow-sm border border-purple-100">
                        <LayoutDashboard size={20} />
                        <span className="text-xs font-bold hidden sm:block">Dashboard</span>
                    </Link>

                    {/* BOTÃO LOGOUT (Mantido) */}
                    <button onClick={handleLogout} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all shadow-sm border border-red-100">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-30">
                <div className="flex rounded-2xl shadow-xl p-1.5 justify-between border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                    {[
                        { id: 'COUNTER', icon: <MousePointerClick size={18} />, label: 'Contador' },
                        { id: 'SCAN', icon: <QrCode size={18} />, label: 'Scanner' },
                        { id: 'REGISTER', icon: <UserPlus size={18} />, label: 'Novo' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setMode(tab.id as any)}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all
                    ${mode === tab.id ? 'shadow-md' : 'opacity-60 hover:opacity-100 hover:bg-gray-50'}`}
                            style={{
                                color: mode === tab.id ? 'white' : theme.textPrimary,
                                background: mode === tab.id ? theme.gradient : 'transparent'
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto pb-24 max-w-lg mx-auto w-full">

                {/* === ABA CONTADOR (REDESENHADA) === */}
                {mode === 'COUNTER' && (
                    <div className="flex flex-col gap-5 animate-fade-in">

                        {/* 1. SELETORES GERAIS */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                <select className="w-full p-4 pl-12 rounded-xl border bg-white font-bold outline-none appearance-none shadow-sm text-gray-800"
                                    value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}>
                                    <option value="">Selecione o Local...</option>
                                    {checkpoints.map((cp: any) => (<option key={cp.id} value={cp.id}>{cp.name}</option>))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                <select className="w-full p-4 pl-12 rounded-xl border bg-white font-bold outline-none appearance-none shadow-sm text-gray-800"
                                    value={selectedChurch} onChange={e => setSelectedChurch(e.target.value)}>
                                    {churches.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <hr className="border-gray-200/50" />

                        {/* 2. DADOS ESPECÍFICOS (GÊNERO E IDADE) */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Gênero */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase opacity-50 ml-1">Gênero</label>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                    {['M', 'F'].map(g => (
                                        <button key={g} onClick={() => setSelectedGender(g)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${selectedGender === g ? 'bg-white shadow text-black' : 'text-gray-400'}`}>
                                            {g === 'M' ? 'HOMEM' : 'MULHER'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Idade */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase opacity-50 ml-1">Faixa Etária</label>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { id: 'CRIANCA', icon: <Baby size={16} /> },
                                        { id: 'JOVEM', icon: <User size={16} /> },
                                        { id: 'ADULTO', icon: <UserCheck size={16} /> }
                                    ].map(a => (
                                        <button key={a.id} onClick={() => setSelectedAgeGroup(a.id)}
                                            className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${selectedAgeGroup === a.id ? 'bg-white shadow text-black' : 'text-gray-400'}`}>
                                            {a.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. BOTÕES DE AÇÃO (GRANDES) */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <button onClick={() => handleCount('VISITOR')} disabled={!selectedSpot}
                                className="group h-32 rounded-[2rem] shadow-lg flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden bg-white border border-gray-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <Plus size={32} className="text-orange-500 mb-2" />
                                <span className="text-2xl font-black text-gray-800">VISITANTE</span>
                                <span className="text-[10px] font-bold text-orange-500 uppercase mt-1 tracking-widest">
                                    {selectedGender === 'M' ? 'Homem' : 'Mulher'} • {selectedAgeGroup}
                                </span>
                            </button>

                            <button onClick={() => handleCount('MEMBER')} disabled={!selectedSpot}
                                className="group h-32 rounded-[2rem] shadow-lg flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden bg-white border border-gray-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <CheckCircle2 size={32} className="text-purple-600 mb-2" />
                                <span className="text-2xl font-black text-gray-800">MEMBRO</span>
                                <span className="text-[10px] font-bold text-purple-600 uppercase mt-1 tracking-widest">
                                    {selectedGender === 'M' ? 'Homem' : 'Mulher'} • {selectedAgeGroup}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* === ABA SCANNER === */}
                {mode === 'SCAN' && (
                    <div className="flex flex-col h-full animate-fade-in items-center justify-center">
                        {!selectedSpot ? <div className="text-center opacity-50 font-medium">Selecione o local na aba Contador primeiro</div> :
                            !pauseScan ? <div className="aspect-square w-full rounded-[2rem] overflow-hidden shadow-2xl bg-black border-4 border-purple-500"><Scanner onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)} /></div> :
                                <div className="h-64 w-full rounded-[2rem] flex flex-col items-center justify-center font-bold bg-white text-black shadow-xl">
                                    <CheckCircle2 size={48} className="text-green-500 mb-4 animate-bounce" />
                                    Processando...
                                </div>}
                    </div>
                )}


                {mode === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="flex flex-col gap-4 animate-fade-in p-6 rounded-[2rem] bg-white shadow-sm border border-gray-100">
                        <h3 className="font-black text-xl text-gray-800 mb-2">Novo Participante</h3>

                        {/* 1. Nome e Idade (Lado a Lado para economizar espaço) */}
                        <div className="flex gap-3">
                            <input required className="flex-1 p-4 rounded-xl font-bold border outline-none focus:border-purple-500 bg-gray-50 text-gray-900"
                                placeholder="Nome Completo" value={regName} onChange={e => setRegName(e.target.value)} />
                            <input type="number" required className="w-24 p-4 rounded-xl font-bold border outline-none focus:border-purple-500 bg-gray-50 text-gray-900 text-center"
                                placeholder="Idade" value={regAge} onChange={e => setRegAge(e.target.value)} />
                        </div>

                        {/* 2. Gênero e Igreja */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Botões de Gênero Rápidos */}
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {['M', 'F'].map(g => (
                                    <button key={g} type="button" onClick={() => setRegGender(g)}
                                        className={`flex-1 py-3 rounded-lg text-xs font-black transition-all 
                                ${regGender === g ? 'bg-white shadow text-black' : 'text-gray-400'}`}>
                                        {g === 'M' ? 'HOMEM' : 'MULHER'}
                                    </button>
                                ))}
                            </div>

                            {/* Dropdown de Igreja (Pega da lista automática) */}
                            <div className="relative">
                                <select className="w-full h-full p-2 pl-4 rounded-xl border bg-white font-bold text-sm outline-none appearance-none text-gray-800"
                                    value={regChurch} onChange={e => setRegChurch(e.target.value)}>
                                    {churches.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={14} />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button type="button" onClick={() => setRegType('VISITOR')}
                                className={`p-3 rounded-xl font-bold border-2 transition-all ${regType === 'VISITOR' ? 'border-orange-500 text-orange-500 bg-orange-50' : 'border-gray-200 text-gray-400'}`}>
                                VISITANTE
                            </button>
                            <button type="button" onClick={() => setRegType('MEMBER')}
                                className={`p-3 rounded-xl font-bold border-2 transition-all ${regType === 'MEMBER' ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-400'}`}>
                                MEMBRO
                            </button>
                        </div>


                        {regType === 'VISITOR' && (
                            <div className="animate-fade-in">
                                <input className="w-full p-4 rounded-xl font-bold border-2 border-orange-100 outline-none focus:border-orange-500 bg-orange-50/50 text-gray-900 placeholder-orange-300"
                                    placeholder="WhatsApp (DDD + Número)" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                            </div>
                        )}

                        <div className="mt-3">
                            <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block">Como conheceu o evento?</label>


                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    'Instagram',
                                    'WhatsApp',
                                    'Amigo/Convite',
                                    'Faixa / Rua',
                                    'Pastor / Líder',
                                    'Youtube / Tiktok',
                                    'Google / Site',
                                    'Outros'
                                ].map(src => (
                                    <button key={src} type="button" onClick={() => setRegSource(src)}
                                        className={`p-2 rounded-lg text-[10px] md:text-xs font-bold border transition-all truncate
                ${regSource === src
                                                ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                                                : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                                        {src}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={loadingReg || !selectedSpot} className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg mt-2 hover:brightness-110" style={{ background: theme.gradient }}>
                            {loadingReg ? 'Salvando...' : 'CADASTRAR'}
                        </button>

                    </form>
                )}
            </div>
        </div>
    );
};