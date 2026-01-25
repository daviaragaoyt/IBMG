import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export const ImageCarousel = ({ images, productName, onClick, className = "" }: any) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const validImages = Array.isArray(images) && images.length > 0 ? images : null;

    if (!validImages) {
        return (
            <div className={`relative w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 ${className}`} onClick={onClick}>
                <ImageOff size={32} opacity={0.5} />
            </div>
        );
    }

    const next = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveIndex((prev) => (prev + 1) % validImages.length); };
    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1)); };

    return (
        <div className={`relative w-full h-full overflow-hidden group ${className}`} onClick={onClick}>
            {validImages.map((img: string, idx: number) => (
                <div key={idx} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <img src={img} alt={`${productName} ${idx}`} className="w-full h-full object-cover" />
                </div>
            ))}
            {validImages.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full z-20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90"><ChevronLeft size={18} /></button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full z-20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90"><ChevronRight size={18} /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm pointer-events-none">
                        {validImages.map((_: any, idx: number) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-white scale-125 w-3' : 'bg-white/50'}`} />))}
                    </div>
                </>
            )}
        </div>
    );
};