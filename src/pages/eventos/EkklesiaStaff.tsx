import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle2, XCircle, QrCode, UserPlus, MapPin, ArrowLeft,
    Users, MousePointerClick, Plus, LogOut, ChevronDown, Lock, Baby, User, UserCheck, LayoutDashboard,
    FileWarning, Save, AlertTriangle, Search, RefreshCw, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- TEMA ATUALIZADO ---
const getTheme = (isLightMode: boolean) => ({
    gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
    bg: isLightMode ? '#F3F4F6' : '#0F0014',
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#666666' : '#9CA3AF',
    borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D',
    inputBg: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
    inputBorder: isLightMode ? '#E5E7EB' : '#2D0A3D',
    toggleBg: isLightMode ? '#F3F4F6' : 'rgba(0,0,0,0.3)',
    chipBg: isLightMode ? '#F3F4F6' : 'rgba(255,255,255,0.05)',
});

// --- MÁSCARA CELULAR ---
const formatPhone = (value: string) => {
    if (!value) return "";
    let r = value.replace(/\D/g, "");
    r = r.slice(0, 11);
    if (r.length > 6) {
        r = r.replace(/^(\d\d)(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    }
    return r;
};

// --- TOAST ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border-l-4 animate-slide-in-right
            ${type === 'success' ? 'bg-white/90 border-green-500 text-gray-800' : 'bg-white/90 border-red-500 text-gray-800'}`}>
            {type === 'success' ? <CheckCircle2 className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
            <div>
                <h4 className="font-bold text-sm uppercase">{type === 'success' ? 'Sucesso' : 'Erro'}</h4>
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
        <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="w-full max-w-sm p-8 rounded-[2rem] shadow-xl border bg-white/5 backdrop-blur-sm" style={{ borderColor: theme.borderColor }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg" style={{ background: theme.gradient }}><Lock size={28} /></div>
                <h2 className="text-2xl font-black text-center mb-6">Staff Access</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" required placeholder="Seu e-mail" className="w-full p-4 rounded-xl border outline-none font-medium bg-transparent" style={{ borderColor: theme.borderColor }} value={email} onChange={e => setEmail(e.target.value)} />
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

    const [mode, setMode] = useState<'COUNTER' | 'SCAN' | 'REGISTER' | 'CLEANUP'>('COUNTER');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [churches, setChurches] = useState<string[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [selectedChurch, setSelectedChurch] = useState('Ibmg Sede');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('ADULTO');
    const [selectedGender, setSelectedGender] = useState('M');

    const [toasts, setToasts] = useState<any[]>([]);
    const [pauseScan, setPauseScan] = useState(false);

    // STATES DE CADASTRO
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState(''); // <--- NOVO STATE EMAIL
    const [regAge, setRegAge] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regType, setRegType] = useState('VISITOR');
    const [regGender, setRegGender] = useState('M');
    const [regChurch, setRegChurch] = useState('Ibmg Sede');
    const [regSource, setRegSource] = useState('');
    const [regIsStaff, setRegIsStaff] = useState(false);
    const [loadingReg, setLoadingReg] = useState(false);

    // STATES DE BUSCA E SANEAMENTO
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [incompleteList, setIncompleteList] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [personToUpdate, setPersonToUpdate] = useState<any>(null);

    // States temporários para edição
    const [editAge, setEditAge] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editSource, setEditSource] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    useEffect(() => {
        if (staffUser) {
            fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(setCheckpoints).catch(console.error);
            fetch(`${API_URL}/config/churches`).then(res => res.json()).then(setChurches).catch(console.error);
        }
    }, [staffUser]);

    useEffect(() => {
        if (mode === 'CLEANUP') fetchIncomplete();
    }, [mode]);

    useEffect(() => {
        if (searchTerm.length < 3) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`${API_URL}/people?search=${searchTerm}`);
                const data = await res.json();
                setSearchResults(data);
            } catch (e) { console.error(e); }
            finally { setSearching(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const addToast = (msg: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
    };
    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
    const handleLogout = () => { setStaffUser(null); localStorage.removeItem('ekklesia_staff_user'); };

    // --- FUNÇÕES ---
    const fetchIncomplete = async () => {
        try {
            const res = await fetch(`${API_URL}/people/incomplete`);
            const data = await res.json();
            setIncompleteList(data);
        } catch (e) { console.error(e); }
    };

    const startEdit = (p: any) => {
        setEditingId(p.id);
        setEditAge(p.age || ''); setEditPhone(p.phone || ''); setEditGender(p.gender || ''); setEditSource(p.marketingSource || '');
    };

    const saveEdit = async (id: string, isModal = false) => {
        try {
            await fetch(`${API_URL}/person/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ age: editAge, phone: editPhone, gender: editGender, marketingSource: editSource })
            });
            if (isModal) {
                addToast("Cadastro completado e liberado! ✅", 'success');
                setShowUpdateModal(false); setPersonToUpdate(null); setPauseScan(false);
            } else {
                addToast("Atualizado!", 'success');
                setEditingId(null); fetchIncomplete();
            }
        } catch (e) { addToast("Erro ao salvar", 'error'); }
    };

    const handleCount = async (type: 'MEMBER' | 'VISITOR') => {
        if (!selectedSpot) return addToast("Selecione o Local primeiro!", 'error');
        try {
            const res = await fetch(`${API_URL}/count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkpointId: selectedSpot, type, church: selectedChurch, ageGroup: selectedAgeGroup, gender: selectedGender, quantity: 1 })
            });
            if (res.ok) addToast(`+1 ${type === 'MEMBER' ? 'Membro' : 'Visitante'} Adicionado`, 'success');
        } catch (error) { addToast("Erro de conexão.", 'error'); }
    };

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
            if (data.status === 'SUCCESS' || data.status === 'REENTRY') {
                const p = data.person;
                if (!p.gender || !p.marketingSource || !p.age) {
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    setPersonToUpdate(p); setEditAge(p.age || ''); setEditPhone(p.phone || ''); setEditGender(p.gender || ''); setEditSource(p.marketingSource || '');
                    setShowUpdateModal(true);
                } else { addToast(data.message, 'success'); }
            } else { addToast("Erro desconhecido", 'error'); }
        } catch (err) { addToast("Erro de conexão", 'error'); }
        if (!showUpdateModal) setTimeout(() => { if (!showUpdateModal) setPauseScan(false); }, 2500);
    };

    // --- 3. CADASTRO COM EMAIL ---
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
                    email: regEmail, // <--- ENVIANDO EMAIL
                    type: regType, church: regChurch, age: regAge, gender: regGender,
                    phone: regPhone, marketingSource: regSource, isStaff: regIsStaff
                })
            });
            if (res.ok) {
                const newUser = await res.json();
                await handleTrack(newUser.id);
                // Limpa form
                setRegName(''); setRegEmail(''); setRegAge(''); setRegPhone(''); setRegSource(''); setRegIsStaff(false);
                addToast("Cadastro realizado!", 'success');
            } else {
                const err = await res.json();
                // Verifica se é erro de email duplicado
                if (err.details && err.details.includes('Unique constraint')) {
                    addToast("Este E-mail já está cadastrado!", 'error');
                } else {
                    addToast("Erro ao cadastrar.", 'error');
                }
            }
        } catch (e) { addToast("Erro de conexão", 'error'); }
        finally { setLoadingReg(false); }
    };

    if (!staffUser) return <StaffLogin onLogin={user => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    return (
        <div className="min-h-screen w-full font-sans flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>

            {/* TOASTS */}
            <div className="fixed top-0 right-0 p-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => <div key={t.id} className="pointer-events-auto"><Toast msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} /></div>)}
            </div>

            {/* HEADER */}
            <div className="px-6 py-6 pb-12 shadow-sm relative z-20 flex justify-between items-start" style={{ background: theme.cardBg }}>
                <div className="flex items-center gap-3">
                    <Link to="/ekklesia" className="p-2 rounded-full hover:bg-gray-100 transition-all"><ArrowLeft size={20} /></Link>
                    <div><h1 className="font-black text-xl tracking-tight leading-none">STAFF AREA</h1><p className="text-xs opacity-60 mt-1 font-medium">Olá, {staffUser.name.split(' ')[0]}</p></div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/ekklesia/dashboard" className="p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all flex items-center gap-2 shadow-sm border border-purple-100"><LayoutDashboard size={20} /></Link>
                    <button onClick={handleLogout} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all shadow-sm border border-red-100"><LogOut size={20} /></button>
                </div>
            </div>

            {/* NAVEGAÇÃO */}
            <div className="px-6 -mt-8 relative z-30">
                <div className="flex rounded-2xl shadow-xl p-1.5 justify-between border overflow-x-auto" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                    {[
                        { id: 'COUNTER', icon: <MousePointerClick size={16} />, label: 'Contador' },
                        { id: 'SCAN', icon: <QrCode size={16} />, label: 'Scanner' },
                        { id: 'REGISTER', icon: <UserPlus size={16} />, label: 'Novo' },
                        { id: 'CLEANUP', icon: <FileWarning size={16} />, label: 'Pendências' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setMode(tab.id as any)} className={`flex-1 py-3 px-2 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1 transition-all whitespace-nowrap ${mode === tab.id ? 'shadow-md' : 'opacity-60 hover:opacity-100 hover:bg-gray-50'}`} style={{ color: mode === tab.id ? 'white' : theme.textPrimary, background: mode === tab.id ? theme.gradient : 'transparent' }}>{tab.icon} {tab.label}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto pb-24 max-w-lg mx-auto w-full">

                {/* === CONTADOR === */}
                {mode === 'COUNTER' && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                <select className="w-full p-4 pl-12 rounded-xl border bg-white font-bold outline-none appearance-none shadow-sm text-gray-800" value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}>
                                    <option value="" className="text-gray-900 bg-white">Selecione o Local...</option>
                                    {checkpoints.map((cp: any) => (<option key={cp.id} value={cp.id} className="text-gray-900 bg-white">{cp.name}</option>))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                            </div>
                            <div className="relative">
                                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                <select className="w-full p-4 pl-12 rounded-xl border bg-white font-bold outline-none appearance-none shadow-sm text-gray-800" value={selectedChurch} onChange={e => setSelectedChurch(e.target.value)}>
                                    {churches.map(c => <option key={c} value={c} className="text-gray-900 bg-white">{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <hr className="border-gray-200/50" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase opacity-50 ml-1">Gênero</label>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                    {['M', 'F'].map(g => (
                                        <button key={g} onClick={() => setSelectedGender(g)} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${selectedGender === g ? 'bg-white shadow text-black' : 'text-gray-400'}`}>{g === 'M' ? 'HOMEM' : 'MULHER'}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase opacity-50 ml-1">Faixa Etária</label>
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                    {[{ id: 'CRIANCA', icon: <Baby size={16} /> }, { id: 'JOVEM', icon: <User size={16} /> }, { id: 'ADULTO', icon: <UserCheck size={16} /> }].map(a => (
                                        <button key={a.id} onClick={() => setSelectedAgeGroup(a.id)} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${selectedAgeGroup === a.id ? 'bg-white shadow text-black' : 'text-gray-400'}`}>{a.icon}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <button onClick={() => handleCount('VISITOR')} disabled={!selectedSpot} className="group h-32 rounded-[2rem] shadow-lg flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden bg-white border border-gray-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <Plus size={32} className="text-orange-500 mb-2" /><span className="text-2xl font-black text-gray-800">VISITANTE</span>
                            </button>
                            <button onClick={() => handleCount('MEMBER')} disabled={!selectedSpot} className="group h-32 rounded-[2rem] shadow-lg flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden bg-white border border-gray-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <CheckCircle2 size={32} className="text-purple-600 mb-2" /><span className="text-2xl font-black text-gray-800">MEMBRO</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* === SCANNER === */}
                {mode === 'SCAN' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        {!selectedSpot ? <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 font-medium"><MapPin size={48} className="mb-2" />Selecione o local na aba Contador primeiro</div> : (
                            <div className="flex flex-col gap-4">
                                {searchTerm === '' && (
                                    <div className="relative">
                                        {!pauseScan ? (
                                            <div className="aspect-square w-full rounded-[2rem] overflow-hidden shadow-2xl bg-black border-4 border-purple-500 relative">
                                                <Scanner onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)} />
                                                <div className="absolute inset-0 border-2 border-white/20 rounded-[1.8rem] pointer-events-none"></div>
                                                <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md">Câmera Ativa</div>
                                            </div>
                                        ) : (
                                            <div className="h-64 w-full rounded-[2rem] flex flex-col items-center justify-center font-bold bg-white text-black shadow-xl border-4 border-green-500"><CheckCircle2 size={48} className="text-green-500 mb-4 animate-bounce" /><span className="text-xl">Processando...</span></div>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 opacity-50"><div className="h-[1px] bg-gray-400 flex-1"></div><span className="text-xs font-bold uppercase">Ou busque por nome</span><div className="h-[1px] bg-gray-400 flex-1"></div></div>
                                <div className="relative">
                                    <input type="text" placeholder="Digite o nome da pessoa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 rounded-xl border bg-white font-bold text-gray-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all" />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{searching ? <RefreshCw size={20} className="animate-spin text-purple-500" /> : <Search size={20} />}</div>
                                    {searchTerm && <button onClick={() => { setSearchTerm(''); setSearchResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><XCircle size={20} /></button>}
                                </div>
                                <div className="flex flex-col gap-2 pb-20">
                                    {searchResults.map(p => (
                                        <button key={p.id} onClick={() => { handleTrack(p.id); setSearchTerm(''); }} className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all text-left group ${p.hasEntered ? 'bg-green-50 border-green-200 opacity-80' : 'bg-white border-gray-100 hover:bg-purple-50'}`}>
                                            <div>
                                                <h4 className="font-bold text-gray-800 flex items-center gap-2">{p.name}{p.hasEntered && <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Já Entrou</span>}</h4>
                                                <div className="flex gap-2 text-[10px] font-bold uppercase text-gray-400"><span>{p.type}</span><span>•</span><span>{p.church}</span></div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${p.hasEntered ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400 group-hover:bg-purple-500 group-hover:text-white'}`}>{p.hasEntered ? <CheckCircle2 size={16} /> : <ChevronDown size={16} className="-rotate-90" />}</div>
                                        </button>
                                    ))}
                                    {searchTerm.length >= 3 && searchResults.length === 0 && !searching && <div className="text-center text-gray-400 py-4 text-sm">Ninguém encontrado. <br /><button onClick={() => setMode('REGISTER')} className="text-blue-500 font-bold underline mt-1">Cadastrar Novo?</button></div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* === CADASTRO === */}
                {mode === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="flex flex-col gap-5 animate-fade-in p-6 rounded-[2rem] shadow-sm border transition-colors duration-500" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-xl tracking-tight" style={{ color: theme.textPrimary }}>Novo Participante</h3>
                            <div className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider opacity-60" style={{ backgroundColor: theme.chipBg, color: theme.textPrimary }}>Cadastro Rápido</div>
                        </div>

                        {/* --- SELETOR DE LOCAL OBRIGATÓRIO --- */}
                        <div>
                            <label className="text-[10px] font-bold uppercase ml-3 mb-1 block text-red-500">📍 Onde você está? (Obrigatório)</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" style={{ color: theme.textPrimary }} />
                                <select className="w-full p-4 pl-12 rounded-2xl border font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                    style={{ backgroundColor: theme.inputBg, borderColor: !selectedSpot ? '#EF4444' : theme.inputBorder, color: theme.textPrimary }}
                                    value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}>
                                    <option value="" className="text-gray-900 bg-white">Selecione o Local de Entrada...</option>
                                    {checkpoints.map((cp: any) => (<option key={cp.id} value={cp.id} className="text-gray-900 bg-white">{cp.name}</option>))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} style={{ color: theme.textPrimary }} />
                            </div>
                        </div>

                        {/* 1. Nome e Idade */}
                        <div className="flex gap-3">
                            <div className="flex-1 group">
                                <label className="text-[10px] font-bold uppercase ml-3 mb-1 block transition-colors" style={{ color: theme.textSecondary }}>Nome Completo</label>
                                <input required className="w-full p-4 rounded-2xl font-bold outline-none border focus:border-purple-500 transition-all" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }} placeholder="Ex: Davi Aragão" value={regName} onChange={e => setRegName(e.target.value)} />
                            </div>
                            <div className="w-24 group">
                                <label className="text-[10px] font-bold uppercase ml-3 mb-1 block transition-colors" style={{ color: theme.textSecondary }}>Idade</label>
                                <input type="number" required className="w-full p-4 rounded-2xl font-bold border outline-none focus:border-purple-500 text-center transition-all" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }} placeholder="00" value={regAge} onChange={e => setRegAge(e.target.value)} />
                            </div>
                        </div>

                        {/* --- NOVO CAMPO EMAIL --- */}
                        <div>
                            <label className="text-[10px] font-bold uppercase ml-3 mb-1 block" style={{ color: theme.textSecondary }}>E-mail (Para acesso posterior)</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" style={{ color: theme.textPrimary }} />
                                <input required type="email" className="w-full p-4 pl-12 rounded-2xl font-bold outline-none border focus:border-purple-500 transition-all"
                                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                                    placeholder="exemplo@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                            </div>
                        </div>

                        {/* 2. Gênero e Igreja */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase ml-3 mb-1 block" style={{ color: theme.textSecondary }}>Gênero</label>
                                <div className="flex p-1.5 rounded-2xl transition-colors" style={{ backgroundColor: theme.toggleBg }}>
                                    {['M', 'F'].map(g => (
                                        <button key={g} type="button" onClick={() => setRegGender(g)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all shadow-sm ${regGender === g ? (g === 'M' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-pink-500 text-white shadow-pink-500/30') : 'text-gray-400 hover:text-gray-500 bg-transparent shadow-none'}`}>{g === 'M' ? 'HOMEM' : 'MULHER'}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase ml-3 mb-1 block" style={{ color: theme.textSecondary }}>Igreja</label>
                                <div className="relative">
                                    <select className="w-full p-4 pl-5 pr-10 rounded-2xl border font-bold text-sm outline-none appearance-none transition-all cursor-pointer" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }} value={regChurch} onChange={e => setRegChurch(e.target.value)}>
                                        {churches.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} style={{ color: theme.textPrimary }} />
                                </div>
                            </div>
                        </div>

                        <hr style={{ borderColor: theme.borderColor }} className="opacity-50" />

                        {/* 3. Tipo */}
                        <div className="flex bg-gray-100 p-1 rounded-2xl" style={{ backgroundColor: theme.toggleBg }}>
                            <button type="button" onClick={() => setRegType('VISITOR')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${regType === 'VISITOR' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-gray-500'}`}><UserPlus size={16} /> VISITANTE</button>
                            <button type="button" onClick={() => setRegType('MEMBER')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${regType === 'MEMBER' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-gray-500'}`}><UserCheck size={16} /> MEMBRO</button>
                        </div>

                        {/* 4. WhatsApp */}
                        {regType === 'VISITOR' && (
                            <div className="animate-fade-in-down">
                                <label className="text-[10px] font-bold uppercase ml-3 mb-1 block text-orange-500">WhatsApp (Obrigatório para visitantes)</label>
                                <input className="w-full p-4 rounded-2xl font-bold border-2 outline-none transition-all placeholder-opacity-50" style={{ backgroundColor: isLightMode ? '#FFF7ED' : 'rgba(249, 115, 22, 0.1)', borderColor: isLightMode ? '#FFEDD5' : 'rgba(249, 115, 22, 0.3)', color: isLightMode ? '#9A3412' : '#FB923C' }} placeholder="(DDD) 9xxxx-xxxx" value={regPhone} onChange={e => setRegPhone(formatPhone(e.target.value))} maxLength={15} />
                            </div>
                        )}

                        {/* 5. Marketing */}
                        <div>
                            <label className="text-[10px] font-bold uppercase ml-3 mb-2 block" style={{ color: theme.textSecondary }}>Como conheceu o evento?</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['Instagram', 'WhatsApp', 'Amigo/Convite', 'Faixa / Rua', 'Pastor / Líder', 'Youtube / Tiktok', 'Google / Site', 'Outros'].map(src => (
                                    <button key={src} type="button" onClick={() => setRegSource(src)}
                                        className={`px-2 py-3 rounded-xl text-[10px] md:text-xs font-bold border transition-all truncate ${regSource === src ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'border-transparent hover:border-current'}`}
                                        style={regSource !== src ? { backgroundColor: theme.chipBg, color: theme.textSecondary } : {}}>
                                        {src}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={loadingReg || !selectedSpot} className="w-full py-4 mt-2 rounded-2xl text-white font-black text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: theme.gradient }}>{!selectedSpot ? 'SELECIONE O LOCAL ACIMA ☝️' : loadingReg ? 'SALVANDO...' : 'CADASTRAR PARTICIPANTE'}</button>
                    </form>
                )}

                {/* === PENDÊNCIAS === */}
                {mode === 'CLEANUP' && (
                    <div className="flex flex-col gap-4 animate-fade-in pb-20">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm mb-2 flex items-center gap-2"><FileWarning size={18} /> <span>Dados faltando: Gênero, Zap, Origem ou Idade.</span></div>
                        {incompleteList.length === 0 && <div className="text-center py-10 text-gray-400">Tudo limpo! 🎉</div>}
                        {incompleteList.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div><h4 className="font-bold text-gray-800">{p.name}</h4><span className="text-xs text-gray-400 font-bold uppercase">{p.type} • {p.church}</span></div>
                                    {editingId !== p.id && <button onClick={() => startEdit(p)} className="text-blue-500 font-bold text-xs bg-blue-50 px-3 py-1 rounded-lg">EDITAR</button>}
                                </div>
                                {editingId === p.id ? (
                                    <div className="flex flex-col gap-3 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fade-in">
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Idade" value={editAge} onChange={e => setEditAge(e.target.value)} className="w-20 p-2 rounded border font-bold text-center text-black" />
                                            <div className="flex flex-1 gap-1">{['M', 'F'].map(g => (<button key={g} onClick={() => setEditGender(g)} className={`flex-1 rounded font-bold text-xs ${editGender === g ? 'bg-purple-500 text-white' : 'bg-white border text-gray-400'}`}>{g}</button>))}</div>
                                        </div>
                                        <input type="text" placeholder="WhatsApp" value={editPhone} onChange={e => setEditPhone(formatPhone(e.target.value))} maxLength={15} className="w-full p-2 rounded border text-black font-bold" />
                                        <select value={editSource} onChange={e => setEditSource(e.target.value)} className="w-full p-2 rounded border text-black font-bold text-sm bg-white">
                                            <option value="" className="text-gray-900 bg-white">Origem?</option>
                                            <option value="Instagram" className="text-gray-900 bg-white">Instagram</option><option value="WhatsApp" className="text-gray-900 bg-white">WhatsApp</option><option value="Amigo/Convite" className="text-gray-900 bg-white">Amigo/Convite</option><option value="Faixa / Rua" className="text-gray-900 bg-white">Faixa / Rua</option><option value="Pastor / Líder" className="text-gray-900 bg-white">Pastor / Líder</option><option value="Youtube / Tiktok" className="text-gray-900 bg-white">Youtube/Tiktok</option><option value="Google / Site" className="text-gray-900 bg-white">Google/Site</option><option value="Outros" className="text-gray-900 bg-white">Outros</option>
                                        </select>
                                        <button onClick={() => saveEdit(p.id)} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 mt-1"><Save size={16} /> SALVAR</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 text-[10px] uppercase font-bold text-red-400 flex-wrap">
                                        {!p.gender && <span className="bg-red-50 px-2 py-1 rounded">Falta Gênero</span>}
                                        {!p.phone && <span className="bg-red-50 px-2 py-1 rounded">Falta Zap</span>}
                                        {!p.marketingSource && <span className="bg-red-50 px-2 py-1 rounded">Falta Origem</span>}
                                        {!p.age && <span className="bg-red-50 px-2 py-1 rounded">Falta Idade</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* === POP-UP DO SMART CHECK-IN === */}
            {showUpdateModal && personToUpdate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border-4 border-purple-500 relative">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl animate-pulse"><AlertTriangle /></div>
                            <h3 className="text-xl font-black text-gray-800">Falta Pouco!</h3>
                            <p className="text-sm text-gray-500">Complete o cadastro de <b>{personToUpdate.name.split(' ')[0]}</b> para liberar a entrada.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {!personToUpdate.gender && (
                                <div><label className="text-xs font-bold text-gray-400 ml-1">Gênero</label><div className="flex gap-2">{['M', 'F'].map(g => (<button key={g} onClick={() => setEditGender(g)} className={`flex-1 py-3 rounded-xl font-black text-sm border ${editGender === g ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-400'}`}>{g === 'M' ? 'HOMEM' : 'MULHER'}</button>))}</div></div>
                            )}
                            {!personToUpdate.marketingSource && (
                                <div><label className="text-xs font-bold text-gray-400 ml-1">Como conheceu?</label><select value={editSource} onChange={e => setEditSource(e.target.value)} className="w-full p-3 rounded-xl border bg-gray-50 font-bold text-gray-800 outline-none focus:border-purple-500"><option value="" className="text-gray-900 bg-white">Selecione...</option><option value="Instagram" className="text-gray-900 bg-white">Instagram</option><option value="Amigo/Convite" className="text-gray-900 bg-white">Amigo/Convite</option><option value="Faixa / Rua" className="text-gray-900 bg-white">Faixa / Rua</option><option value="Pastor / Líder" className="text-gray-900 bg-white">Pastor / Líder</option><option value="Outros" className="text-gray-900 bg-white">Outros</option></select></div>
                            )}
                            {!personToUpdate.age && (
                                <div><label className="text-xs font-bold text-gray-400 ml-1">Idade</label><input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} className="w-full p-3 rounded-xl border bg-gray-50 font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="Ex: 25" /></div>
                            )}
                            <button onClick={() => saveEdit(personToUpdate.id, true)} className="w-full py-4 mt-2 rounded-xl bg-green-500 text-white font-black text-lg shadow-lg hover:brightness-110 transition-all">SALVAR & LIBERAR</button>
                            <button onClick={() => { setShowUpdateModal(false); setPauseScan(false); }} className="text-xs text-gray-400 font-bold py-2 hover:text-red-500">Pular (Não recomendado)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};