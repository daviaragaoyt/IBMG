import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { PublicProductCard } from '../../components/PublicProductCard';
import { PublicCart } from '../../components/PublicCart';

interface CatalogProps {
    type: 'STORE' | 'CANTINA';
    isLightMode: boolean;
}

export const PublicCatalog = ({ type, isLightMode }: CatalogProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const isCantina = type === 'CANTINA';

    const theme = {
        bg: isLightMode ? '#F3F4F6' : '#0F0014',
        text: isLightMode ? '#1A1A1A' : '#FFFFFF',
        accent: isCantina ? '#F59E0B' : '#06B6D4',
        gradient: isCantina
            ? 'linear-gradient(135deg, #F59E0B, #DC2626)'
            : 'linear-gradient(135deg, #06B6D4, #3B82F6)'
    };

    useEffect(() => {
        const cat = isCantina ? 'CANTINA' : 'LOJA';
        // Busca os produtos do backend
        fetch(`${API_URL}/products?category=${cat}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
                else setProducts([]);
            })
            .catch(console.error);
    }, [type, isCantina, API_URL]);

    const handleAddToCart = (product: any) => {
        if (navigator.vibrate) navigator.vibrate(50);
        setCart(prev => {
            const existing = prev.find((p: any) => p.productId === product.id);
            if (existing) {
                return prev.map((p: any) => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { productId: product.id, quantity: 1, price: product.price, name: product.name }];
        });
        setIsCartOpen(true);
    };

    return (
        <div className="min-h-screen w-full font-sans transition-colors duration-500 pb-20" style={{ background: theme.bg, color: theme.text }}>

            {/* Header Hero */}
            <div className="relative pt-24 pb-20 px-6 rounded-b-[3rem] overflow-hidden shadow-2xl mb-8">
                <div className="absolute inset-0 opacity-20" style={{ background: theme.gradient }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <Link to="/ekklesia" className="inline-flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 mb-8 transition-opacity p-2 rounded-lg hover:bg-white/5">
                        <ArrowLeft size={18} /> Voltar
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20`}>
                                    {isCantina ? <UtensilsCrossed size={20} /> : <ShoppingBag size={20} />}
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Catálogo Oficial</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-2">
                                {isCantina ? 'Praça Gourmet' : 'Loja Psalms'}
                            </h1>
                            <p className="opacity-60 max-w-md text-lg leading-relaxed">
                                {isCantina
                                    ? 'Sabores preparados para sua comunhão. Peça aqui e retire no balcão.'
                                    : 'Vista a identidade do reino. Produtos exclusivos da conferência.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Produtos */}
            <div className="max-w-5xl mx-auto px-6">
                {products.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <p className="text-xl font-bold">Carregando vitrine...</p>
                        <p className="text-sm">(Verifique se o backend está rodando)</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map(p => (
                            <PublicProductCard
                                key={p.id}
                                id={p.id}
                                name={p.name}
                                price={Number(p.price)}
                                category={isCantina ? 'CANTINA' : 'LOJA'}
                                image={p.imageUrl}
                                onAdd={() => handleAddToCart(p)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Botão Flutuante do Carrinho */}
            {!isCartOpen && cart.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-8 right-8 text-white p-5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 animate-bounce transition-transform hover:scale-110"
                    style={{ background: theme.gradient }}
                >
                    <ShoppingBag size={28} strokeWidth={2.5} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white w-7 h-7 rounded-full text-xs flex items-center justify-center font-black border-2 border-[#0F0014]">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                </button>
            )}

            {/* Modal de Carrinho */}
            {isCartOpen && (
                <PublicCart
                    cart={cart}
                    products={products}
                    setCart={setCart}
                    onClose={() => setIsCartOpen(false)}
                />
            )}
        </div>
    );
};