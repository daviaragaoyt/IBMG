
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../components/StaffComponents';
import { ImageCarousel } from './ImageCarousel';

// EXPORTAÇÃO 1: O Skeleton
export const ProductSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden bg-white dark:bg-white/5">
        <div className="aspect-[4/5] bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/3 animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
            </div>
        </div>
    </div>
);

// EXPORTAÇÃO 2: O Card Principal
export const ProductCard = ({ product, onOpen, onAdd, isMenuOnly, isLightMode, index }: any) => {
    const images = product.images || (product.imageUrl ? [product.imageUrl] : []);

    return (
        <div
            className="group rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 flex flex-col h-full animate-slide-up"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
            <div className="aspect-[4/5] bg-gray-200 relative cursor-pointer overflow-hidden">
                <ImageCarousel images={images} productName={product.name} onClick={() => onOpen(product)} />
                {product.category === 'LOJA' && product.name.toLowerCase().includes('ekklesia') && (
                    <div className="absolute top-2 left-2 z-20 bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm tracking-wider uppercase">Coleção 2026</div>
                )}
            </div>

            <div className="p-4 cursor-pointer flex-1 flex flex-col" onClick={() => onOpen(product)}>
                <h3 className="font-bold text-sm uppercase mb-1 leading-tight text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>

                <div className="mt-auto flex justify-between items-center pt-2">
                    <span className="font-black text-lg text-purple-600 dark:text-purple-400">{formatCurrency(Number(product.price))}</span>
                    {!isMenuOnly && (
                        <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} className={`p-2 rounded-full transition-all active:scale-75 duration-200 ${isLightMode ? 'bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700' : 'bg-white/10 hover:bg-purple-600 text-white'}`}>
                            <Plus size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};