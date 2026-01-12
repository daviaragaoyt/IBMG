import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle2, XCircle, QrCode, MapPin, ArrowLeft,
    Users, MousePointerClick, Plus, LogOut, ChevronDown, Lock, Baby, User, UserCheck, LayoutDashboard,
    FileWarning, Save, AlertTriangle, Search, RefreshCw, Megaphone,
    Instagram, MessageCircle, UserPlus, Mic2, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- OPÇÕES DE MARKETING ---
const MARKETING_OPTIONS = [
    { label: 'Instagram', icon: <Instagram size={28} /> },
    { label: 'WhatsApp', icon: <MessageCircle size={28} /> },
    { label: 'Amigo/Convite', icon: <UserPlus size={28} /> },
    { label: 'Faixa / Rua', icon: <MapPin size={28} /> },
    { label: 'Pastor / Líder', icon: <Mic2 size={28} /> },
    { label: 'Aviso Culto / Igreja', icon: <Megaphone size={28} /> },
    { label: 'Google / Site', icon: <Globe size={28} /> },
    { label: 'Outros', icon: <Search size={28} /> }
];

// --- TEMAS ---
const getTheme = (isLightMode: boolean) => ({
    gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
    bg: isLightMode ? '#F3F4F6' : '#0F0014',
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#666666' : '#9CA3AF',
    borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D'
});

const formatPhone = (value: string) => {
    let r = value.replace(/\D/g, "").slice(0, 11);
    if (r.length > 6) r = r.replace(/^(\d\d)(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    return r;
};

// --- COMPONENTE DE TOAST (NOTIFICAÇÃO) ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border-l-4 animate-slide-in-right ${type === 'success' ? 'bg-white/90 border-green-500 text-gray-800' : 'bg-white/90 border-red-500 text-gray-800'}`}>
            {type === 'success' ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
            <div><h4 className="font-bold text-xs uppercase">{type === 'success' ? 'Sucesso' : 'Erro'}</h4><p className="font-medium text-sm">{msg}</p></div>
        </div>
    );
};

// --- TELA DE LOGIN ---
const StaffLogin = ({ onLogin, isLightMode }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) onLogin(data); else setError(data.error || 'Acesso negado.');
        } catch (err) { setError('Erro de conexão.'); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="w-full max-w-sm p-8 rounded-[2rem] shadow-xl border bg-white/5 backdrop-blur-sm" style={{ borderColor: theme.borderColor }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg" style={{ background: theme.gradient }}><Lock size={28} /></div>
                <h2 className="text-2xl font-black text-center mb-6">Staff Access</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" required placeholder="Seu e-mail" className="w-full p-4 rounded-xl border outline-none font-medium bg-transparent" style={{ borderColor: theme.borderColor }} value={email} onChange={e => setEmail(e.target.value)} />
                    <button disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:opacity-90" style={{ background: theme.gradient }}>{loading ? 'Entrando...' : 'ACESSAR'}</button>
                </form>
                {error && <p className="mt-4 text-red-500 text-center text-sm font-bold">{error}</p>}
                <Link to="/ekklesia" className="block text-center mt-6 text-xs opacity-50 hover:opacity-100">Voltar</Link>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export const EkklesiaStaff = ({ isLightMode }: { isLightMode: boolean }) => {
    const [staffUser, setStaffUser] = useState<any>(() => { const s = localStorage.getItem('ekklesia_staff_user'); return s ? JSON.parse(s) : null; });
    const [mode, setMode] = useState<'COUNTER' | 'SCAN' | 'CLEANUP'>('COUNTER');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [churches, setChurches] = useState<string[]>([]);

    // States do Contador
    const [selectedSpot, setSelectedSpot] = useState('');
    const [selectedChurch, setSelectedChurch] = useState('Ibmg Sede');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('ADULTO');
    const [selectedGender, setSelectedGender] = useState('M');
    const [counterSource, setCounterSource] = useState('');

    // States de UI e Busca
    const [toasts, setToasts] = useState<any[]>([]);
    const [pauseScan, setPauseScan] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // States de Edição/Limpeza
    const [incompleteList, setIncompleteList] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [personToUpdate, setPersonToUpdate] = useState<any>(null);
    const [editAge, setEditAge] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editSource, setEditSource] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    // Carrega dados iniciais
    useEffect(() => {
        if (staffUser) {
            fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(setCheckpoints).catch(console.error);
            fetch(`${API_URL}/config/churches`).then(res => res.json()).then(setChurches).catch(console.error);
        }
    }, [staffUser]);

    // Carrega lista de pendências se entrar na aba de limpeza
    useEffect(() => { if (mode === 'CLEANUP') fetchIncomplete(); }, [mode]);

    // Debounce da busca
    useEffect(() => {
        if (searchTerm.length < 3) { setSearchResults([]); return; }
        const t = setTimeout(async () => {
            setSearching(true);
            try { const res = await fetch(`${API_URL}/people?search=${searchTerm}`); setSearchResults(await res.json()); }
            catch (e) { console.error(e); } finally { setSearching(false); }
        }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Helpers
    const addToast = (msg: string, type: 'success' | 'error') => { const id = Date.now(); setToasts(prev => [...prev, { id, msg, type }]); };
    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
    const handleLogout = () => { setStaffUser(null); localStorage.removeItem('ekklesia_staff_user'); };

    const fetchIncomplete = async () => { try { const res = await fetch(`${API_URL}/people/incomplete`); setIncompleteList(await res.json()); } catch (e) { console.error(e); } };

    const startEdit = (p: any) => { setEditingId(p.id); setEditAge(p.age || ''); setEditPhone(p.phone || ''); setEditGender(p.gender || ''); setEditSource(p.marketingSource || ''); };

    const saveEdit = async (id: string, isModal = false) => {
        try {
            await fetch(`${API_URL}/person/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // CONVERTENDO PARA NÚMERO AQUI PARA GARANTIR
                    age: editAge ? Number(editAge) : null,
                    phone: editPhone,
                    gender: editGender,
                    marketingSource: editSource
                })
            });

            if (isModal) {
                addToast("Cadastro completado! ✅", 'success');
                setShowUpdateModal(false);
                setPersonToUpdate(null);
                setPauseScan(false);
            } else {
                addToast("Atualizado!", 'success');
                setEditingId(null);
                // ESSA LINHA GARANTE QUE A LISTA ATUALIZE NA TELA:
                fetchIncomplete();
            }
        } catch (e) {
            addToast("Erro ao salvar", 'error');
        }
    };

    const handleCount = async (type: 'MEMBER' | 'VISITOR') => {
        if (!selectedSpot) return addToast("Selecione o Local!", 'error');
        const currentSpot = checkpoints.find(c => c.id === selectedSpot);
        const isEntrance = currentSpot?.name.toLowerCase().includes('entrada') || currentSpot?.name.toLowerCase().includes('recepção');
        try {
            const res = await fetch(`${API_URL}/count`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkpointId: selectedSpot, type, church: selectedChurch, ageGroup: selectedAgeGroup, gender: selectedGender, quantity: 1, marketingSource: (isEntrance && counterSource) ? counterSource : null })
            });
            if (res.ok) { addToast(`+1 ${type === 'MEMBER' ? 'Membro' : 'Visitante'}`, 'success'); setCounterSource(''); }
        } catch (error) { addToast("Erro de conexão.", 'error'); }
    };

    const handleTrack = async (id: string) => {
        if (!selectedSpot) return addToast("Selecione o Local!", 'error');
        setPauseScan(true);
        try {
            const res = await fetch(`${API_URL}/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personId: id, checkpointId: selectedSpot }) });
            const data = await res.json();
            if (data.status === 'SUCCESS' || data.status === 'REENTRY') {
                const p = data.person;
                // Se faltar dados importantes, pede para completar
                if (!p.gender || !p.marketingSource || !p.age) {
                    if (navigator.vibrate) navigator.vibrate([100]);
                    setPersonToUpdate(p); setEditAge(p.age || ''); setEditPhone(p.phone || ''); setEditGender(p.gender || ''); setEditSource(p.marketingSource || '');
                    setShowUpdateModal(true);
                } else {
                    addToast(data.message, data.status === 'REENTRY' ? 'error' : 'success');
                }
            } else addToast(data.message || "Erro", 'error');
        } catch (err) { addToast("Erro de conexão", 'error'); }
        if (!showUpdateModal) setTimeout(() => { if (!showUpdateModal) setPauseScan(false); }, 2500);
    };

    const isCurrentSpotEntrance = () => { const spot = checkpoints.find(c => c.id === selectedSpot); return spot && (spot.name.toLowerCase().includes('entrada') || spot.name.toLowerCase().includes('recepção')); };

    if (!staffUser) return <StaffLogin onLogin={(user: any) => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    return (
        <div className="min-h-screen w-full font-sans flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="fixed top-0 right-0 p-4 z-50 flex flex-col gap-2 pointer-events-none">{toasts.map(t => <div key={t.id} className="pointer-events-auto"><Toast msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} /></div>)}</div>

            <div className="px-6 py-6 pb-12 shadow-sm relative z-20 flex justify-between items-start" style={{ background: theme.cardBg }}>
                <div className="flex items-center gap-3">
                    <Link to="/ekklesia" className="p-2 rounded-full hover:bg-gray-100 transition-all"><ArrowLeft size={20} /></Link>
                    <div><h1 className="font-black text-xl tracking-tight leading-none">STAFF AREA</h1><p className="text-xs opacity-60 mt-1 font-medium">Olá, {staffUser.name.split(' ')[0]}</p></div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/ekklesia/dashboard" className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100"><LayoutDashboard size={20} /></Link>
                    <button onClick={handleLogout} className="p-3 rounded-xl bg-red-50 text-red-500 border border-red-100"><LogOut size={20} /></button>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-30">
                <div className="flex rounded-2xl shadow-xl p-1.5 justify-between border overflow-x-auto" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
                    {[{ id: 'COUNTER', icon: <MousePointerClick size={16} />, label: 'Contador' }, { id: 'SCAN', icon: <QrCode size={16} />, label: 'Scanner' }, { id: 'CLEANUP', icon: <FileWarning size={16} />, label: 'Pendências' }].map((tab) => (
                        <button key={tab.id} onClick={() => setMode(tab.id as any)} className={`flex-1 py-3 px-2 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1 transition-all ${mode === tab.id ? 'shadow-md' : 'opacity-60'}`} style={{ color: mode === tab.id ? 'white' : theme.textPrimary, background: mode === tab.id ? theme.gradient : 'transparent' }}>{tab.icon} {tab.label}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto pb-24 max-w-lg mx-auto w-full">

                {/* --- MODO CONTADOR --- */}
                {mode === 'COUNTER' && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="relative"><MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" /><select className="w-full p-4 pl-12 rounded-xl border bg-white font-bold text-gray-800" value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}><option value="">Selecione o Local...</option>{checkpoints.map((cp: any) => (<option key={cp.id} value={cp.id}>{cp.name}</option>))}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} /></div>
                            <div className="relative"><Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" /><select className="w-full p-4 pl-12 rounded-xl border bg-white font-bold text-gray-800" value={selectedChurch} onChange={e => setSelectedChurch(e.target.value)}>{churches.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} /></div>
                        </div>
                        <hr className="border-gray-200/50" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2"><label className="text-xs font-bold uppercase opacity-50 ml-1">Gênero</label><div className="flex gap-1 bg-gray-100 p-1 rounded-xl">{['M', 'F'].map(g => (<button key={g} onClick={() => setSelectedGender(g)} className={`flex-1 py-2 rounded-lg text-xs font-black ${selectedGender === g ? 'bg-white shadow text-black' : 'text-gray-400'}`}>{g === 'M' ? 'HOMEM' : 'MULHER'}</button>))}</div></div>
                            <div className="flex flex-col gap-2"><label className="text-xs font-bold uppercase opacity-50 ml-1">Idade</label><div className="flex gap-1 bg-gray-100 p-1 rounded-xl">{[{ id: 'CRIANCA', icon: <Baby size={16} /> }, { id: 'JOVEM', icon: <User size={16} /> }, { id: 'ADULTO', icon: <UserCheck size={16} /> }].map(a => (<button key={a.id} onClick={() => setSelectedAgeGroup(a.id)} className={`flex-1 py-2 rounded-lg flex items-center justify-center ${selectedAgeGroup === a.id ? 'bg-white shadow text-black' : 'text-gray-400'}`}>{a.icon}</button>))}</div></div>
                        </div>
                        {isCurrentSpotEntrance() && (
                            <div className="animate-fade-in mt-2">
                                <label className="text-xs font-bold uppercase opacity-60 ml-1 mb-3 block flex items-center gap-2"><Megaphone size={14} className="text-orange-500" /> Como conheceu?</label>
                                <div className="grid grid-cols-2 gap-3">{MARKETING_OPTIONS.map(opt => (<button key={opt.label} onClick={() => setCounterSource(opt.label)} className={`h-24 px-2 rounded-2xl border-2 font-black text-xs md:text-sm flex flex-col items-center justify-center text-center shadow-sm ${counterSource === opt.label ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}><div className="mb-1">{opt.icon}</div>{opt.label}</button>))}</div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <button onClick={() => handleCount('VISITOR')} disabled={!selectedSpot} className="group h-32 rounded-[2rem] shadow-lg flex flex-col items-center justify-center bg-white border border-gray-100 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-10"></div><Plus size={32} className="text-orange-500 mb-2" /><span className="text-2xl font-black text-gray-800">VISITANTE</span></button>
                            <button onClick={() => handleCount('MEMBER')} disabled={!selectedSpot} className="group h-32 rounded-[2rem] shadow-lg flex flex-col items-center justify-center bg-white border border-gray-100 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-10"></div><CheckCircle2 size={32} className="text-purple-600 mb-2" /><span className="text-2xl font-black text-gray-800">MEMBRO</span></button>
                        </div>
                    </div>
                )}

                {/* --- MODO SCANNER --- */}
                {mode === 'SCAN' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        {!selectedSpot ? <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 font-medium"><MapPin size={48} className="mb-2" />Selecione o local na aba Contador primeiro</div> : (
                            <div className="flex flex-col gap-4">
                                {searchTerm === '' && (
                                    <div className="relative">{!pauseScan ? (<div className="aspect-square w-full rounded-[2rem] overflow-hidden shadow-2xl bg-black border-4 border-purple-500 relative"><Scanner onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)} /></div>) : (<div className="h-64 w-full rounded-[2rem] flex flex-col items-center justify-center font-bold bg-white text-black shadow-xl border-4 border-green-500"><CheckCircle2 size={48} className="text-green-500 mb-4 animate-bounce" /><span className="text-xl">Processando...</span></div>)}</div>
                                )}
                                <div className="relative"><input type="text" placeholder="Digite o nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 rounded-xl border bg-white font-bold text-gray-800 shadow-sm" /><div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{searching ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}</div>{searchTerm && <button onClick={() => { setSearchTerm(''); setSearchResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><XCircle size={20} /></button>}</div>
                                <div className="flex flex-col gap-2 pb-20">{searchResults.map(p => (<button key={p.id} onClick={() => { handleTrack(p.id); setSearchTerm(''); }} className={`p-4 rounded-xl border shadow-sm flex items-center justify-between text-left ${p.hasEntered ? 'bg-green-50 border-green-200 opacity-80' : 'bg-white border-gray-100'}`}><div><h4 className="font-bold text-gray-800 flex items-center gap-2">{p.name}{p.hasEntered && <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full">Já Entrou</span>}</h4><div className="flex gap-2 text-[10px] font-bold uppercase text-gray-400"><span>{p.type}</span><span>•</span><span>{p.church}</span></div></div><div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.hasEntered ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{p.hasEntered ? <CheckCircle2 size={16} /> : <ChevronDown size={16} className="-rotate-90" />}</div></button>))}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- MODO PENDÊNCIAS --- */}
                {mode === 'CLEANUP' && (
                    <div className="flex flex-col gap-4 animate-fade-in pb-20">
                        {incompleteList.length === 0 && <div className="text-center py-10 text-gray-400">Tudo limpo! 🎉</div>}
                        {incompleteList.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start"><div><h4 className="font-bold text-gray-800">{p.name}</h4><span className="text-xs text-gray-400 font-bold uppercase">{p.type}</span></div>{editingId !== p.id && <button onClick={() => startEdit(p)} className="text-blue-500 font-bold text-xs bg-blue-50 px-3 py-1 rounded-lg">EDITAR</button>}</div>
                                {editingId === p.id && (
                                    <div className="flex flex-col gap-3 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex gap-2"><input type="number" placeholder="Idade" value={editAge} onChange={e => setEditAge(e.target.value)} className="w-20 p-2 rounded border font-bold text-black" /><div className="flex flex-1 gap-1">{['M', 'F'].map(g => (<button key={g} onClick={() => setEditGender(g)} className={`flex-1 rounded font-bold text-xs ${editGender === g ? 'bg-purple-500 text-white' : 'bg-white border text-gray-400'}`}>{g}</button>))}</div></div>
                                        <input type="text" placeholder="WhatsApp" value={editPhone} onChange={e => setEditPhone(formatPhone(e.target.value))} className="w-full p-2 rounded border text-black font-bold" />
                                        <select value={editSource} onChange={e => setEditSource(e.target.value)} className="w-full p-2 rounded border text-black font-bold text-sm bg-white"><option value="">Origem...</option>{MARKETING_OPTIONS.map(o => <option key={o.label} value={o.label}>{o.label}</option>)}</select>
                                        <button onClick={() => saveEdit(p.id)} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 mt-1"><Save size={16} /> SALVAR</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL SMART CHECK-IN (POPUP) --- */}
            {showUpdateModal && personToUpdate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border-4 border-purple-500 relative">
                        <div className="text-center mb-4"><div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl animate-pulse"><AlertTriangle /></div><h3 className="text-xl font-black text-gray-800">Falta Pouco!</h3><p className="text-sm text-gray-500">Complete o cadastro de <b>{personToUpdate.name.split(' ')[0]}</b></p></div>
                        <div className="flex flex-col gap-3">
                            {!personToUpdate.gender && <div><label className="text-xs font-bold text-gray-400 ml-1">Gênero</label><div className="flex gap-2">{['M', 'F'].map(g => (<button key={g} onClick={() => setEditGender(g)} className={`flex-1 py-3 rounded-xl font-black text-sm border ${editGender === g ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-400'}`}>{g === 'M' ? 'HOMEM' : 'MULHER'}</button>))}</div></div>}
                            {!personToUpdate.marketingSource && <div><label className="text-xs font-bold text-gray-400 ml-1">Origem</label><select value={editSource} onChange={e => setEditSource(e.target.value)} className="w-full p-3 rounded-xl border bg-gray-50 font-bold text-gray-800"><option value="">Selecione...</option>{MARKETING_OPTIONS.map(o => <option key={o.label} value={o.label}>{o.label}</option>)}</select></div>}
                            {!personToUpdate.age && <div><label className="text-xs font-bold text-gray-400 ml-1">Idade</label><input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} className="w-full p-3 rounded-xl border bg-gray-50 font-bold text-gray-800" /></div>}
                            <button onClick={() => saveEdit(personToUpdate.id, true)} className="w-full py-4 mt-2 rounded-xl bg-green-500 text-white font-black text-lg shadow-lg">SALVAR & LIBERAR</button>
                            <button onClick={() => { setShowUpdateModal(false); setPauseScan(false); }} className="text-xs text-gray-400 font-bold py-2 hover:text-red-500">Pular</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};