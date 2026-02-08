import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ScreenLayout, formatCurrency } from './StaffShared';
import { StoreOrders } from '../StoreOrders';
import { ShoppingBag, Coffee, LayoutDashboard, DollarSign, XCircle, RefreshCw } from 'lucide-react';

export const StoreScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, addToast, onLogout, theme }: any) => {
    const [mode, setMode] = useState<'POS' | 'ORDERS'>('POS');
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [isCheckout, setIsCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [loading, setLoading] = useState(false);

    const category = user.department === 'STORE' ? 'LOJA' : 'CANTINA';
    const isCantina = category === 'CANTINA';
    const accentColor = isCantina ? '#F59E0B' : '#06B6D4';
    const Icon = isCantina ? Coffee : ShoppingBag;
    const [buyerEmail, setBuyerEmail] = useState('');
    const [buyerCPF, setBuyerCPF] = useState('');
    const [generateLink, setGenerateLink] = useState(false); // Toggle para decidir se quer link ou apenas registro

    // Carregar produtos baseados na categoria do departamento
    useEffect(() => {
        if (mode === 'POS') {
            api.getProducts(category).then(setProducts).catch(console.error);
        }
    }, [mode, category]);

    // Função para adicionar itens ao carrinho
    const addToCart = (p: any) => setCart(prev => {
        const exist = prev.find(i => i.id === p.id);
        return exist
            ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...prev, { ...p, quantity: 1 }];
    });

    // --- FINALIZAÇÃO DA VENDA ---
    const handleFinishSale = async () => {
        if (cart.length === 0) return addToast("Carrinho vazio!", 'warning');
        if (!paymentMethod) return addToast("Escolha o pagamento", 'warning');

        // Validação para cobrança online
        if (generateLink && (!buyerEmail || !buyerCPF)) {
            return addToast("E-mail e CPF são obrigatórios para gerar link.", 'warning');
        }

        try {
            setLoading(true);
            const saleData = {
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                paymentMethod,
                name: buyerName || 'Balcão',
                email: generateLink ? buyerEmail : undefined, // Se não tiver email, o backend trata como balcão
                cpf: generateLink ? buyerCPF : undefined,
                manualType: 'VISITOR'
            };

            const response = await api.createOrder(saleData);

            // Se o backend gerou um link de pagamento (AbacatePay)
            if (response.pixData?.url) {
                window.open(response.pixData.url, '_blank');
            }

            addToast(generateLink ? "Link gerado com sucesso!" : "Venda registrada!", 'success');

            // Limpeza
            setCart([]);
            setBuyerName('');
            setBuyerEmail('');
            setBuyerCPF('');
            setPaymentMethod('');
            setIsCheckout(false);
            setGenerateLink(false);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenLayout
            user={user}
            title={isCantina ? "Cantina" : "Store"}
            icon={<Icon />}
            accentColor={accentColor}
            onLogout={onLogout}
            checkpoints={checkpoints}
            selectedSpot={selectedSpot}
            setSelectedSpot={setSelectedSpot}
            theme={theme}
        >
            {/* Seletor de modo: PDV ou Gestão de Pedidos */}
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
                {mode === 'ORDERS' && <div className="h-full pb-20"><StoreOrders /></div>}

                {mode === 'POS' && (
                    <div className="p-6 h-full pb-32 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            {products.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-b-4 border-gray-200 dark:border-gray-700 active:scale-95 transition-all flex flex-col items-center min-h-[120px]"
                                >
                                    <span className="font-bold text-xs text-center uppercase mb-2 text-gray-700 dark:text-gray-300 line-clamp-2">{p.name}</span>
                                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-black text-gray-900 dark:text-white mt-auto">
                                        R$ {Number(p.price).toFixed(2)}
                                    </div>
                                    {cart.find(i => i.id === p.id) && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shadow animate-bounce">
                                            {cart.find(i => i.id === p.id)?.quantity}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Barra de Checkout Flutuante */}
                        {cart.length > 0 && (
                            <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-[2rem] p-6 z-30 border-t border-gray-200 dark:border-gray-800 animate-slide-up">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Total a Receber</p>
                                        <h2 className="text-3xl font-black" style={{ color: accentColor }}>
                                            {formatCurrency(cart.reduce((acc, i) => acc + i.price * i.quantity, 0))}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsCheckout(true)}
                                        className="px-8 py-4 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
                                        style={{ background: accentColor }}
                                    >
                                        RECEBER
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal de Finalização de Pagamento */}
                        {isCheckout && (
                            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
                                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-slide-up border border-white/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                            <DollarSign className="text-green-500" /> Pagamento Balcão
                                        </h3>
                                        <button onClick={() => setIsCheckout(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-red-500 transition-colors">
                                            <XCircle size={20} />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Nome do Cliente (Opcional)"
                                        className="w-full p-4 mb-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                        value={buyerName}
                                        onChange={e => setBuyerName(e.target.value)}
                                    />

                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {['DINHEIRO', 'PIX', 'CARTAO'].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setPaymentMethod(m)}
                                                className={`p-3 rounded-xl border-2 text-[10px] font-bold transition-all ${paymentMethod === m ? 'border-green-500 bg-green-500/10 text-green-500 shadow-lg' : 'border-gray-200 dark:border-gray-700 text-gray-400'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleFinishSale}
                                        disabled={!paymentMethod || loading}
                                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all text-lg flex items-center justify-center"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={24} /> : 'CONFIRMAR VENDA'}
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