
import { Plus } from 'lucide-react';

interface ProductCardProps {
    id: string;
    image?: string;
    name: string;
    price: number;
    category: string;
    onAdd: () => void;
}

export const PublicProductCard = ({ image, name, price, category, onAdd }: ProductCardProps) => {
    // Imagens genéricas caso não tenha URL no banco
    const placeholder = category === 'STORE'
        ? 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500'
        : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=500';

    return (
        <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-lg">
            {/* Imagem */}
            <div className="h-48 w-full overflow-hidden relative">
                <img
                    src={image || placeholder}
                    alt={name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            </div>

            {/* Conteúdo */}
            <div className="absolute bottom-0 left-0 w-full p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1 block">
                    {category === 'STORE' ? 'Gourmet' : 'Collection'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight mb-2 line-clamp-1">{name}</h3>

                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="p-2 rounded-full bg-white text-black hover:bg-purple-500 hover:text-white transition-colors active:scale-90"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};