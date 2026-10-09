import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, Ticket, UserCheck, ArrowRight, Sparkles, Lock, UserPlus } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, HcampTitle, Tape, HcampShell } from './hcampTheme';
import { hcampService, TEAM_IDS } from '../../../services/hcampService';
import { useHcampReveal, formatRevealAt } from './useHcampReveal';

interface HcampProps { isLightMode: boolean; }

// =====================================================================
// CONFIGURAÇÃO DO EVENTO — textos
// (a data da revelação/contador é definida pelo staff no painel /hcamp/staff)
// =====================================================================
export const HCAMP_CONFIG = {
    label: 'Acampamento IBMG · 2026',
    tagline: 'Sorteie agora, descubra seu time na revelação!',
    taglineRevealed: 'Os times foram revelados!',
};

const COUNT_TILES = [
    { key: 'days', label: 'DIAS', bg: C.cream, fg: C.red, rot: -2 },
    { key: 'hours', label: 'HRS', bg: C.lime, fg: C.forest, rot: 1.5 },
    { key: 'minutes', label: 'MIN', bg: C.orange, fg: C.cream, rot: -1 },
    { key: 'seconds', label: 'SEG', bg: C.coral, fg: C.cream, rot: 2 },
] as const;

export const HcampHome = ({ isLightMode }: HcampProps) => {
    const { timeLeft, revealed, revealAt } = useHcampReveal();
    const [myTickets, setMyTickets] = useState(() => hcampService.getMyTickets());
    useEffect(() => { hcampService.syncMyTickets().then(setMyTickets); }, [revealed]);
    const hasTickets = myTickets.length > 0;

    return (
        <HcampShell isLightMode={isLightMode}>
            <div className="w-full flex flex-col items-center text-center pt-4">
                <div className="mb-8"><Tape>{HCAMP_CONFIG.label}</Tape></div>

                <HcampTitle />

                <p className="mt-10 text-2xl md:text-3xl max-w-xl" style={{ fontFamily: FONTS.marker, color: isLightMode ? C.red : C.peach }}>
                    {revealed ? HCAMP_CONFIG.taglineRevealed : HCAMP_CONFIG.tagline}
                </p>

                {/* CONTADOR — até a revelação dos times */}
                <p className="mt-8 text-xs tracking-[0.25em] opacity-70" style={{ fontFamily: FONTS.type }}>
                    {revealed ? 'TIMES REVELADOS' : `REVELAÇÃO DOS TIMES · ${formatRevealAt(revealAt).toUpperCase()}`}
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-5 w-full max-w-xl">
                    {COUNT_TILES.map((t, i) => (
                        <Scrap key={t.key} bg={t.bg} rot={t.rot} torn={i + 1}>
                            <div className="py-3 sm:py-5 flex flex-col items-center">
                                <span className="text-3xl sm:text-5xl leading-none tabular-nums" style={{ color: t.fg, fontFamily: FONTS.slab }}>
                                    {String(timeLeft[t.key]).padStart(2, '0')}
                                </span>
                                <span className="mt-1 text-[10px] sm:text-xs tracking-[0.2em]" style={{ color: t.fg, opacity: 0.8, fontFamily: FONTS.type }}>
                                    {t.label}
                                </span>
                            </div>
                        </Scrap>
                    ))}
                </div>

                {/* AÇÕES: 1. sortear/ver ticket · 2. revelar (libera no fim da contagem) · 3. staff */}
                <div className="mt-14 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-5 w-full max-w-4xl">
                    <Link to="/hcamp/sorteio" className="w-full sm:w-auto sm:min-w-[260px]">
                        <Scrap bg={C.red} rot={-1.5} torn={0}>
                            <div className="flex items-center justify-center gap-3 px-8 py-6 text-xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                {hasTickets ? <><UserPlus size={22} /> Sortear outra pessoa</> : <><Shuffle size={22} /> Sortear meu time <ArrowRight size={20} /></>}
                            </div>
                        </Scrap>
                    </Link>
                    {revealed ? (
                        <Link to="/hcamp/revelar" className="w-full sm:w-auto sm:min-w-[260px]">
                            <Scrap bg={C.orange} rot={1} torn={1}>
                                <div className="flex items-center justify-center gap-3 px-8 py-6 text-xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                    <Sparkles size={22} /> Revelar meu time
                                </div>
                            </Scrap>
                        </Link>
                    ) : (
                        <div className="relative w-full sm:w-auto sm:min-w-[260px] cursor-not-allowed" aria-disabled title="Libera quando a contagem acabar">
                            <Scrap bg={isLightMode ? '#B7AEA3' : '#3A3A35'} rot={1} torn={1} hover={false}>
                                <div className="flex items-center justify-center gap-3 px-8 py-6 text-xl opacity-70" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                    <Lock size={20} /> Revelar meu time
                                </div>
                            </Scrap>
                            <span className="absolute -top-3 -right-2 rotate-[8deg] text-[10px] px-2 py-0.5 border-2 pointer-events-none shadow-sm"
                                style={{ borderColor: C.pink, color: C.pink, fontFamily: FONTS.type, background: C.cream }}>
                                LIBERA EM {formatRevealAt(revealAt).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <Link to="/hcamp/staff" className="w-full sm:w-auto sm:min-w-[200px]">
                        <Scrap bg={C.limeLight} rot={1} torn={2}>
                            <div className="flex items-center justify-center gap-3 px-8 py-6 text-lg" style={{ color: C.forest, fontFamily: FONTS.slab }}>
                                <UserCheck size={20} /> Acesso Staff
                            </div>
                        </Scrap>
                    </Link>
                </div>

                {hasTickets && (
                    <Link to="/hcamp/ticket" className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full border text-sm opacity-90 hover:opacity-100"
                        style={{ borderColor: 'currentColor', fontFamily: FONTS.type }}>
                        <Ticket size={16} /> {myTickets.length === 1 ? 'Ver meu ticket' : `Meus tickets (${myTickets.length})`}
                    </Link>
                )}

                {/* OS TIMES */}
                <section className="mt-20 w-full max-w-4xl">
                    <h2 className="text-3xl mb-8" style={{ fontFamily: FONTS.fat }}>Os times da gincana</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {TEAM_IDS.map((id, i) => {
                            const t = TEAMS[id];
                            return (
                                <Scrap key={id} bg={t.color} rot={[-2, 1.5, -1, 2][i]} torn={i}>
                                    <div className="py-8 px-4 flex flex-col items-center" style={{ color: t.text }}>
                                        <span className="text-2xl sm:text-3xl" style={{ fontFamily: FONTS.slab }}>{t.name}</span>
                                        <span className="mt-1 text-xs tracking-[0.2em] opacity-80" style={{ fontFamily: FONTS.type }}>TIME</span>
                                    </div>
                                </Scrap>
                            );
                        })}
                    </div>
                    <p className="mt-8 text-sm opacity-70 max-w-md mx-auto" style={{ fontFamily: FONTS.type }}>
                        O sorteio é equilibrado: cada pessoa vai para o time que tem menos participantes. Seu time fica lacrado até a revelação!
                    </p>
                </section>
            </div>
        </HcampShell>
    );
};
