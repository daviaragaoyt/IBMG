import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle2, XCircle, MapPin, LogOut, HeartHandshake,
    Zap, Flame, Heart, Cross, ChevronDown,
    Baby, Scan, HandMetal, Users, Plus, ShoppingBag, Coffee,
    LayoutDashboard, // <--- Importado
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom'; // <--- Importado para navegação

// --- UTILITÁRIOS ---
export const formatPhone = (v: string) => v.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");

export const getTheme = (isLightMode: boolean) => ({
    bgApp: isLightMode ? '#F3F4F6' : '#0F0014', // Roxo Escuro Original
    cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
    borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D',
    inputBg: isLightMode ? '#F9FAFB' : '#0F0014',
    textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
    textSecondary: isLightMode ? '#666666' : '#9CA3AF',
});

export const Toast = ({ msg, type }: any) => (
    <div className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border-l-4 animate-slide-in-right bg-white text-gray-800 ${type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
        {type === 'success' ? <CheckCircle2 className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
        <span className="font-bold text-sm">{msg}</span>
    </div>
);

// --- LAYOUT BASE (Com botão Dashboard) ---
const ScreenLayout = ({ user, title, icon, accentColor, onLogout, checkpoints, selectedSpot, setSelectedSpot, theme, children }: any) => (
    <div className="flex flex-col h-full min-h-screen transition-colors duration-500" style={{ background: theme.bgApp, color: theme.textPrimary }}>
        {/* Header Transparente + Borda */}
        <div className={`pt-8 pb-6 px-6 relative z-20 border-b-2`} style={{ borderColor: accentColor }}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl shadow-lg" style={{ color: accentColor, background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>
                        {icon}
                    </div>
                    <div>
                        <h1 className="font-black text-xl uppercase tracking-tight leading-none" style={{ color: theme.textPrimary }}>{title}</h1>
                        <p className="text-xs font-bold opacity-60" style={{ color: accentColor }}>{user.name.split(' ')[0]}</p>
                    </div>
                </div>

                {/* Botões de Ação (Dashboard + Logout) */}
                <div className="flex gap-2">
                    <Link to="/ekklesia/dashboard" className="p-3 rounded-2xl transition-colors text-white hover:bg-white/10 flex items-center justify-center" style={{ border: `1px solid ${theme.borderColor}` }}>
                        <LayoutDashboard size={20} />
                    </Link>
                    <button onClick={onLogout} className="p-3 rounded-2xl transition-colors text-red-500 hover:bg-red-500/10" style={{ border: `1px solid ${theme.borderColor}` }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Select Local */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70" style={{ color: accentColor }}><MapPin size={20} /></div>
                <select className="w-full p-4 pl-12 rounded-xl font-bold text-sm shadow-sm outline-none appearance-none transition-all"
                    style={{ background: theme.inputBg, color: theme.textPrimary, border: `1px solid ${theme.borderColor}` }}
                    value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}>
                    <option value="">{checkpoints.length === 0 ? "Carregando..." : "📍 Selecione o Local..."}</option>
                    {checkpoints.map((cp: any) => <option key={cp.id} value={cp.id}>{cp.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" style={{ color: theme.textPrimary }}><ChevronDown size={16} /></div>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
);

// --- TELA 1: RECEPÇÃO ---
export const ReceptionScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const [mode, setMode] = useState<'BUTTONS' | 'SCAN'>('BUTTONS');
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');

    return (
        <ScreenLayout user={user} title="Recepção" icon={<MapPin />} accentColor="#3B82F6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 pt-4 flex flex-col h-full">
                {/* Tabs de Modo */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10 shrink-0">
                    <button onClick={() => setMode('BUTTONS')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'BUTTONS' ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}>CONTADOR</button>
                    <button onClick={() => setMode('SCAN')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'SCAN' ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}>SCANNER</button>
                </div>

                {mode === 'BUTTONS' ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                            <button onClick={() => setPersonType('VISITOR')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'VISITOR' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'border-gray-600/30 bg-transparent opacity-60'}`} style={personType !== 'VISITOR' ? { color: theme.textSecondary } : {}}><Plus size={18} /> VISITANTE</button>
                            <button onClick={() => setPersonType('MEMBER')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'MEMBER' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-600/30 bg-transparent opacity-60'}`} style={personType !== 'MEMBER' ? { color: theme.textSecondary } : {}}><Users size={18} /> MEMBRO</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'ADULTO', type: personType }, '+1 Homem')} className="bg-blue-600 h-28 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-blue-800"><span className="text-4xl mb-1">👨</span><span className="font-black text-xs">HOMEM</span></button>
                            <button onClick={() => handleCount({ gender: 'F', ageGroup: 'ADULTO', type: personType }, '+1 Mulher')} className="bg-pink-600 h-28 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-pink-800"><span className="text-4xl mb-1">👩</span><span className="font-black text-xs">MULHER</span></button>
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'JOVEM', type: personType }, '+1 Jovem')} className="bg-yellow-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-yellow-800"><span className="text-3xl mb-1">🧑‍🎤</span><span className="font-black text-xs">JOVEM</span></button>
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA', type: personType }, '+1 Criança')} className="bg-green-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-green-800"><span className="text-3xl mb-1">👶</span><span className="font-black text-xs">CRIANÇA</span></button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full pb-10">
                        <div className="w-full max-w-[280px] aspect-square rounded-[2rem] overflow-hidden bg-black border-4 border-blue-500 relative shadow-2xl shadow-blue-500/30 mx-auto">
                            <Scanner onScan={(d) => d[0]?.rawValue && console.log(d[0].rawValue)} />
                            <div className="absolute inset-0 border-[3px] border-white/20 rounded-[1.8rem] pointer-events-none m-4"></div>
                        </div>
                        <div className="mt-6 flex flex-col items-center gap-2">
                            <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg">
                                <Scan size={16} /> Aponte para o QR Code
                            </div>
                            <p className="text-xs font-medium opacity-50 uppercase tracking-widest mt-2" style={{ color: theme.textSecondary }}>Leitura Automática</p>
                        </div>
                    </div>
                )}
            </div>
        </ScreenLayout>
    );
};

// --- TELA 2: EVANGELISMO (Laranja) ---
export const EvangelismScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const commonProps = { gender: 'M', type: 'VISITOR', marketingSource: 'Ação Externa' };
    return (
        <ScreenLayout user={user} title="Evangelismo" icon={<Zap />} accentColor="#F97316" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleCount({ ...commonProps, ageGroup: 'ADULTO', gender: 'M' }, '+1 Homem')} className="bg-blue-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-blue-800"><span className="text-4xl">👨</span><span className="font-black text-xs tracking-widest mt-1">HOMEM</span></button>
                    <button onClick={() => handleCount({ ...commonProps, ageGroup: 'ADULTO', gender: 'F' }, '+1 Mulher')} className="bg-pink-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-pink-800"><span className="text-4xl">👩</span><span className="font-black text-xs tracking-widest mt-1">MULHER</span></button>
                </div>
                <div className="p-5 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5">
                    <div className="flex items-center justify-center gap-2 mb-4"><Flame size={16} className="text-orange-500" /><span className="text-xs font-black uppercase text-orange-500">Painel Sobrenatural</span></div>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleCount({ marketingSource: 'VIDA_SALVA' }, 'Salvação!')} className="bg-emerald-600 py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 border-emerald-800"><Cross size={18} /><span className="text-[9px] font-black uppercase mt-1">Salvação</span></button>
                        <button onClick={() => handleCount({ marketingSource: 'CURA' }, 'Cura!')} className="bg-red-600 py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 border-red-800"><Heart size={18} /><span className="text-[9px] font-black uppercase mt-1">Cura</span></button>
                        <button onClick={() => handleCount({ marketingSource: 'LIBERTACAO' }, 'Libertação!')} className="bg-orange-600 py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 border-orange-800"><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Libertação</span></button>
                    </div>
                </div>
            </div>
        </ScreenLayout>
    );
};

// --- TELA 3: KIDS (Verde) ---
export const KidsScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => (
    <ScreenLayout user={user} title="Ministério Kids" icon={<Baby />} accentColor="#10B981" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
        <div className="p-6 flex flex-col gap-4 justify-center h-full pb-20">
            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA', type: 'VISITOR' }, '+1 Menino')} className="bg-blue-500 flex-1 rounded-[2rem] text-white shadow-xl border-b-8 border-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center max-h-48">
                <span className="text-6xl mb-2">👦</span><span className="font-black text-2xl tracking-widest">MENINO</span>
            </button>
            <button onClick={() => handleCount({ gender: 'F', ageGroup: 'CRIANCA', type: 'VISITOR' }, '+1 Menina')} className="bg-pink-500 flex-1 rounded-[2rem] text-white shadow-xl border-b-8 border-pink-700 active:scale-95 transition-all flex flex-col items-center justify-center max-h-48">
                <span className="text-6xl mb-2">👧</span><span className="font-black text-2xl tracking-widest">MENINA</span>
            </button>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <button onClick={() => handleCount({ ageGroup: 'ADULTO', type: 'MEMBER' }, '+1 Voluntário')} className="bg-purple-600 py-4 rounded-xl text-white font-bold shadow border-b-4 border-purple-800 active:scale-95">Tio/Tia (Voluntário)</button>
                <button onClick={() => handleCount({ ageGroup: 'CRIANCA', type: 'VISITOR', marketingSource: 'VISITANTE_KIDS' }, '+1 Visitante')} className="bg-orange-500 py-4 rounded-xl text-white font-bold shadow border-b-4 border-orange-700 active:scale-95">Visitante Novo</button>
            </div>
        </div>
    </ScreenLayout>
);

// --- TELA 4: LOJAS E CANTINA (Ciano) ---
export const StoreScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    return (
        <ScreenLayout user={user} title="Store / Cantina" icon={<ShoppingBag />} accentColor="#06B6D4" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 flex flex-col h-full justify-center pb-20 gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex flex-col items-center justify-center text-center col-span-2">
                        <Coffee size={32} className="text-yellow-500 mb-2" />
                        <p className="text-xs text-yellow-500 font-bold">Registre cada atendimento/venda</p>
                    </div>
                    <button onClick={() => handleCount({ type: 'VISITOR', marketingSource: 'CLIENTE_VISITANTE' }, '+1 Cliente (Visitante)')} className="h-40 rounded-[2rem] bg-white text-gray-900 shadow-xl border-b-8 border-gray-300 active:scale-95 transition-all flex flex-col items-center justify-center">
                        <span className="text-5xl mb-2">👋</span>
                        <span className="font-black text-sm tracking-widest text-gray-500">VISITANTE</span>
                    </button>
                    <button onClick={() => handleCount({ type: 'MEMBER', marketingSource: 'CLIENTE_MEMBRO' }, '+1 Cliente (Membro)')} className="h-40 rounded-[2rem] bg-teal-600 text-white shadow-xl border-b-8 border-teal-800 active:scale-95 transition-all flex flex-col items-center justify-center">
                        <span className="text-5xl mb-2">🛒</span>
                        <span className="font-black text-sm tracking-widest">MEMBRO</span>
                    </button>
                </div>
            </div>
        </ScreenLayout>
    );
};

// --- TELA 5: ESPIRITUAL (Roxo) ---
export const PrayerScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => (
    <ScreenLayout user={user} title="Ministério Profético" icon={<HandMetal />} accentColor="#8B5CF6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
        <div className="p-6 flex flex-col h-full justify-center pb-20 gap-8">
            <div>
                <h3 className="text-center text-sm font-black uppercase opacity-60 mb-4 tracking-widest">Registrar Atendimentos</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => handleCount({ marketingSource: 'VIDA_SALVA' }, 'Salvação!')} className="bg-emerald-600 aspect-square rounded-2xl text-white shadow-lg border-b-4 border-emerald-800 active:scale-95 transition-all flex flex-col items-center justify-center"><Cross size={32} /><span className="text-xs font-black uppercase mt-2">Salvação</span></button>
                    <button onClick={() => handleCount({ marketingSource: 'CURA' }, 'Cura!')} className="bg-red-600 aspect-square rounded-2xl text-white shadow-lg border-b-4 border-red-800 active:scale-95 transition-all flex flex-col items-center justify-center"><Heart size={32} /><span className="text-xs font-black uppercase mt-2">Cura</span></button>
                    <button onClick={() => handleCount({ marketingSource: 'LIBERTACAO' }, 'Libertação!')} className="bg-orange-600 aspect-square rounded-2xl text-white shadow-lg border-b-4 border-orange-800 active:scale-95 transition-all flex flex-col items-center justify-center"><Flame size={32} /><span className="text-xs font-black uppercase mt-2">Libertação</span></button>
                </div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
                <h3 className="text-center text-sm font-black uppercase opacity-60 mb-4 tracking-widest">Fluxo do Local</h3>
                <div className="flex gap-4">
                    <button onClick={() => handleCount({ type: 'VISITOR' }, '+1 Visitante')} className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold text-sm border border-white/10 hover:bg-gray-700 transition-all">PASSOU VISITANTE</button>
                    <button onClick={() => handleCount({ type: 'MEMBER' }, '+1 Membro')} className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold text-sm border border-white/10 hover:bg-gray-700 transition-all">PASSOU MEMBRO</button>
                </div>
            </div>
        </div>
    </ScreenLayout>
);

// --- TELA 6: CONSOLIDAÇÃO (Verde Escuro) ---
export const ConsolidationScreen = ({ user, onLogout, isLightMode, addToast, theme, API_URL }: any) => {
    const [formData, setFormData] = useState({ name: '', phone: '', decision: 'Aceitou Jesus' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try {
            await fetch(`${API_URL}/consolidation/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, observer: user.name }) });
            addToast("Ficha Salva!", 'success'); setFormData({ name: '', phone: '', decision: 'Aceitou Jesus' });
        } catch (e) { addToast("Erro", 'error'); } finally { setLoading(false); }
    };

    return (
        <ScreenLayout user={user} title="Consolidação" icon={<HeartHandshake />} accentColor="#059669" onLogout={onLogout} checkpoints={[]} selectedSpot="" setSelectedSpot={() => { }} theme={theme}>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-[2rem] shadow-xl border border-white/10" style={{ background: theme.cardBg }}>
                    <div>
                        <label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">Nome Completo</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 rounded-xl font-bold border-2 outline-none focus:border-emerald-500 transition-all" style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">WhatsApp</label>
                        <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })} className="w-full p-4 rounded-xl font-bold border-2 outline-none focus:border-emerald-500 transition-all" style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} maxLength={15} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">Decisão</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Aceitou Jesus', 'Reconciliação'].map(opt => (
                                <button type="button" key={opt} onClick={() => setFormData({ ...formData, decision: opt })} className={`p-4 rounded-xl text-xs font-black border-2 transition-all ${formData.decision === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'opacity-60 border-gray-600'}`}>{opt}</button>
                            ))}
                        </div>
                    </div>
                    <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black shadow-lg active:scale-95 transition-all border-b-4 border-emerald-800">{loading ? <RefreshCw className="animate-spin mx-auto" /> : 'SALVAR FICHA'}</button>
                </form>
            </div>
        </ScreenLayout>
    );
};