import { useState } from 'react';
import { X, Minus, Plus, MapPin } from 'lucide-react';
import { formatCurrency } from '../../components/StaffComponents';
import { ImageCarousel } from './ImageCarousel';
import { MOCK_SIZES } from './config';

export const ProductModal = ({ product, isOpen, onClose, onAddToCart, isLightMode, isMenuOnly }: any) => {
    if (!isOpen || !product) return null;
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');

    const bgModal = isLightMode ? 'bg-white' : 'bg-[#1A0524] border border-white/10';
    const textMain = isLightMode ? 'text-gray-900' : 'text-white';
    const btnSecondary = isLightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-white';
    const images = product.images || (product.imageUrl ? [product.imageUrl] : []);

    const handleAdd = () => {
        if (isMenuOnly) return;
        if (!selectedSize && product.category === 'LOJA') return alert("Selecione um tamanho.");
        const size = product.category === 'LOJA' ? selectedSize : 'UN';
        onAddToCart({ ...product, size }, quantity); onClose(); setQuantity(1); setSelectedSize('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`relative w-full md:max-w-4xl ${bgModal} rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] h-[85vh] md:h-auto animate-slide-up`}>
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all active:scale-90 backdrop-blur-sm"><X size={20} /></button>
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-black relative h-72 md:h-auto"><ImageCarousel images={images} productName={product.name} className="h-full" /></div>
                <div className={`w-full md:w-1/2 p-6 flex flex-col overflow-y-auto ${textMain}`}>
                    <div className="mb-auto">
                        <h2 className="text-2xl font-black uppercase mb-1 leading-none tracking-tight">{product.name}</h2>
                        <div className="flex items-center gap-2 mb-4"><p className="text-3xl font-black text-purple-600 dark:text-purple-400">{formatCurrency(Number(product.price))}</p>{product.category === 'LOJA' && <span className="text-[10px] font-bold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded border border-purple-500/20 uppercase">Oficial</span>}</div>
                        <p className="text-sm opacity-70 mb-6 font-medium leading-relaxed">{product.description || "Produto oficial. Garanta o seu."}</p>
                        {product.category === 'LOJA' && !isMenuOnly && (<div className="mb-8"><span className="text-xs font-bold uppercase opacity-50 block mb-3">Tamanho</span><div className="flex flex-wrap gap-3">{MOCK_SIZES.map(size => (<button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all active:scale-95 ${selectedSize === size ? 'bg-purple-600 border-purple-600 text-white' : `${isLightMode ? 'border-gray-200 text-gray-600 hover:border-purple-300' : 'border-white/10 text-white/70 hover:border-white/30'}`}`}>{size}</button>))}</div></div>)}
                    </div>
                    {!isMenuOnly ? (
                        <div className={`mt-6 pt-6 border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'} space-y-4`}><div className={`flex items-center justify-between p-2 rounded-xl ${btnSecondary}`}><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-black/10 active:scale-90 transition-transform"><Minus size={20} /></button><span className="text-2xl font-black font-mono">{quantity}</span><button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-black/10 active:scale-90 transition-transform"><Plus size={20} /></button></div><button onClick={handleAdd} disabled={product.category === 'LOJA' && !selectedSize} className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-all active:scale-95">ADICIONAR</button></div>
                    ) : (<div className={`mt-6 pt-6 border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'} text-center`}><div className="p-4 bg-gray-100 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10"><MapPin className="mx-auto mb-2 opacity-50" size={24} /><p className="text-xs font-bold uppercase opacity-50 mb-1">Disponível no Balcão</p></div></div>)}
                </div>
            </div>
        </div>
    );
};