import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle2, XCircle, QrCode, MapPin, ArrowLeft,
    Users, Plus, LogOut, Lock, HeartHandshake, RefreshCw, Save, Zap,
    Flame, Heart, Cross, ChevronDown, LayoutDashboard, AlertCircle, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- HELPER: FORMATAR TELEFONE ---
const formatPhone = (value: string) => {
    let r = value.replace(/\D/g, "").slice(0, 11);
    if (r.length > 6) r = r.replace(/^(\d\d)(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    return r;
};

// --- DESIGN SYSTEM (CORES SÓLIDAS E GRADIENTES SUAVES) ---
const getTheme = (isLightMode: boolean) => ({
    bgApp: isLightMode ? '#F3F4F6' : '#0F0014', // Fundo Sólido
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524', // Card Sólido
    cardBorder: isLightMode ? '#E5E7EB' : '#2D0A3D',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#6B7280' : '#A78BFA',
    inputBg: isLightMode ? '#F9FAFB' : '#2D0A3D',
    inputBorder: isLightMode ? '#E5E7EB' : '#4C1D95'
});

// --- TOAST CLÁSSICO (POSICIONADO CORRETAMENTE) ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 animate-slide-in-right bg-white text-gray-800 ${type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {type === 'success' ? <CheckCircle2 className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
            <div>
                <h4 className="font-bold text-[10px] uppercase opacity-60 tracking-wider">{type === 'success' ? 'SUCESSO' : 'ERRO'}</h4>
                <p className="font-bold text-sm">{msg}</p>
            </div>
        </div>
    );
};

// --- LOGIN ---
const StaffLogin = ({ onLogin, isLightMode }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const theme = getTheme(isLightMode);
    const API_URL = import.meta.env.VITE_API_URL;

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
        <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: theme.bgApp }}>
            <div className="w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border"
                style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black text-center mb-6" style={{ color: theme.textPrimary }}>Acesso Staff</h2>

                <form onSubmit={handleLogin} className="space-y-5">
                    <input type="email" required placeholder="Seu e-mail"
                        className="w-full p-4 rounded-xl border outline-none font-bold"
                        style={{ borderColor: theme.inputBorder, color: theme.textPrimary, background: theme.inputBg }}
                        value={email} onChange={e => setEmail(e.target.value)} />
                    <button disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:brightness-110 transition-all bg-gradient-to-r from-purple-600 to-indigo-600">
                        {loading ? 'Entrando...' : 'ACESSAR'}
                    </button>
                </form>
                {error && <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-500 text-center text-sm font-bold flex items-center justify-center gap-2"><AlertCircle size={16} /> {error}</div>}
                <Link to="/ekklesia" className="block text-center mt-6 text-xs font-bold opacity-50 hover:opacity-100" style={{ color: theme.textPrimary }}>Voltar</Link>
            </div>
        </div>
    );
};

// ============================================================================
// 1. TELA FAST TRACK (Layout Limpo & Botões Grandes)
// ============================================================================
const FastTrackScreen = ({ user, addToast, onLogout, isLightMode }: any) => {
    const [mode, setMode] = useState<'BUTTONS' | 'SCAN'>('BUTTONS');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');
    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    const loadCheckpoints = () => {
        fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(data => {
            setCheckpoints(data);
            if (data.length > 0 && user.department) {
                const dept = user.department.toUpperCase();
                const match = data.find((c: any) => {
                    const name = c.name.toUpperCase();
                    if (dept === 'KIDS' && name.includes('KIDS')) return true;
                    if (dept === 'RECEPTION' && (name.includes('RECEP') || name.includes('ENTRADA'))) return true;
                    if (dept === 'EVANGELISM' && name.includes('KOMBI')) return true;
                    if (dept === 'PRAYER' && name.includes('TENDA')) return true;
                    if (dept === 'STORE' && (name.includes('LIVRARIA') || name.includes('PSALMS'))) return true;
                    return false;
                });
                if (match) setSelectedSpot(match.id);
            }
        });
    };

    useEffect(() => { loadCheckpoints(); }, [user.department]);

    const forceSetup = async () => {
        try {
            await fetch(`${API_URL}/setup`);
            setTimeout(loadCheckpoints, 1000);
            addToast("Sincronizando...", 'success');
        } catch (e) { addToast("Erro setup", 'error'); }
    };

    const handleCount = async (payload: any, label: string) => {
        if (!selectedSpot) return addToast("Selecione o Local primeiro!", 'error');
        if (navigator.vibrate) navigator.vibrate(50);

        try {
            await fetch(`${API_URL}/count`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkpointId: selectedSpot, type: personType, quantity: 1,
                    marketingSource: user.department === 'EVANGELISM' ? 'Ação Externa' : null, ...payload
                })
            });
            addToast(label, 'success');
        } catch (e) { addToast("Erro de rede", 'error'); }
    };

    const isSpiritualSpot = () => {
        const name = checkpoints.find(c => c.id === selectedSpot)?.name.toUpperCase() || '';
        return name.includes('TENDA') || name.includes('PROFETICA') || name.includes('KOMBI') || name.includes('ORACAO');
    };

    return (
        <div className="flex flex-col h-full font-sans transition-all duration-500" style={{ background: theme.bgApp }}>

            {/* HEADER */}
            <div className="pt-6 pb-4 px-6 rounded-b-[2rem] shadow-sm relative z-20"
                style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.cardBorder}` }}>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <Link to="/ekklesia" className="p-2 rounded-full bg-gray-100 dark:bg-white/10" style={{ color: theme.textPrimary }}><ArrowLeft size={20} /></Link>
                        <div>
                            <h1 className="font-black text-xl tracking-tight leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">STAFF AREA</h1>
                            <p className="text-xs font-bold mt-0.5 opacity-60" style={{ color: theme.textSecondary }}>{user.name.split(' ')[0]} • {user.department || 'Geral'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/ekklesia/dashboard" className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100"><LayoutDashboard size={20} /></Link>
                        <button onClick={onLogout} className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100"><LogOut size={20} /></button>
                    </div>
                </div>

                <div className="relative mb-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"><MapPin size={20} /></div>
                    <select className="w-full p-4 pl-12 rounded-xl font-bold text-sm shadow-sm outline-none appearance-none"
                        style={{ background: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.inputBorder}` }}
                        value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}>
                        <option value="">
                            {checkpoints.length === 0 ? "Carregando locais..." : "📍 Selecione seu Posto..."}
                        </option>
                        {checkpoints.map((cp: any) => <option key={cp.id} value={cp.id}>{cp.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><ChevronDown size={16} color={theme.textPrimary} /></div>
                </div>

                {checkpoints.length === 0 && (
                    <button onClick={forceSetup} className="w-full py-3 mb-4 text-xs font-bold bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-200 flex items-center justify-center gap-2">
                        <RefreshCw size={14} /> Sincronizar Locais
                    </button>
                )}

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setMode('BUTTONS')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'BUTTONS' ? 'bg-white shadow text-purple-600' : 'text-gray-400'}`}>CONTADOR</button>
                    <button onClick={() => setMode('SCAN')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'SCAN' ? 'bg-white shadow text-purple-600' : 'text-gray-400'}`}>SCANNER</button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {mode === 'BUTTONS' ? (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex gap-3">
                            <button onClick={() => setPersonType('VISITOR')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'VISITOR' ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'border-gray-200 dark:border-white/10 bg-transparent opacity-60'}`} style={personType !== 'VISITOR' ? { color: theme.textSecondary } : {}}><Plus size={18} /> VISITANTE</button>
                            <button onClick={() => setPersonType('MEMBER')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'MEMBER' ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'border-gray-200 dark:border-white/10 bg-transparent opacity-60'}`} style={personType !== 'MEMBER' ? { color: theme.textSecondary } : {}}><Users size={18} /> MEMBRO</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'ADULTO' }, '+1 Homem')} className="bg-blue-600 active:scale-95 transition-all rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden group">
                                <span className="text-4xl mb-1">👨</span><span className="font-black text-sm opacity-90">HOMEM</span>
                            </button>
                            <button onClick={() => handleCount({ gender: 'F', ageGroup: 'ADULTO' }, '+1 Mulher')} className="bg-pink-600 active:scale-95 transition-all rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden group">
                                <span className="text-4xl mb-1">👩</span><span className="font-black text-sm opacity-90">MULHER</span>
                            </button>
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'JOVEM' }, '+1 Jovem')} className="bg-yellow-500 active:scale-95 transition-all rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden group">
                                <span className="text-4xl mb-1">🧑‍🎤</span><span className="font-black text-sm opacity-90 text-yellow-900">JOVEM</span>
                            </button>
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA' }, '+1 Criança')} className="bg-emerald-500 active:scale-95 transition-all rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden group">
                                <span className="text-4xl mb-1">👶</span><span className="font-black text-sm opacity-90">CRIANÇA</span>
                            </button>
                        </div>

                        {isSpiritualSpot() && (
                            <div className="animate-fade-in mt-2 pt-4 border-t border-dashed" style={{ borderColor: theme.cardBorder }}>
                                <div className="flex items-center justify-center gap-2 mb-3 opacity-60">
                                    <Sparkles size={14} className="text-orange-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textSecondary }}>Painel Sobrenatural</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <button onClick={() => handleCount({ marketingSource: 'VIDA_SALVA' }, 'Glória a Deus! 🙌')} className="bg-gradient-to-br from-emerald-500 to-teal-600 py-3 rounded-2xl text-white shadow-lg active:scale-95 flex flex-col items-center gap-1"><Cross size={20} /><span className="text-[9px] font-black uppercase">Salvação</span></button>
                                    <button onClick={() => handleCount({ marketingSource: 'CURA' }, 'Cura Registrada! 🩹')} className="bg-gradient-to-br from-red-500 to-rose-600 py-3 rounded-2xl text-white shadow-lg active:scale-95 flex flex-col items-center gap-1"><Heart size={20} /><span className="text-[9px] font-black uppercase">Cura</span></button>
                                    <button onClick={() => handleCount({ marketingSource: 'LIBERTACAO' }, 'Libertação! 🔥')} className="bg-gradient-to-br from-orange-500 to-amber-600 py-3 rounded-2xl text-white shadow-lg active:scale-95 flex flex-col items-center gap-1"><Flame size={20} /><span className="text-[9px] font-black uppercase">Libertação</span></button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-full aspect-square bg-black rounded-[2.5rem] overflow-hidden relative shadow-2xl border-4 border-purple-500">
                            <Scanner onScan={(d) => d[0]?.rawValue && console.log(d[0].rawValue)} />
                            <div className="absolute inset-0 border-[3px] border-white/20 rounded-[2.3rem] pointer-events-none m-4"></div>
                        </div>
                        <p className="text-center opacity-60 text-sm mt-6 font-medium" style={{ color: theme.textSecondary }}>Aponte para o QR Code</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// 2. TELA DE CONSOLIDAÇÃO
// ============================================================================
const ConsolidationScreen = ({ user, addToast, onLogout, isLightMode }: any) => {
    const [formData, setFormData] = useState({ name: '', phone: '', decision: 'Aceitou Jesus' });
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const theme = getTheme(isLightMode);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return addToast("Nome obrigatório", 'error');
        setLoading(true);
        try {
            await fetch(`${API_URL}/consolidation/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, observer: user.name }) });
            addToast("Ficha Salva com Sucesso! 🎉", 'success');
            setFormData({ name: '', phone: '', decision: 'Aceitou Jesus' });
        } catch (error) { addToast("Erro ao salvar", 'error'); } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full min-h-screen font-sans transition-all duration-700" style={{ background: theme.bgApp }}>
            <div className="pt-8 pb-6 px-6 rounded-b-[2rem] shadow-sm relative z-20"
                style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.cardBorder}` }}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><HeartHandshake size={24} /></div>
                        <div><h1 className="font-black text-xl uppercase tracking-tight" style={{ color: theme.textPrimary }}>Consolidação</h1><p className="text-xs opacity-60 font-medium" style={{ color: theme.textSecondary }}>Voluntário: {user.name.split(' ')[0]}</p></div>
                    </div>
                    <button onClick={onLogout} className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><LogOut size={20} /></button>
                </div>
            </div>

            <div className="px-6 py-8 pb-24 max-w-md mx-auto w-full">
                <div className="p-6 rounded-[2rem] shadow-lg border"
                    style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase opacity-50 ml-2 mb-2 block tracking-wider" style={{ color: theme.textSecondary }}>Dados do Visitante</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-4 rounded-xl border font-bold outline-none transition-all focus:ring-2 focus:ring-emerald-500"
                                style={{ background: theme.inputBg, color: theme.textPrimary, borderColor: theme.inputBorder }} placeholder="Nome Completo" />
                        </div>
                        <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                            className="w-full p-4 rounded-xl border font-bold outline-none transition-all focus:ring-2 focus:ring-emerald-500"
                            style={{ background: theme.inputBg, color: theme.textPrimary, borderColor: theme.inputBorder }} placeholder="WhatsApp (00) 00000-0000" maxLength={15} />

                        <div>
                            <label className="text-xs font-bold uppercase opacity-50 ml-2 mb-2 block tracking-wider" style={{ color: theme.textSecondary }}>Decisão Tomada</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Aceitou Jesus', 'Reconciliação', 'Visitante'].map(opt => (
                                    <button type="button" key={opt} onClick={() => setFormData({ ...formData, decision: opt })}
                                        className={`p-4 rounded-xl text-xs font-black border transition-all ${formData.decision === opt ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        style={formData.decision !== opt ? { background: theme.inputBg, color: theme.textPrimary } : {}}>{opt}</button>
                                ))}
                            </div>
                        </div>
                        <button disabled={loading} className="w-full py-5 mt-2 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:brightness-110 flex items-center justify-center gap-2 active:scale-95 transition-all">{loading ? <RefreshCw className="animate-spin" /> : <Save />} SALVAR FICHA</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// 3. ROTEADOR
// ============================================================================
export const EkklesiaStaff = ({ isLightMode }: { isLightMode: boolean }) => {
    const [staffUser, setStaffUser] = useState<any>(() => { const s = localStorage.getItem('ekklesia_staff_user'); return s ? JSON.parse(s) : null; });
    const [toasts, setToasts] = useState<any[]>([]);

    // TOAST POSICIONADO NO TOPO DIREITO (BAIXO O SUFICIENTE PARA NÃO COBRIR O HEADER)
    const addToast = (msg: string, type: 'success' | 'error') => { const id = Date.now(); setToasts(prev => [...prev, { id, msg, type }]); };
    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
    const handleLogout = () => { setStaffUser(null); localStorage.removeItem('ekklesia_staff_user'); };

    if (!staffUser) return <StaffLogin onLogin={(user: any) => { setStaffUser(user); localStorage.setItem('ekklesia_staff_user', JSON.stringify(user)); }} isLightMode={isLightMode} />;

    return (
        <div className="min-h-screen w-full font-sans transition-colors duration-500" style={{ background: isLightMode ? '#F3F4F6' : '#0F0014' }}>
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none w-auto">{toasts.map(t => <div key={t.id} className="pointer-events-auto"><Toast msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} /></div>)}</div>
            {staffUser.department === 'CONSOLIDATION' ? (
                <ConsolidationScreen user={staffUser} addToast={addToast} onLogout={handleLogout} isLightMode={isLightMode} />
            ) : (
                <FastTrackScreen user={staffUser} addToast={addToast} onLogout={handleLogout} isLightMode={isLightMode} />
            )}
        </div>
    );
};