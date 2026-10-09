import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, Ticket, UserCheck, ArrowRight } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, HcampTitle, Tape, HcampShell } from './hcampTheme';
import { hcampService, TEAM_IDS } from '../../../services/hcampService';

interface HcampProps { isLightMode: boolean; }

// =====================================================================
// CONFIGURAÇÃO DO EVENTO — edite aqui textos e data
// =====================================================================
export const HCAMP_CONFIG = {
    // TODO: confirmar data/hora oficial do HCAMP (usada no contador)
    date: '2026-11-14T08:00:00',
    label: 'Acampamento IBMG · 2026',
    tagline: 'Descubra o seu time da gincana!',
};

const COUNT_TILES = [
    { key: 'days', label: 'DIAS', bg: C.cream, fg: C.red, rot: -2 },
    { key: 'hours', label: 'HRS', bg: C.lime, fg: C.forest, rot: 1.5 },
    { key: 'minutes', label: 'MIN', bg: C.orange, fg: C.cream, rot: -1 },
    { key: 'seconds', label: 'SEG', bg: C.coral, fg: C.cream, rot: 2 },
] as const;

export const HcampHome = ({ isLightMode }: HcampProps) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [myTicket, setMyTicket] = useState(() => hcampService.getMyTicket());
    useEffect(() => { hcampService.syncMyTicket().then(setMyTicket); }, []);

    useEffect(() => {
        const target = new Date(HCAMP_CONFIG.date).getTime();
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const myTeam = myTicket ? TEAMS[myTicket.team] : null;

    return (
        <HcampShell isLightMode={isLightMode}>
            <div className="w-full flex flex-col items-center text-center pt-4">
                <div className="mb-8"><Tape>{HCAMP_CONFIG.label}</Tape></div>

                <HcampTitle />

                <p className="mt-10 text-2xl md:text-3xl max-w-xl" style={{ fontFamily: FONTS.marker, color: isLightMode ? C.red : C.peach }}>
                    {HCAMP_CONFIG.tagline}
                </p>

                {/* CONTADOR */}
                <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-5 w-full max-w-xl">
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

                {/* AÇÃO PRINCIPAL */}
                <div className="mt-14 flex flex-col sm:flex-row justify-center items-center gap-5 w-full max-w-2xl">
                    {myTicket && myTeam ? (
                        <Link to="/hcamp/ticket" className="w-full sm:w-auto sm:min-w-[300px]">
                            <Scrap bg={myTeam.color} rot={-1.5} torn={0}>
                                <div className="flex items-center justify-center gap-3 px-8 py-6 text-xl" style={{ color: myTeam.text, fontFamily: FONTS.slab }}>
                                    <Ticket size={22} /> Ver meu ticket <ArrowRight size={20} />
                                </div>
                            </Scrap>
                        </Link>
                    ) : (
                        <Link to="/hcamp/sorteio" className="w-full sm:w-auto sm:min-w-[300px]">
                            <Scrap bg={C.red} rot={-1.5} torn={0}>
                                <div className="flex items-center justify-center gap-3 px-8 py-6 text-xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                    <Shuffle size={22} /> Sortear meu time <ArrowRight size={20} />
                                </div>
                            </Scrap>
                        </Link>
                    )}
                    <Link to="/hcamp/staff" className="w-full sm:w-auto sm:min-w-[200px]">
                        <Scrap bg={C.limeLight} rot={1} torn={2}>
                            <div className="flex items-center justify-center gap-3 px-8 py-6 text-lg" style={{ color: C.forest, fontFamily: FONTS.slab }}>
                                <UserCheck size={20} /> Acesso Staff
                            </div>
                        </Scrap>
                    </Link>
                </div>

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
                        O sorteio é equilibrado: cada pessoa vai para o time que tem menos participantes no momento.
                    </p>
                </section>
            </div>
        </HcampShell>
    );
};
