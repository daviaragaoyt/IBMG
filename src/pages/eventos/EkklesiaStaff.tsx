import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle, AlertTriangle, XCircle, QrCode, UserPlus,
    MapPin, ArrowLeft, Users, MousePointerClick, Plus, LogOut, ChevronDown, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- TEMA (Visual Premium) ---
const getTheme = (isLightMode: boolean) => ({
    gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
    bg: isLightMode ? '#FFFFFF' : '#0F0014',
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#666666' : '#AAAAAA',
    borderColor: isLightMode ? '#F3F4F6' : '#2D0A3D',
    inputBg: isLightMode ? '#F9FAFB' : '#2D0A3D',
    inputBorder: isLightMode ? '#E5E7EB' : '#4B1E63',
    tabActive: isLightMode ? '#A800E0' : '#FFFFFF',
    tabInactive: isLightMode ? '#9CA3AF' : '#6B7280',
});

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
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-sans transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20 blur-[120px] pointer-events-none" style={{ background: theme.gradient }}></div>
            <div className="w-full max-w-sm p-8 rounded-[2rem] shadow-2xl relative z-10 animate-fade-in border" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg" style={{ background: theme.gradient }}><Lock size={32} /></div>
                <h2 className="text-3xl font-black text-center mb-2 tracking-tight">Staff Access</h2>
                <form onSubmit={handleLogin} className="space-y-4 mt-8">
                    <input type="email" required placeholder="Seu e-mail cadastrado" className="w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-[#A800E0]" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }} value={email} onChange={e => setEmail(e.target.value)} />
                    <button disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:brightness-110 transition-all transform hover:-translate-y-1 disabled:opacity-50" style={{ background: theme.gradient }}>{loading ? 'Verificando...' : 'ENTRAR'}</button>
                </form>
                {error && <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-xl text-center font-bold text-sm border border-red-500/20">{error}</div>}
                <Link to="/ekklesia" className="block text-center mt-6 text-sm hover:underline opacity-50 hover:opacity-100 transition-opacity">Voltar para Home</Link>
            </div>
        </div>
    );
};

// --- PAINEL PRINCIPAL ---
interface EventoProps { isLightMode: boolean; }

export const EkklesiaStaff = ({ isLightMode }: EventoProps) => {
    const [staffUser, setStaffUser] = useState<any>(() => {
        const saved = localStorage.getItem('ekklesia_staff_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [mode, setMode] = useState<'COUNTER' | 'SCAN' | 'REGISTER'>('COUNTER');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [churches, setChurches] = useState<string[]>([]);

    // Seleções
    const [selectedSpot, setSelectedSpot] = useState('');
    const [selectedChurch, setSelectedChurch] = useState('Ibmg Sede');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('ADULTO');

    // Estados
    const [feedback, setFeedback] = useState<any>(null);
    const [pauseScan, setPauseScan] = useState(false);

    // Cadastro
    const [regName, setRegName] = useState('');
    const [regType, setRegType] = useState('VISITOR');
    const [regAge, setRegAge] = useState('');
    const [loadingReg, setLoadingReg] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    useEffect(() => {
        if (staffUser) {
            fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(setCheckpoints).catch(console.error);
            fetch(`${API_URL}/config/churches`).then(res => res.json()).then(setChurches).catch(console.error);
        }
    }, [staffUser]);

    const handleLogout = () => {
        setStaffUser(null);
        localStorage.removeItem('ekklesia_staff_user');
    };

    // 1. CONTADOR
    const handleCount = async (type: 'MEMBER' | 'VISITOR') => {
        if (!selectedSpot) return alert("⚠️ Selecione a ÁREA primeiro!");
        if (navigator.vibrate) navigator.vibrate(50);

        try {
            const res = await fetch(`${API_URL}/count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkpointId: selectedSpot,
                    type,
                    church: selectedChurch,
                    ageGroup: selectedAgeGroup,
                    quantity: 1
                })
            });

            if (res.ok) {
                const id = Date.now();
                const ageLabel = selectedAgeGroup === 'CRIANCA' ? 'Criança' : selectedAgeGroup === 'JOVEM' ? 'Jovem' : 'Adulto';
                setFeedback({ id, msg: `+1 ${ageLabel} ${type === 'MEMBER' ? 'Membro' : 'Visitante'}`, status: 'SUCCESS' });
                setTimeout(() => setFeedback(null), 1500);
            }
        } catch (error) { alert("Erro de conexão."); }
    };

    // 2. SCANNER
    const handleTrack = async (id: string) => {
        if (!selectedSpot) return alert("⚠️ Selecione a ÁREA na aba Contador antes de bipar!");
        setPauseScan(true);
        try {
            const res = await fetch(`${API_URL}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personId: id, checkpointId: selectedSpot })
            });
            const data = await res.json();
            setFeedback({ msg: data.message, status: data.status });
        } catch (err) { setFeedback({ msg: "Erro de conexão", status: "ERROR" }); }
        setTimeout(() => { setFeedback(null); setPauseScan(false); }, 2500);
    };

    // 3. CADASTRO
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpot) return alert("Selecione a área primeiro.");
        setLoadingReg(true);
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: regName,
                    type: regType,
                    church: selectedChurch,
                    age: regAge
                })
            });
            if (res.ok) {
                const newUser = await res.json();
                await handleTrack(newUser.id);
                setRegName(''); setRegType('VISITOR'); setRegAge('');
                alert("✅ Cadastro realizado!");
            }
        } catch (e) { alert("Erro ao cadastrar"); }
        finally { setLoadingReg(false); }
    };

    if (!staffUser) return <StaffLogin onLogin={user => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    return (
        <div className="min-h-screen w-full font-sans flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>

            {/* HEADER */}
            <div className="px-6 py-6 pb-12 shadow-2xl rounded-b-[2.5rem] relative z-20 flex justify-between items-start" style={{ background: theme.gradient }}>
                <div className="flex items-center gap-3">
                    <Link to="/ekklesia" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all text-white"><ArrowLeft size={20} /></Link>
                    <div>
                        <h1 className="text-white font-black text-xl tracking-tight leading-none">STAFF AREA</h1>
                        <p className="text-white/80 text-xs mt-1 font-medium">Olá, {staffUser.name.split(' ')[0]}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white transition-all"><LogOut size={20} /></button>
            </div>

            {/* MENU TABS */}
            <div className="px-6 -mt-8 relative z-30">
                <div className="flex bg-white rounded-2xl shadow-xl p-2 justify-between" style={{ backgroundColor: theme.cardBg }}>
                    {[
                        { id: 'COUNTER', icon: <MousePointerClick size={20} />, label: 'Contador' },
                        { id: 'SCAN', icon: <QrCode size={20} />, label: 'Scanner' },
                        { id: 'REGISTER', icon: <UserPlus size={20} />, label: 'Cadastro' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setMode(tab.id as any)}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${mode === tab.id ? 'bg-gray-100' : 'opacity-50 hover:opacity-80'}`}
                            style={{ color: mode === tab.id ? theme.tabActive : theme.tabInactive, backgroundColor: mode === tab.id ? (isLightMode ? '#F3F4F6' : '#2D0A3D') : 'transparent' }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="flex-1 p-6 overflow-y-auto pb-24">

                {/* === ABA CONTADOR === */}
                {mode === 'COUNTER' && (
                    <div className="flex flex-col gap-5 animate-fade-in max-w-md mx-auto">
                        {/* Seletores estilizados */}
                        <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                                <select
                                    className="w-full p-4 pl-12 bg-transparent font-bold text-lg outline-none appearance-none"
                                    value={selectedSpot}
                                    onChange={e => setSelectedSpot(e.target.value)}
                                    style={{ color: theme.textPrimary }}
                                >
                                    <option value="" className="text-gray-900 bg-white">📍 Selecione o Local...</option>
                                    {checkpoints.map((cp: any) => (
                                        <option key={cp.id} value={cp.id} className="text-gray-900 bg-white">{cp.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                            </div>

                            <div className="h-[1px] w-full bg-gray-200/20"></div>

                            <div className="relative">
                                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                                <select
                                    className="w-full p-4 pl-12 bg-transparent font-bold text-lg outline-none appearance-none"
                                    value={selectedChurch}
                                    onChange={e => setSelectedChurch(e.target.value)}
                                    style={{ color: theme.textPrimary }}
                                >
                                    {churches.length > 0 ?
                                        churches.map(c => <option key={c} value={c} className="text-gray-900 bg-white">{c}</option>) :
                                        <option value="Ibmg Sede" className="text-gray-900 bg-white">Ibmg Sede</option>
                                    }
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                            </div>
                        </div>

                        {/* Faixa Etária */}
                        <div className="grid grid-cols-3 gap-2">
                            {['CRIANCA', 'JOVEM', 'ADULTO'].map(age => (
                                <button key={age} onClick={() => setSelectedAgeGroup(age)}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all shadow-sm
                            ${selectedAgeGroup === age ? 'border-[#A800E0] bg-[#A800E0] text-white scale-105' : 'border-gray-200/50 opacity-60'}`}
                                    style={{ borderColor: selectedAgeGroup !== age ? theme.borderColor : undefined }}>
                                    {age === 'CRIANCA' ? 'Criança' : age === 'JOVEM' ? 'Jovem' : 'Adulto'}
                                </button>
                            ))}
                        </div>

                        {/* Botões de Ação */}
                        {selectedSpot ? (
                            <div className="grid grid-cols-1 gap-4 mt-2">
                                <button onClick={() => handleCount('VISITOR')}
                                    className="group h-36 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center transition-all active:scale-95 hover:brightness-110 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF9966] to-[#FF5E62]"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <Plus size={48} className="text-white mb-1 drop-shadow-md" />
                                        <span className="text-4xl font-black text-white drop-shadow-md tracking-tight">VISITANTE</span>
                                        <span className="text-white/90 text-[10px] mt-2 font-bold bg-black/10 px-4 py-1 rounded-full uppercase">
                                            {selectedAgeGroup === 'CRIANCA' ? 'Criança' : selectedAgeGroup === 'JOVEM' ? 'Jovem' : 'Adulto'} • {selectedChurch}
                                        </span>
                                    </div>
                                </button>

                                <button onClick={() => handleCount('MEMBER')}
                                    className="group h-24 rounded-[2.5rem] shadow-lg flex flex-col items-center justify-center transition-all active:scale-95 hover:brightness-105 border-2"
                                    style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                                    <span className="text-2xl font-black" style={{ color: theme.textPrimary }}>MEMBRO</span>
                                    <span className="text-xs opacity-50 mt-1 font-medium">Registro de {selectedAgeGroup === 'CRIANCA' ? 'Criança' : selectedAgeGroup === 'JOVEM' ? 'Jovem' : 'Adulto'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-8 opacity-40 border-2 border-dashed rounded-[2rem]" style={{ borderColor: theme.borderColor }}>
                                <AlertTriangle className="mx-auto mb-2" size={32} />
                                <p className="font-medium">Selecione o Local para liberar.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === ABA SCANNER === */}
                {mode === 'SCAN' && (
                    <div className="flex flex-col h-full animate-fade-in max-w-md mx-auto items-center justify-center">
                        {!selectedSpot ? <div className="text-center opacity-50">Selecione o local na aba Contador primeiro</div> :
                            !pauseScan ? <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4" style={{ borderColor: theme.tabActive }}><Scanner onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)} /></div> :
                                <div className="h-64 w-full rounded-[2.5rem] flex items-center justify-center font-bold bg-white text-black">Processando...</div>}
                    </div>
                )}

                {/* === ABA CADASTRO === */}
                {mode === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="flex flex-col gap-4 animate-fade-in max-w-md mx-auto p-6 rounded-[2rem] border shadow-sm" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                        <h3 className="font-black text-xl border-b pb-4 mb-2" style={{ borderColor: theme.borderColor }}>Cadastro Completo</h3>

                        <input required className="w-full p-4 rounded-xl font-bold border outline-none focus:border-[#A800E0]" placeholder="Nome Completo" value={regName} onChange={e => setRegName(e.target.value)} style={{ backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.inputBorder }} />
                        <input type="number" required className="w-full p-4 rounded-xl font-bold border outline-none focus:border-[#A800E0]" placeholder="Idade (Ex: 25)" value={regAge} onChange={e => setRegAge(e.target.value)} style={{ backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.inputBorder }} />

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button type="button" onClick={() => setRegType('VISITOR')} className={`p-4 rounded-xl font-bold border-2 transition-all ${regType === 'VISITOR' ? 'border-[#FF3D00] text-[#FF3D00] bg-[#FF3D00]/10' : 'opacity-50'}`} style={{ borderColor: regType !== 'VISITOR' ? theme.inputBorder : undefined }}>VISITANTE</button>
                            <button type="button" onClick={() => setRegType('MEMBER')} className={`p-4 rounded-xl font-bold border-2 transition-all ${regType === 'MEMBER' ? 'border-[#A800E0] text-[#A800E0] bg-[#A800E0]/10' : 'opacity-50'}`} style={{ borderColor: regType !== 'MEMBER' ? theme.inputBorder : undefined }}>MEMBRO</button>
                        </div>

                        <button type="submit" disabled={loadingReg || !selectedSpot} className="w-full py-5 rounded-xl text-white font-bold text-lg shadow-lg mt-4" style={{ background: theme.gradient }}>{loadingReg ? 'Salvando...' : 'CADASTRAR'}</button>
                    </form>
                )}

                {/* FEEDBACK */}
                {feedback && (
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                        <div className={`px-8 py-5 rounded-[2rem] shadow-2xl text-white font-black text-xl flex items-center gap-3 border-4 ${feedback.status === 'ERROR' ? 'bg-red-500 border-red-300' : 'bg-[#A800E0] border-[#dcb0ff]'}`}>
                            {feedback.status === 'ERROR' ? <XCircle size={28} /> : <CheckCircle size={28} />} {feedback.msg}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};