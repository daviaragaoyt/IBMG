import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
    CheckCircle2, XCircle, MapPin, LogOut, HeartHandshake,
    Zap, Flame, Heart, Cross,
    Baby, Scan, HandMetal, Users, Plus,
    ShoppingBag, Coffee, CalendarClock, ArrowUpCircle,
    PackageCheck,
    RefreshCw, Eye, LayoutDashboard
} from 'lucide-react';

// --- UTILITÁRIOS ---
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

export const Toast = ({ msg, type }: any) => (
    <div className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border-l-4 animate-slide-in-right bg-white text-gray-800 ${type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
        {type === 'success' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
        <span className="font-bold text-sm">{msg}</span>
    </div>
);

const ScreenLayout = ({ user, title, icon, accentColor, onLogout, checkpoints, selectedSpot, theme, children }: any) => {

    const currentSpotName = checkpoints.find((c: any) => c.id === selectedSpot)?.name || "Local Indefinido";

    return (
        <div className="flex flex-col h-full min-h-screen transition-colors duration-500" style={{ background: theme.bgApp, color: theme.textPrimary }}>
            <div className={`pt-8 pb-6 px-6 relative z-20 border-b-2`} style={{ borderColor: accentColor }}>

                {/* Cabeçalho Superior */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl shadow-lg" style={{ color: accentColor, background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>{icon}</div>
                        <div>
                            <h1 className="font-black text-xl uppercase tracking-tight leading-none" style={{ color: theme.textPrimary }}>{title}</h1>
                            <p className="text-xs font-bold opacity-60" style={{ color: accentColor }}>Olá, {user.name.split(' ')[0]}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* 1. Botão Dashboard (NOVO) - Roxo */}
                        <Link to="/ekklesia/dashboard" className="p-3 rounded-2xl transition-colors bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 flex items-center justify-center">
                            <LayoutDashboard size={20} />
                        </Link>

                        {/* 2. Botão de Reuniões - Azul */}
                        <Link to="/ekklesia/reunioes" className="p-3 rounded-2xl transition-colors bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 flex items-center justify-center">
                            <CalendarClock size={20} />
                        </Link>

                        {/* 3. Botão Logout - Neutro */}
                        <button onClick={onLogout} className="p-3 rounded-2xl transition-colors text-white hover:bg-white/10" style={{ border: `1px solid ${theme.borderColor}`, color: theme.textPrimary }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Local Fixo */}
                <div className="relative p-4 rounded-xl flex items-center gap-3 border transition-all shadow-sm"
                    style={{ background: theme.inputBg, borderColor: theme.borderColor }}>
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 animate-pulse">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Você está operando em:</p>
                        <p className="font-black text-sm">{currentSpotName}</p>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]"></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
    );
};

// --- COMPONENTE: CONTADOR DE REUNIÃO ---
const MeetingCounter = ({ theme }: any) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => { api.getMeetingCount().then((d: any) => setCount(d.count)).catch(() => { }); }, []);

    const increment = async () => {
        if (!confirm(`Deseja iniciar a Reunião #${count + 1}?`)) return;
        setLoading(true);
        if (navigator.vibrate) navigator.vibrate(100);
        try {
            const data = await api.incrementMeetingCount();
            setCount(data.count);
        } finally { setLoading(false); }
    };

    return (
        <div className="mx-6 mt-4 mb-2 p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500"><CalendarClock size={24} /></div>
                <div><p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Contagem Oficial</p><h3 className="text-xl font-black leading-none" style={{ color: theme.textPrimary }}>REUNIÃO #{count}</h3></div>
            </div>
            <button onClick={increment} disabled={loading} className="p-3 rounded-xl bg-purple-600 text-white shadow-lg active:scale-95 transition-all hover:bg-purple-700 flex flex-col items-center">{loading ? <span className="animate-spin">↻</span> : <ArrowUpCircle size={24} />}</button>
        </div>
    );
};

// --- TELA 1: RECEPÇÃO ---
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
                        <div className="mt-6 flex flex-col items-center gap-2"><div className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg"><Scan size={16} /> Aponte para o QR Code</div></div>
                    </div>
                )}
            </div>
        </ScreenLayout>
    );
};

// --- TELA 4: LOJA / CANTINA (COM AUDITORIA E RETIRADA) ---
export const StoreScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, addToast, onLogout, theme }: any) => {
    const [tab, setTab] = useState<'VENDA' | 'ONLINE' | 'RETIRADA'>('VENDA');
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [isCheckout, setIsCheckout] = useState(false);

    // Estados Venda Balcão
    const [paymentMethod, setPaymentMethod] = useState('');
    const [buyerType] = useState('VISITOR');
    const [buyerGender] = useState('M');

    // Estados Auditoria Online
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [selectedAudit, setSelectedAudit] = useState<any>(null);
    const [_, setLoading] = useState(false);

    // Estados Retirada
    const [scannedOrder, setScannedOrder] = useState<any>(null);
    const [personOrders, setPersonOrders] = useState<any>(null);

    const category = user.department === 'STORE' ? 'LOJA' : 'CANTINA';
    const isCantina = category === 'CANTINA';
    const accentColor = isCantina ? '#F59E0B' : '#06B6D4';
    const Icon = isCantina ? Coffee : ShoppingBag;
    const API_IMAGE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (tab === 'VENDA') api.getProducts(category).then(setProducts).catch(console.error);
        if (tab === 'ONLINE') fetchOrders();
    }, [tab, category]);

    const fetchOrders = () => {
        setLoading(true);
        api.getPendingOrders().then(setPendingOrders).catch(() => addToast("Erro ao carregar", 'error')).finally(() => setLoading(false));
    };

    const addToCart = (p: any) => setCart(prev => {
        const exist = prev.find(i => i.id === p.id);
        return exist ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...p, quantity: 1 }];
    });

    const handleFinishSale = async () => {
        if (!selectedSpot) return addToast("Selecione o local!", 'error');
        setLoading(true);
        try {
            await api.createSale({
                checkpointId: selectedSpot, paymentMethod, buyerType, buyerGender,
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price }))
            });
            addToast(`Venda Realizada!`, 'success');
            setCart([]); setIsCheckout(false); setPaymentMethod('');
        } catch (e) { addToast("Erro venda", 'error'); }
        finally { setLoading(false); }
    };

    const handleAuditAction = async (action: 'approve' | 'reject', orderCode: string) => {
        if (!confirm(action === 'approve' ? "Aprovar pedido?" : "Rejeitar pedido?")) return;
        setLoading(true);
        try {
            if (action === 'approve') await api.payOrder(orderCode);
            else await api.rejectOrder(orderCode);

            addToast(action === 'approve' ? "Aprovado!" : "Rejeitado!", action === 'approve' ? 'success' : 'error');
            setSelectedAudit(null); fetchOrders();
        } catch (e) { addToast("Erro na ação", 'error'); }
        finally { setLoading(false); }
    };

    const handleScan = async (code: string) => {
        if (!code) return;
        setLoading(true);
        try {
            if (code.length < 8) {
                const data: any = await api.getOrder(code);
                setScannedOrder(data); setPersonOrders(null);
            } else {
                const data: any = await api.getPersonOrders(code);
                if (data.orders.length === 0) addToast("Sem pedidos", 'warning');
                else { setPersonOrders({ ...data, personId: code }); setScannedOrder(null); }
            }
        } catch (e) { addToast("Erro ou não encontrado", 'error'); }
        finally { setLoading(false); }
    };

    const handleDeliver = async (orderCode: string) => {
        setLoading(true);
        try {
            await api.deliverOrder(orderCode);
            addToast("Entregue!", 'success');
            if (scannedOrder) setScannedOrder(null);
            if (personOrders) {
                setPersonOrders((prev: any) => ({ ...prev, orders: prev.orders.filter((o: any) => o.orderCode !== orderCode) }));
            }
        } catch (e) { addToast("Erro entrega", 'error'); }
        finally { setLoading(false); }
    };

    return (
        <ScreenLayout user={user} title={isCantina ? "Cantina" : "Store"} icon={<Icon />} accentColor={accentColor} onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>

            <div className="flex bg-white/5 p-1 mx-6 mt-2 rounded-xl border border-white/10">
                <button onClick={() => setTab('VENDA')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${tab === 'VENDA' ? `bg-white text-gray-900 shadow` : 'text-gray-500'}`}>BALCÃO</button>
                <button onClick={() => setTab('ONLINE')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${tab === 'ONLINE' ? `bg-white text-gray-900 shadow` : 'text-gray-500'}`}>
                    ONLINE {pendingOrders.length > 0 && <span className="bg-red-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center">{pendingOrders.length}</span>}
                </button>
                <button onClick={() => setTab('RETIRADA')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${tab === 'RETIRADA' ? `bg-white text-gray-900 shadow` : 'text-gray-500'}`}><PackageCheck size={14} /> RETIRADA</button>
            </div>

            <div className="p-6 h-full pb-24">

                {/* ABA 1: VENDA */}
                {tab === 'VENDA' && (
                    <>
                        <div className="grid grid-cols-2 gap-3 pb-20 overflow-y-auto">
                            {products.map(p => (
                                <button key={p.id} onClick={() => addToCart(p)} className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-b-4 border-gray-200 dark:border-gray-700 active:scale-95 transition-all flex flex-col items-center min-h-[120px]">
                                    <span className="font-bold text-xs text-center uppercase mb-2 text-gray-700 dark:text-gray-300">{p.name}</span>
                                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-black text-gray-900 dark:text-white">R$ {Number(p.price).toFixed(2)}</div>
                                    {cart.find(i => i.id === p.id) && <div className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shadow">{cart.find(i => i.id === p.id)?.quantity}</div>}
                                </button>
                            ))}
                        </div>
                        {cart.length > 0 && (
                            <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-[2rem] p-6 z-30 border-t border-gray-800">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-3xl font-black" style={{ color: accentColor }}>{formatCurrency(cart.reduce((acc, i) => acc + i.price * i.quantity, 0))}</h2>
                                    <button onClick={() => setIsCheckout(true)} className="px-8 py-4 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all" style={{ background: accentColor }}>RECEBER</button>
                                </div>
                            </div>
                        )}
                        {/* MODAL CHECKOUT */}
                        {isCheckout && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4">
                                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-fade-in">
                                    <h3 className="text-xl font-black text-center mb-4 text-gray-800 dark:text-white">Pagamento Balcão</h3>
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {['DINHEIRO', 'PIX', 'CARTAO'].map(m => (
                                            <button key={m} onClick={() => setPaymentMethod(m)} className={`p-3 rounded-xl border-2 text-xs font-bold ${paymentMethod === m ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-gray-200 text-gray-400'}`}>{m}</button>
                                        ))}
                                    </div>
                                    <button onClick={handleFinishSale} disabled={!paymentMethod} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg disabled:opacity-50">FINALIZAR VENDA</button>
                                    <button onClick={() => setIsCheckout(false)} className="w-full mt-3 py-3 text-gray-400 font-bold text-xs">Cancelar</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ABA 2: ONLINE */}
                {tab === 'ONLINE' && (
                    <div className="space-y-3 pb-20 overflow-y-auto">
                        {pendingOrders.length === 0 ? <p className="text-center opacity-50 py-10">Tudo limpo.</p> : pendingOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
                                <div><p className="font-bold text-gray-800 dark:text-white">{order.buyerName}</p><p className="text-xs text-gray-500">R$ {Number(order.total).toFixed(2)}</p></div>
                                <button onClick={() => setSelectedAudit(order)} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2"><Eye size={14} /> VER</button>
                            </div>
                        ))}
                        {selectedAudit && (
                            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                                    <div className="flex-1 overflow-y-auto p-4 bg-gray-200 dark:bg-black">
                                        <p className="text-center text-xs font-bold uppercase mb-2 text-gray-500">Comprovante</p>
                                        <img src={`${API_IMAGE_URL}${selectedAudit.proofUrl}`} className="w-full rounded-xl mb-4 shadow-lg border-2 border-white" alt="Comprovante" />
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl space-y-2">
                                            {selectedAudit.items.map((i: any) => <div key={i.id} className="text-sm font-bold text-gray-800 dark:text-white flex justify-between"><span>{i.product.name}</span><span>x{i.quantity}</span></div>)}
                                        </div>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-3 bg-white dark:bg-gray-900">
                                        <button onClick={() => handleAuditAction('reject', selectedAudit.orderCode)} className="py-4 bg-red-100 text-red-600 rounded-xl font-black text-sm hover:bg-red-200">REJEITAR</button>
                                        <button onClick={() => handleAuditAction('approve', selectedAudit.orderCode)} className="py-4 bg-green-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-green-700">APROVAR</button>
                                        <button onClick={() => setSelectedAudit(null)} className="col-span-2 py-3 text-gray-400 font-bold text-xs">Voltar</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ABA 3: RETIRADA */}
                {tab === 'RETIRADA' && (
                    <div className="flex flex-col items-center">
                        {!scannedOrder && !personOrders && (
                            <div className="w-full max-w-[280px] aspect-square bg-black rounded-[2rem] overflow-hidden relative shadow-2xl border-4 mb-6" style={{ borderColor: accentColor }}>
                                <Scanner onScan={(d) => d[0]?.rawValue && handleScan(d[0].rawValue)} />
                            </div>
                        )}
                        {(scannedOrder || personOrders) && (
                            <div className="w-full bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-2xl border-2 animate-slide-up" style={{ borderColor: '#10B981' }}>
                                <h2 className="text-center font-black text-xl mb-4 text-gray-800 dark:text-white">
                                    {scannedOrder ? scannedOrder.buyerName : personOrders.personName}
                                </h2>
                                <div className="space-y-3 mb-6">
                                    {(scannedOrder ? [scannedOrder] : personOrders.orders).map((o: any) => (
                                        <div key={o.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <span className="font-mono font-black text-purple-500">#{o.orderCode}</span>
                                            {o.status === 'PAID' ?
                                                <button onClick={() => handleDeliver(o.orderCode)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg shadow">ENTREGAR</button> :
                                                <span className="text-xs font-bold text-red-500">PENDENTE</span>
                                            }
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { setScannedOrder(null); setPersonOrders(null); }} className="w-full py-3 text-gray-400 font-bold text-xs">Ler Outro</button>
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
                        <button onClick={() => handleCount({ marketingSource: 'LIBERTACAO' }, 'Libertação!')} className="bg-orange-600 py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 border-orange-800"><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Libertação</span></button>
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
        try {
            await api.saveConsolidation({ ...formData, observer: user.name });
            addToast("Ficha Salva!", 'success'); setFormData({ name: '', phone: '', decision: 'Aceitou Jesus' });
        } catch (e) { addToast("Erro", 'error'); } finally { setLoading(false); }
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
};