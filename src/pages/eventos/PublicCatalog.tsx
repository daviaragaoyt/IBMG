import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Search, Filter, ShoppingCart, X, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Toast } from '../../components/StaffComponents';
import { HERO_CONFIG } from '../components/config';
// CORREÇÃO 1: Importando da pasta local ./ e não ../
import { ProductCard, ProductSkeleton } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { FlowModal } from '../components/FlowModal';

export const PublicCatalog = ({ type, isLightMode }: any) => {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [viewProduct, setViewProduct] = useState<any>(null);
    const [isFlowOpen, setIsFlowOpen] = useState(false);
    const [successOrder, setSuccessOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toasts, setToasts] = useState<any[]>([]);

    const theme = isLightMode
        ? { bg: '#F3F4F6', text: '#111827', inputBg: 'rgba(255,255,255,0.8)', border: 'rgba(0,0,0,0.05)' }
        : { bg: '#0F0014', text: '#FFFFFF', inputBg: 'rgba(26, 5, 36, 0.6)', border: 'rgba(255,255,255,0.1)' };

    const hero = HERO_CONFIG[type] || HERO_CONFIG.STORE;
    const isMenuOnly = type === 'CANTINA';

    useEffect(() => {
        setLoading(true);
        const dbCategory = type === 'STORE' ? 'LOJA' : type;
        api.getProducts(dbCategory).then(data => setProducts(data || [])).catch(() => setProducts([])).finally(() => setLoading(false));
    }, [type]);

    const addToast = (msg: string) => { const id = Date.now(); setToasts(p => [...p, { id, msg }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000); };
    const addToCart = (product: any, quantity = 1) => { if (isMenuOnly) return; setCart(prev => [...prev, { ...product, quantity, key: `${product.id}-${Date.now()}` }]); addToast("Adicionado ao carrinho!"); setIsFlowOpen(true); };

    // CORREÇÃO 2: Adicionei underline em _proofFile para o TS não reclamar que não é usado
    const handleFinalizeOrder = async (formData: any, _proofFile: any, onSuccessCallback: any) => {
        setCheckoutLoading(true);
        try {
            const response = await api.createOrder({ ...formData, total: cart.reduce((a: any, b: any) => a + b.price * b.quantity, 0), items: JSON.stringify(cart.map((i: any) => ({ productId: i.id, quantity: i.quantity, price: i.price }))) });
            if (response.pixData) { if (onSuccessCallback) onSuccessCallback(response); } else { setSuccessOrder(response.sale); setIsFlowOpen(false); setCart([]); }
        } catch (error) { console.error(error); alert("Erro ao criar pedido."); } finally { setCheckoutLoading(false); }
    };

    const allProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const ekklesiaCollection = allProducts.filter(p => p.name.toLowerCase().includes('ekklesia'));
    const otherCollection = allProducts.filter(p => !p.name.toLowerCase().includes('ekklesia'));

    const renderGrid = (list: any[]) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {list.map((p, idx) => (<ProductCard key={p.id} index={idx} product={p} onOpen={setViewProduct} onAdd={addToCart} isMenuOnly={isMenuOnly} isLightMode={isLightMode} />))}
        </div>
    );

    return (
        <div className="min-h-screen font-sans pb-32 transition-colors duration-500 selection:bg-purple-500 selection:text-white" style={{ background: theme.bg, color: theme.text }}>
            {/* HERO */}
            <div className="relative h-72 w-full overflow-hidden z-0 mb-6 group">
                <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-[20s] ease-linear group-hover:scale-110" style={{ backgroundImage: `url('${hero.bgPattern}')` }}></div>
                <div className={`absolute inset-0 bg-gradient-to-b ${isLightMode ? hero.gradientLight : hero.gradientDark}`}></div>
                <div className="absolute top-6 left-6 right-6 flex justify-between z-50">
                    <Link to="/ekklesia" className={`w-10 h-10 flex items-center justify-center backdrop-blur-md rounded-full border shadow-sm transition-all active:scale-90 hover:bg-white/20 ${isLightMode ? 'bg-white/60 text-black border-white/50' : 'bg-black/30 text-white border-white/10'}`}><ArrowLeft size={20} /></Link>
                    {!isMenuOnly && (<button onClick={() => setIsFlowOpen(true)} className={`relative w-10 h-10 flex items-center justify-center backdrop-blur-md rounded-2xl border shadow-sm transition-all active:scale-90 hover:bg-white/20 ${isLightMode ? 'bg-white/60 text-black border-white/50' : 'bg-black/30 text-white border-white/10'}`}><ShoppingCart size={20} />{cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white/20 animate-bounce">{cart.length}</span>}</button>)}
                </div>
                <div className="absolute inset-0 flex flex-col justify-end pb-10 px-6 max-w-7xl mx-auto z-10 animate-fade-in">
                    <div className={`flex items-center gap-3 mb-3 ${isLightMode ? 'opacity-60 text-black' : 'opacity-80 text-white'}`}>{React.cloneElement(hero.icon, { className: isLightMode ? "text-black opacity-40" : "text-white opacity-40" })} <span className="text-xs font-bold uppercase tracking-[0.3em] border-b border-current pb-1">Ekklesia 2026</span></div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase mb-2 drop-shadow-xl tracking-tighter leading-[0.9]">{hero.title}</h1>
                    <p className={`text-sm md:text-base font-medium max-w-md ${isLightMode ? 'text-gray-700' : 'text-white/80'}`}>{hero.subtitle}</p>
                </div>
            </div>

            {/* CONTENT */}
            <div className="relative z-20 px-4 md:px-6 -mt-8 max-w-7xl mx-auto">
                <div className="backdrop-blur-xl shadow-lg rounded-2xl flex gap-3 border mb-10 transition-all focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:scale-[1.01]" style={{ background: theme.inputBg, borderColor: theme.border, boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)' }}><div className="p-4 pl-5 opacity-40 flex items-center"><Search size={22} /></div><input type="text" placeholder="O que você procura hoje?" className="flex-1 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400 h-14" style={{ color: theme.text }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />{searchTerm && (<button onClick={() => setSearchTerm('')} className="pr-5 opacity-40 hover:opacity-100 transition-opacity"><X size={20} /></button>)}</div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(n => <ProductSkeleton key={n} />)}</div>
                ) : (
                    <>
                        {ekklesiaCollection.length > 0 && (<div className="mb-12 animate-fade-in"><div className="flex items-center gap-2 mb-5 pl-1"><div className="bg-purple-600 text-white p-1.5 rounded-lg shadow-lg shadow-purple-500/30"><Sparkles size={16} fill="currentColor" /></div><h3 className="font-black text-xl uppercase tracking-wider">Destaques Ekklesia</h3></div>{renderGrid(ekklesiaCollection)}</div>)}
                        {otherCollection.length > 0 && (<div className="animate-fade-in"><div className="flex items-center gap-2 mb-5 pl-1 opacity-70"><Filter size={18} /><h3 className="font-bold text-sm uppercase tracking-wider">Todos os Produtos</h3></div>{renderGrid(otherCollection)}</div>)}
                        {allProducts.length === 0 && (<div className="text-center py-20 opacity-50 animate-fade-in flex flex-col items-center"><div className="w-20 h-20 bg-gray-500/10 rounded-full flex items-center justify-center mb-4"><ShoppingBag size={32} /></div><p className="font-bold text-lg">Nenhum produto encontrado.</p><p className="text-sm opacity-70">Tente buscar por outro termo.</p></div>)}
                    </>
                )}
            </div>

            <div className="fixed top-6 right-6 flex flex-col items-end pointer-events-none z-[100] gap-2">{toasts.map(t => <Toast key={t.id} msg={t.msg} type="success" />)}</div>
            <ProductModal product={viewProduct} isOpen={!!viewProduct} onClose={() => setViewProduct(null)} onAddToCart={addToCart} isLightMode={isLightMode} isMenuOnly={isMenuOnly} />
            {!isMenuOnly && (<FlowModal isOpen={isFlowOpen} onClose={() => setIsFlowOpen(false)} cart={cart} setCart={setCart} total={cart.reduce((a, b) => a + b.price * b.quantity, 0)} onConfirm={handleFinalizeOrder} loading={checkoutLoading} />)}
            {successOrder && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
                    <div className="relative w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl text-center animate-scale-up border border-white/10">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-[0_0_40px_-10px_#22c55e] animate-bounce"><CheckCircle2 size={48} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black uppercase mb-2 text-gray-900 tracking-tighter">Pedido Pago!</h2>
                        <p className="text-gray-500 mb-8 font-medium">Seu pedido já foi enviado para a equipe. É só aguardar ser chamado.</p>
                        <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100"><p className="text-xs font-bold uppercase opacity-40 mb-2 tracking-widest text-gray-900">Seu Código de Retirada</p><p className="text-6xl font-black tracking-widest text-purple-600 font-mono">#{successOrder?.orderCode}</p></div>
                        <button onClick={() => setSuccessOrder(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase active:scale-95 transition-transform shadow-xl">Fechar e Comprar Mais</button>
                    </div>
                </div>
            )}
        </div>
    );
};