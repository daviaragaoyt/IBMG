import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Sparkles, UserPlus } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, HcampShell, BackLink } from './hcampTheme';
import { HcampTicketCard } from './HcampTicketCard';
import { useHcampReveal } from './useHcampReveal';
import { hcampService } from '../../../services/hcampService';

interface Props { isLightMode: boolean; }

/** "Meus tickets": todos os tickets sorteados neste celular, um de cada vez. */
export const HcampTicket = ({ isLightMode }: Props) => {
    const [params, setParams] = useSearchParams();
    const [tickets, setTickets] = useState(() => hcampService.getMyTickets());
    const { revealAt, revealed } = useHcampReveal();

    // Confere no backend (remove tickets apagados e busca o time quando já revelado)
    useEffect(() => { hcampService.syncMyTickets().then(setTickets); }, [revealed]);

    if (!tickets.length) return <Navigate to="/hcamp/sorteio" replace />;

    const ticket = tickets.find(t => t.code === params.get('code')) ?? tickets[0];
    const team = ticket.team ? TEAMS[ticket.team] : null;
    const pageBg = team ? team.dark : isLightMode ? '#CFC8BE' : C.deep;

    return (
        <HcampShell isLightMode={isLightMode} tint={team?.dark} decor={false}>
            <div className="w-full max-w-sm flex flex-col items-center">
                <BackLink label="Início" />

                {/* Seletor quando este celular sorteou mais de uma pessoa */}
                {tickets.length > 1 && (
                    <div className="w-full mb-8">
                        <div className="text-xs tracking-[0.25em] opacity-70 mb-3" style={{ fontFamily: FONTS.type }}>
                            TICKETS DESTE CELULAR ({tickets.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tickets.map(t => {
                                const active = t.code === ticket.code;
                                const tt = t.team ? TEAMS[t.team] : null;
                                return (
                                    <button key={t.code} onClick={() => setParams({ code: t.code }, { replace: true })}
                                        className="px-4 py-2 rounded-full text-sm transition-all"
                                        style={{
                                            fontFamily: FONTS.slab,
                                            background: active ? (tt?.color ?? C.cream) : 'rgba(255,255,255,0.08)',
                                            color: active ? (tt?.text ?? C.ink) : 'inherit',
                                            border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
                                        }}>
                                        {t.name.split(' ')[0]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <HcampTicketCard key={ticket.code} ticket={ticket} revealAt={revealAt} notchColor={pageBg} />

                <div className="mt-10 w-full flex flex-col gap-4">
                    {/* Revelação liberada, mas este ticket ainda está lacrado -> atalho */}
                    {!team && revealed && (
                        <Link to="/hcamp/revelar" className="w-full">
                            <Scrap bg={C.orange} rot={-1} torn={1}>
                                <div className="flex items-center justify-center gap-3 px-6 py-5 text-xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                    <Sparkles size={20} /> Revelar meu time
                                </div>
                            </Scrap>
                        </Link>
                    )}
                    <Link to="/hcamp/sorteio" className="hc-noprint self-center inline-flex items-center gap-2 px-5 py-3 rounded-full border text-sm opacity-80 hover:opacity-100"
                        style={{ borderColor: 'currentColor', fontFamily: FONTS.type }}>
                        <UserPlus size={16} /> Sortear outra pessoa
                    </Link>
                </div>
            </div>
        </HcampShell>
    );
};
