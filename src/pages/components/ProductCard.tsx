import { useState } from 'react';
import { X, Minus, Plus, MapPin, } from 'lucide-react';
import { formatCurrency } from '../../components/StaffComponents';
import { ImageCarousel } from './ImageCarousel';
import { MOCK_SIZES } from './config';

export const ProductModal = ({ product, isOpen, onClose, onAddToCart, isLightMode, isMenuOnly }: any) => {
    if (!isOpen || !product) return null;
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');

    // Cores dinâmicas
    const bgModal = isLightMode ? 'bg-white' : 'bg-[#12031a]';
    const textMain = isLightMode ? 'text-gray-900' : 'text-white';
    const secondaryText = isLightMode ? 'text-gray-500' : 'text-gray-400';
    const border = isLightMode ? 'border-gray-100' : 'border-white/10';

    const images = product.images || (product.imageUrl ? [product.imageUrl] : []);

    const handleAdd = () => {
        if (isMenuOnly) return;
        if (!selectedSize && product.category === 'LOJA') return alert("Por favor, selecione um tamanho.");
        const size = product.category === 'LOJA' ? selectedSize : 'UN';
        onAddToCart({ ...product, size }, quantity);
        onClose();
        setQuantity(1);
        setSelectedSize('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center animate-fade-in">
            {/* Backdrop com Blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Container do Modal */}
            <div className={`relative w-full md:max-w-5xl ${bgModal} h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slide-up ring-1 ring-white/10`}>

                {/* Botão Fechar Flutuante */}
                <button onClick={onClose} className="absolute top-4 right-4 z-30 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all active:scale-90 backdrop-blur-md border border-white/10">
                    <X size={24} />
                </button>

                {/* Coluna da Imagem */}
                <div className="w-full md:w-1/2 relative h-[45vh] md:h-auto bg-gray-100 dark:bg-black">
                    <ImageCarousel images={images} productName={product.name} className="h-full" />
                    {/* Gradiente para texto legível se a imagem for clara */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden pointer-events-none"></div>
                </div>

                {/* Coluna de Informações */}
                <div className={`w-full md:w-1/2 flex flex-col ${textMain} relative`}>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6">
                        {/* Tags */}
                        <div className="flex gap-2 mb-3">
                            {product.category === 'LOJA' && (
                                <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-1 rounded shadow-sm tracking-wider uppercase">Coleção 2026</span>
                            )}
                            {isMenuOnly && (
                                <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-1 rounded shadow-sm tracking-wider uppercase">Gourmet</span>
                            )}
                        </div>

                        {/* Título e Preço */}
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-2 leading-none tracking-tight">{product.name}</h2>
                        <div className="flex items-baseline gap-2 mb-6">
                            <p className="text-4xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(Number(product.price))}</p>
                            {product.category === 'LOJA' && <span className={`text-xs font-bold line-through ${secondaryText}`}>R$ 189,90</span>}
                        </div>

                        {/* Descrição */}
                        <div className={`p-4 rounded-2xl mb-8 ${isLightMode ? 'bg-gray-50' : 'bg-white/5'}`}>
                            <h4 className="text-xs font-bold uppercase opacity-50 mb-2">Descrição</h4>
                            <p className={`text-sm leading-relaxed font-medium ${secondaryText}`}>
                                {product.description || "Este produto foi desenvolvido exclusivamente para a conferência Ekklesia 2026. Design único, material premium e acabamento impecável."}
                            </p>
                        </div>

                        {/* Seletor de Tamanho (Loja) */}
                        {product.category === 'LOJA' && !isMenuOnly && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold uppercase opacity-50">Selecione o Tamanho</span>
                                    <span className="text-[10px] font-bold underline opacity-50 cursor-pointer">Guia de Medidas</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {MOCK_SIZES.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-all active:scale-95 ${selectedSize === size ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30' : `${isLightMode ? 'border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'}`}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer de Ação (Sticky no Mobile) */}
                    {!isMenuOnly ? (
                        <div className={`p-4 md:p-6 border-t ${border} bg-opacity-90 backdrop-blur-lg absolute bottom-0 left-0 right-0 md:relative md:bg-transparent`}>
                            <div className="flex gap-4">
                                {/* Contador */}
                                <div className={`flex items-center justify-between px-2 rounded-2xl w-32 shrink-0 ${isLightMode ? 'bg-gray-100' : 'bg-white/10'}`}>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center opacity-50 hover:opacity-100 active:scale-90"><Minus size={18} /></button>
                                    <span className="text-lg font-black font-mono">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center opacity-50 hover:opacity-100 active:scale-90"><Plus size={18} /></button>
                                </div>

                                {/* Botão Adicionar */}
                                <button
                                    onClick={handleAdd}
                                    disabled={product.category === 'LOJA' && !selectedSize}
                                    className="flex-1 py-4 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    Adicionar <span className="hidden sm:inline">• {formatCurrency(product.price * quantity)}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-6 border-t ${border} text-center`}>
                            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center gap-3">
                                <div className="bg-orange-100 dark:bg-orange-500/20 p-2 rounded-full text-orange-600 dark:text-orange-400"><MapPin size={20} /></div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase opacity-50">Disponível no Balcão</p>
                                    <p className="text-sm font-bold">Peça na Praça Gourmet</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};