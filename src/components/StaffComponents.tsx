import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Scanner } from '@yudiel/react-qr-scanner';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
// 👇 IMPORT THE NEW COMPONENT
import { StoreOrders } from './StoreOrders';

import {
    CheckCircle2, XCircle, MapPin, LogOut, HeartHandshake,
    Zap, Flame, Heart, Cross,
    Baby, HandMetal, Users, Plus,
    ShoppingBag, Coffee, CalendarClock, ArrowUpCircle,
    RefreshCw, LayoutDashboard,
    AlertCircle, ArrowLeft, Lock, DollarSign // Added DollarSign
} from 'lucide-react';

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

// --- TOAST COMPONENT ---
export const Toast = ({ msg, type }: any) => (
    <div className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border-l-4 animate-slide-in-right bg-white text-gray-800 ${type === 'success' ? 'border-emerald-500' : type === 'warning' ? 'border-yellow-500' : 'border-red-500'}`}>
        {type === 'success' ? <CheckCircle2 className="text-emerald-500" size={20} /> : type === 'warning' ? <AlertCircle className="text-yellow-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
        <span className="font-bold text-sm">{msg}</span>
    </div>
);

// --- DEFAULT SCREEN LAYOUT ---
const ScreenLayout = ({ user, title, icon, accentColor, onLogout, checkpoints, selectedSpot, theme, children }: any) => {
    const rawSpotName = checkpoints.find((c: any) => c.id === selectedSpot)?.name || "Local Indefinido";
    const currentSpotName = rawSpotName.replace(/Sala Profética|Sala Profetica/gi, "Tenda Profética");

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

// --- COMPONENT: MEETING COUNTER ---
const MeetingCounter = ({ theme }: any) => {
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

// --- SCREEN 1: RECEPTION ---
export const ReceptionScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const [mode, setMode] = useState<'BUTTONS' | 'SCAN'>('BUTTONS');
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');
    return (
        <ScreenLayout user={user} title="Recepção" icon={<MapPin />} accentColor="#3B82F6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <MeetingCounter theme={theme} />
            <div className="p-6 pt-2 flex flex-col h-full">
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
                    </div>
                )}
            </div>
        </ScreenLayout>
    );
};

export const StoreScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, addToast, onLogout, theme }: any) => {
    // Navegação: 'POS' (Venda) ou 'ORDERS' (Gestão)
    const [mode, setMode] = useState<'POS' | 'ORDERS'>('POS');

    // --- ESTADOS DO POS (Venda) ---
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [isCheckout, setIsCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const category = user.department === 'STORE' ? 'LOJA' : 'CANTINA';
    const isCantina = category === 'CANTINA';
    const accentColor = isCantina ? '#F59E0B' : '#06B6D4';
    const Icon = isCantina ? Coffee : ShoppingBag;

    // Carrega produtos
    useEffect(() => {
        if (mode === 'POS') {
            api.getProducts(category).then(setProducts).catch(console.error);
        }
    }, [mode, category]);

    const addToCart = (p: any) => setCart(prev => {
        const exist = prev.find(i => i.id === p.id);
        return exist ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...p, quantity: 1 }];
    });

    const handleFinishSale = async () => {
        if (!selectedSpot) return addToast("Selecione o local no topo!", 'error');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('buyerName', buyerName || 'Balcão');
            formData.append('phone', buyerPhone); // ENVIA O TELEFONE (Backend espera 'phone' no body ou 'buyerPhone' mas o controller usa 'phone' do request body)
            formData.append('buyerType', 'VISITOR');
            formData.append('total', String(cart.reduce((a, b) => a + b.price * b.quantity, 0)));
            formData.append('paymentMethod', paymentMethod);
            formData.append('items', JSON.stringify(cart.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price }))));
            if (proofFile) formData.append('proof', proofFile);

            await api.createOrder(formData);
            addToast(`Venda Registrada!`, 'success');
            setCart([]); setIsCheckout(false); setPaymentMethod(''); setProofFile(null); setBuyerName(''); setBuyerPhone('');
        } catch (e) {
            addToast("Erro ao processar", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenLayout user={user} title={isCantina ? "Cantina" : "Store"} icon={<Icon />} accentColor={accentColor} onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>

            {/* MENU DE NAVEGAÇÃO */}
            <div className="flex bg-white/5 p-1 mx-4 mt-2 rounded-xl border border-white/10 shrink-0">
                <button
                    onClick={() => setMode('POS')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${mode === 'POS' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
                >
                    <ShoppingBag size={16} /> NOVA VENDA
                </button>
                <button
                    onClick={() => setMode('ORDERS')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${mode === 'ORDERS' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
                >
                    <LayoutDashboard size={16} /> PEDIDOS / DELIVERY
                </button>
            </div>

            <div className="h-full overflow-hidden relative">

                {/* 👇 AQUI É ONDE O 'StoreOrders' É FINALMENTE USADO */}
                {mode === 'ORDERS' && (
                    <div className="h-full pb-20">
                        <StoreOrders />
                    </div>
                )}

                {/* TELA DE VENDA (POS) */}
                {mode === 'POS' && (
                    <div className="p-6 h-full pb-32 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            {products.map(p => (
                                <button key={p.id} onClick={() => addToCart(p)} className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-b-4 border-gray-200 dark:border-gray-700 active:scale-95 transition-all flex flex-col items-center min-h-[120px]">
                                    <span className="font-bold text-xs text-center uppercase mb-2 text-gray-700 dark:text-gray-300 line-clamp-2">{p.name}</span>
                                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-black text-gray-900 dark:text-white mt-auto">R$ {Number(p.price).toFixed(2)}</div>
                                    {cart.find(i => i.id === p.id) && <div className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shadow animate-bounce">{cart.find(i => i.id === p.id)?.quantity}</div>}
                                </button>
                            ))}
                        </div>

                        {cart.length > 0 && (
                            <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-[2rem] p-6 z-30 border-t border-gray-800 animate-slide-up">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Total a Receber</p>
                                        <h2 className="text-3xl font-black" style={{ color: accentColor }}>{formatCurrency(cart.reduce((acc, i) => acc + i.price * i.quantity, 0))}</h2>
                                    </div>
                                    <button onClick={() => setIsCheckout(true)} className="px-8 py-4 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all" style={{ background: accentColor }}>RECEBER</button>
                                </div>
                            </div>
                        )}

                        {isCheckout && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
                                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-slide-up border border-white/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                            <DollarSign className="text-green-500" /> Pagamento Balcão
                                        </h3>
                                        <button onClick={() => setIsCheckout(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500"><XCircle size={20} /></button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Nome do Cliente (Opcional)"
                                        className="w-full p-4 mb-4 rounded-xl bg-gray-50 border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                                        value={buyerName}
                                        onChange={e => setBuyerName(e.target.value)}
                                    />

                                    <input
                                        type="tel"
                                        placeholder="Telefone (WhatsApp) - Opcional"
                                        className="w-full p-4 mb-4 rounded-xl bg-gray-50 border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                                        value={buyerPhone}
                                        onChange={e => setBuyerPhone(formatPhone(e.target.value))}
                                        maxLength={15}
                                    />

                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Forma de Pagamento</p>
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {['DINHEIRO', 'PIX', 'CARTAO'].map(m => (
                                            <button key={m} onClick={() => setPaymentMethod(m)} className={`p-3 rounded-xl border-2 text-[10px] font-bold transition-all ${paymentMethod === m ? 'border-green-500 bg-green-500/10 text-green-500 shadow-lg' : 'border-gray-200 dark:border-gray-700 text-gray-400'}`}>{m}</button>
                                        ))}
                                    </div>

                                    <button onClick={handleFinishSale} disabled={!paymentMethod || loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all text-lg">
                                        {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'CONFIRMAR VENDA'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ScreenLayout>
    );
};

// --- TELA 5: KIDS ---
export const KidsScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => (
    <ScreenLayout user={user} title="Ministério Kids" icon={<Baby />} accentColor="#10B981" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
        <div className="p-6 flex flex-col gap-4 justify-center h-full pb-20">
            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA', type: 'VISITOR' }, '+1 Menino')} className="bg-blue-500 flex-1 rounded-[2rem] text-white shadow-xl border-b-8 border-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center max-h-48"><span className="text-6xl mb-2">👦</span><span className="font-black text-2xl tracking-widest">MENINO</span></button>
            <button onClick={() => handleCount({ gender: 'F', ageGroup: 'CRIANCA', type: 'VISITOR' }, '+1 Menina')} className="bg-pink-500 flex-1 rounded-[2rem] text-white shadow-xl border-b-8 border-pink-700 active:scale-95 transition-all flex flex-col items-center justify-center max-h-48"><span className="text-6xl mb-2">👧</span><span className="font-black text-2xl tracking-widest">MENINA</span></button>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <button onClick={() => handleCount({ ageGroup: 'ADULTO', type: 'MEMBER' }, '+1 Voluntário')} className="bg-purple-600 py-4 rounded-xl text-white font-bold shadow border-b-4 border-purple-800 active:scale-95">Tio/Tia (Voluntário)</button>
                <button onClick={() => handleCount({ ageGroup: 'CRIANCA', type: 'VISITOR', marketingSource: 'VISITANTE_KIDS' }, '+1 Visitante')} className="bg-orange-500 py-4 rounded-xl text-white font-bold shadow border-b-4 border-orange-700 active:scale-95">Visitante Novo</button>
            </div>
        </div>
    </ScreenLayout>
);

// --- TELA 6: EVANGELISMO ---
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
                        <button onClick={() => handleCount({ marketingSource: 'LIBERTACAO' }, 'Oração!')} className="bg-orange-600 py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 border-orange-800"><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Oração</span></button>
                    </div>
                </div>
            </div>
        </ScreenLayout>
    );
};

// --- TELA 7: CONSOLIDAÇÃO ---
export const ConsolidationScreen = ({ user, onLogout, addToast, theme }: any) => {
    const [formData, setFormData] = useState({ name: '', phone: '', decision: 'Aceitou Jesus' });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await api.saveConsolidation({ ...formData, observer: user.name }); addToast("Ficha Salva!", 'success'); setFormData({ name: '', phone: '', decision: 'Aceitou Jesus' }); }
        catch (e) { addToast("Erro", 'error'); } finally { setLoading(false); }
    };
    return (
        <ScreenLayout user={user} title="Consolidação" icon={<HeartHandshake />} accentColor="#059669" onLogout={onLogout} checkpoints={[]} selectedSpot="" setSelectedSpot={() => { }} theme={theme}>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-[2rem] shadow-xl border border-white/10" style={{ background: theme.cardBg }}>
                    <div><label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">Nome Completo</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 rounded-xl font-bold border-2 outline-none focus:border-emerald-500 transition-all" style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} /></div>
                    <div><label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">WhatsApp</label><input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })} className="w-full p-4 rounded-xl font-bold border-2 outline-none focus:border-emerald-500 transition-all" style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} maxLength={15} /></div>
                    <div><label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">Decisão</label><div className="grid grid-cols-2 gap-3">{['Aceitou Jesus', 'Reconciliação'].map(opt => (<button type="button" key={opt} onClick={() => setFormData({ ...formData, decision: opt })} className={`p-4 rounded-xl text-xs font-black border-2 transition-all ${formData.decision === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'opacity-60 border-gray-600'}`}>{opt}</button>))}</div></div>
                    <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black shadow-lg active:scale-95 transition-all border-b-4 border-emerald-800">{loading ? <RefreshCw className="animate-spin mx-auto" /> : 'SALVAR FICHA'}</button>
                </form>
            </div>
        </ScreenLayout>
    );
};

// --- TELA 8: ORAÇÃO/PROFÉTICO ---
export const PrayerScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    return (
        <ScreenLayout user={user} title="Ministério Profético" icon={<HandMetal />} accentColor="#8B5CF6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 flex flex-col h-full justify-center pb-20 gap-8">
                <div>
                    <h3 className="text-center text-sm font-black uppercase opacity-60 mb-4 tracking-widest">Registrar Atendimentos</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={() => handleCount({ marketingSource: 'VIDA_SALVA' }, 'Salvação!')} className="bg-emerald-600 aspect-square rounded-2xl text-white shadow-lg border-b-4 border-emerald-800 active:scale-95 transition-all flex flex-col items-center justify-center"><Cross size={32} /><span className="text-xs font-black uppercase mt-2">Salvação</span></button>
                        <button onClick={() => handleCount({ marketingSource: 'CURA' }, 'Cura!')} className="bg-red-600 aspect-square rounded-2xl text-white shadow-lg border-b-4 border-red-800 active:scale-95 transition-all flex flex-col items-center justify-center"><Heart size={32} /><span className="text-xs font-black uppercase mt-2">Cura</span></button>
                        <button onClick={() => handleCount({ marketingSource: 'LIBERTACAO' }, 'Oração!')} className="bg-orange-600 aspect-square rounded-2xl text-white shadow-lg border-b-4 border-orange-800 active:scale-95 transition-all flex flex-col items-center justify-center"><Flame size={32} /><span className="text-xs font-black uppercase mt-2">Oração</span></button>
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
};

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