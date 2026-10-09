import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { TeamId } from '../../../services/hcampService';

// =====================================================================
// PALETA (extraída da arte "HCAMP" — colagem de recortes)
// =====================================================================
export const HCAMP_COLORS = {
    forest: '#2F4A2E',   // verde-escuro (letra H)
    deep: '#1C2B1B',     // fundo escuro
    lime: '#B9C65E',     // verde-lima (fundo do H / P)
    limeLight: '#CBD873',
    orange: '#E0833A',   // laranja (fundo do C)
    peach: '#E5A565',
    red: '#B84230',      // vermelho (A / fundo do M)
    coral: '#DA5F55',
    cream: '#EFE6DA',    // creme / papel
    paper: '#E7DACF',
    pink: '#D9488F',     // contorno rosa do H
    ink: '#1F1A17',
};
const C = HCAMP_COLORS;

export const FONTS = {
    slab: '"Alfa Slab One", serif',
    fat: '"Abril Fatface", serif',
    chunky: '"Bowlby One", sans-serif',
    type: '"Special Elite", monospace',
    marker: '"Permanent Marker", cursive',
};

// =====================================================================
// TIMES DA GINCANA
// =====================================================================
export const TEAMS: Record<TeamId, { name: string; color: string; dark: string; text: string }> = {
    VERMELHO: { name: 'Vermelho', color: '#C8372D', dark: '#5E1712', text: '#FFF4E8' },
    AMARELO: { name: 'Amarelo', color: '#F2B632', dark: '#5C4205', text: '#2A1E05' },
    AZUL: { name: 'Azul', color: '#2F6DB5', dark: '#122C50', text: '#F1F6FF' },
    VERDE: { name: 'Verde', color: '#3F8A3C', dark: '#173816', text: '#F2FBEF' },
};

// Textura de papel (ruído SVG) e recortes "rasgados"
export const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .28 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
export const TORN = [
    'polygon(2% 4%, 18% 0%, 41% 3%, 63% 0%, 86% 2%, 100% 0%, 97% 22%, 100% 47%, 98% 71%, 100% 96%, 79% 100%, 55% 97%, 30% 100%, 8% 98%, 0% 100%, 3% 74%, 0% 50%, 2% 26%)',
    'polygon(0% 0%, 24% 3%, 48% 0%, 72% 4%, 100% 1%, 98% 28%, 100% 52%, 97% 77%, 100% 100%, 74% 97%, 51% 100%, 26% 96%, 1% 100%, 3% 72%, 0% 49%, 3% 23%)',
    'polygon(3% 1%, 30% 0%, 52% 3%, 77% 0%, 99% 3%, 100% 25%, 97% 50%, 100% 74%, 98% 99%, 70% 97%, 46% 100%, 22% 97%, 0% 99%, 2% 75%, 0% 52%, 3% 27%)',
];

/** Recorte de papel reutilizável */
export const Scrap = ({ bg, rot = 0, torn = 0, className = '', style, hover = true, children }: {
    bg: string; rot?: number; torn?: number; className?: string; style?: CSSProperties; hover?: boolean; children: ReactNode;
}) => (
    <div className={`${hover ? 'hc-scrap' : 'hc-scrap-static'} relative ${className}`} style={{ ['--rot' as string]: `${rot}deg`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))', ...style }}>
        <div className="relative" style={{ background: bg, backgroundImage: NOISE, backgroundBlendMode: 'multiply', clipPath: TORN[torn % TORN.length] }}>
            {children}
        </div>
    </div>
);

/** Título "HCAMP" em colagem — cada letra num recorte diferente */
const LETTERS: { ch: string; bg: string; fg: string; font: string; rot: number; shadow: string; size?: string; italic?: boolean }[] = [
    { ch: 'H', bg: C.lime, fg: C.forest, font: FONTS.chunky, rot: -4, shadow: `3px 3px 0 ${C.pink}, -1px -1px 0 ${C.pink}` },
    { ch: 'C', bg: C.orange, fg: C.cream, font: FONTS.fat, rot: 3, shadow: `3px 3px 0 ${C.red}` },
    { ch: 'A', bg: C.cream, fg: C.red, font: FONTS.slab, rot: -2, shadow: `2px 2px 0 ${C.peach}`, size: '0.85em' },
    { ch: 'M', bg: C.red, fg: C.cream, font: FONTS.fat, rot: 2, shadow: `2px 2px 0 ${C.ink}55`, italic: true },
    { ch: 'P', bg: C.limeLight, fg: C.cream, font: FONTS.slab, rot: -3, shadow: `-2px 0 0 ${C.ink}, 2px 0 0 ${C.ink}, 0 2px 0 ${C.ink}, 0 -2px 0 ${C.ink}` },
];

export const HcampTitle = ({ size = 'clamp(3.4rem, 15vw, 9.5rem)' }: { size?: string }) => (
    <h1 aria-label="HCAMP" className="flex justify-center items-end gap-1.5 sm:gap-3 select-none" style={{ fontSize: size, lineHeight: 1 }}>
        {LETTERS.map((l, i) => (
            <span key={l.ch} className="hc-letter" style={{ animationDelay: `${i * 90}ms` }} aria-hidden>
                <Scrap bg={l.bg} rot={l.rot} torn={i}>
                    <span className="block px-[0.12em] pt-[0.08em] pb-[0.04em]"
                        style={{ color: l.fg, fontFamily: l.font, textShadow: l.shadow, fontSize: l.size ?? '1em', fontStyle: l.italic ? 'italic' : 'normal' }}>
                        {l.ch}
                    </span>
                </Scrap>
            </span>
        ))}
    </h1>
);

/** Fita adesiva com texto */
export const Tape = ({ children, rot = -2 }: { children: ReactNode; rot?: number }) => (
    <div className="inline-block px-6 py-2 shadow-md text-xs sm:text-sm uppercase tracking-[0.2em]"
        style={{ transform: `rotate(${rot}deg)`, background: 'rgba(229,165,101,0.88)', color: C.ink, fontFamily: FONTS.type }}>
        {children}
    </div>
);

/** Estrutura de página: fundo de telha + textura + rodapé */
export const HcampShell = ({ isLightMode, children, tint, footer = true, decor = true, animateBg = true }: {
    isLightMode: boolean; children: ReactNode; tint?: string; footer?: boolean; decor?: boolean; animateBg?: boolean;
}) => {
    const bg = tint ?? (isLightMode ? '#CFC8BE' : C.deep);
    const text = tint ? C.cream : isLightMode ? C.ink : C.cream;
    const corrugated = isLightMode && !tint
        ? 'repeating-linear-gradient(115deg, rgba(0,0,0,0.04) 0 14px, rgba(255,255,255,0.18) 14px 28px)'
        : 'repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0 14px, rgba(0,0,0,0.14) 14px 28px)';

    return (
        <div className="min-h-[calc(100vh-70px)] w-full flex flex-col relative overflow-hidden" style={{ backgroundColor: bg, color: text, transition: animateBg ? 'background-color .5s' : 'none' }}>
            <style>{`
                .hc-scrap, .hc-scrap-static { transform: rotate(var(--rot)); transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
                .hc-scrap:hover { transform: rotate(0deg) scale(1.05); }
                .hc-letter { animation: hc-drop .7s cubic-bezier(.34,1.56,.64,1) both; }
                .hc-pop { animation: hc-pop .6s cubic-bezier(.34,1.56,.64,1) both; }
                @keyframes hc-drop { from { opacity: 0; transform: translateY(-40px) rotate(-12deg); } to { opacity: 1; transform: none; } }
                @keyframes hc-pop { from { opacity: 0; transform: scale(.6) rotate(-6deg); } to { opacity: 1; transform: none; } }
                @media (prefers-reduced-motion: reduce) { .hc-letter, .hc-pop { animation: none; } .hc-scrap, .hc-scrap:hover { transition: none; } }
                @media print { header { display: none !important; } .hc-noprint { display: none !important; } }
            `}</style>

            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: corrugated }} />
            <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: NOISE, mixBlendMode: isLightMode && !tint ? 'multiply' : 'overlay' }} />
            {decor && !tint && (
                <>
                    <div className="hidden md:block absolute -left-10 top-24 w-48 h-28 rotate-[-14deg] opacity-80 pointer-events-none" style={{ background: C.orange, clipPath: TORN[1] }} />
                    <div className="hidden md:block absolute -right-8 top-1/3 w-40 h-40 rotate-[18deg] opacity-70 pointer-events-none" style={{ background: C.lime, clipPath: TORN[0] }} />
                    <div className="hidden md:block absolute left-[8%] bottom-28 w-24 h-24 rotate-[8deg] opacity-60 pointer-events-none" style={{ background: C.pink, clipPath: TORN[2] }} />
                </>
            )}

            <main className="relative z-10 flex-1 flex flex-col items-center px-4 pt-10 pb-16 md:pt-16">
                {children}
            </main>

            {footer && (
                <footer className="hc-noprint relative z-10 text-center py-8 text-sm border-t"
                    style={{ color: tint ? 'rgba(255,255,255,0.7)' : isLightMode ? '#5b5249' : '#b9b2a5', borderColor: tint ? 'rgba(255,255,255,0.15)' : isLightMode ? '#bdb3a7' : '#2F4A2E', fontFamily: FONTS.type }}>
                    © 2026 HCAMP - IBMG
                </footer>
            )}
        </div>
    );
};

export const BackLink = ({ to = '/hcamp', label = 'Voltar' }: { to?: string; label?: string }) => (
    <Link to={to} className="hc-noprint self-start inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity mb-6" style={{ fontFamily: FONTS.type }}>
        <ArrowLeft size={16} /> {label}
    </Link>
);
