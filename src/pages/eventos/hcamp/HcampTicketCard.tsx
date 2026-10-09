import QRCode from 'react-qr-code';
import { Lock } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, NOISE, TORN } from './hcampTheme';
import type { HcampTicket } from '../../../services/hcampService';
import { formatRevealAt } from './useHcampReveal';

const Field = ({ label, value, big = false }: { label: string; value: string; big?: boolean }) => (
    <div className="text-left">
        <div className="text-[10px] tracking-[0.25em] opacity-60" style={{ fontFamily: FONTS.type }}>{label}</div>
        <div className={big ? 'text-2xl leading-tight' : 'text-lg leading-tight'} style={{ fontFamily: FONTS.slab }}>{value}</div>
    </div>
);

// Cor do topo do ticket quando o time ainda está lacrado
const SEALED = { color: '#3A3430', text: C.cream };

/**
 * Ticket do participante.
 * - Lacrado (ticket.team = null): mostra só nome/código e quando o time será revelado.
 * - Revelado: topo na cor do time, com o nº dentro do time.
 * `notchColor` deve ser a cor de fundo da página (para os "furos" do picote).
 */
export const HcampTicketCard = ({ ticket, revealAt, notchColor }: { ticket: HcampTicket; revealAt: Date | null; notchColor: string }) => {
    const team = ticket.team ? TEAMS[ticket.team] : null;
    const top = team ?? SEALED;
    const date = new Date(ticket.createdAt);
    const dateStr = date.toLocaleDateString('pt-BR') + ' · ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="hc-pop w-full relative" style={{ filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))', transform: 'rotate(-1.5deg)' }}>
            {/* TOPO */}
            <div className="relative rounded-t-3xl px-7 pt-7 pb-9 overflow-hidden" style={{ background: top.color, backgroundImage: NOISE, backgroundBlendMode: 'multiply', color: top.text }}>
                <div className="flex justify-between items-start text-[11px] tracking-[0.25em]" style={{ fontFamily: FONTS.type }}>
                    <span>HCAMP 2026</span>
                    <span>GINCANA</span>
                </div>
                <div className="mt-8 text-sm tracking-[0.3em] opacity-85" style={{ fontFamily: FONTS.type }}>TIME</div>

                {team ? (
                    <>
                        <div className="leading-none mt-1 whitespace-nowrap" style={{ fontFamily: FONTS.slab, fontSize: 'clamp(2.6rem, 13vw, 3.6rem)' }}>{team.name}</div>
                        <div className="absolute -right-4 -bottom-8 text-[150px] leading-none opacity-15 select-none" style={{ fontFamily: FONTS.chunky }} aria-hidden>
                            #{ticket.teamNumber}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Quatro recortes cinzas no lugar do nome do time */}
                        <div className="flex gap-2 mt-2" aria-label="Time lacrado">
                            {[0, 1, 2, 3].map(i => (
                                <span key={i} className="w-11 h-12 flex items-center justify-center text-3xl"
                                    style={{ background: 'rgba(239,230,218,0.14)', clipPath: TORN[i % 3], transform: `rotate(${[-4, 3, -2, 4][i]}deg)`, fontFamily: FONTS.slab }}>?</span>
                            ))}
                        </div>
                        <div className="absolute right-5 top-14 rotate-[12deg] px-3 py-1 border-2 text-xs tracking-[0.2em] flex items-center gap-1"
                            style={{ borderColor: C.pink, color: C.pink, fontFamily: FONTS.type }}>
                            <Lock size={12} /> LACRADO
                        </div>
                        <p className="mt-5 text-sm" style={{ fontFamily: FONTS.marker, color: C.peach }}>
                            Revelado em {formatRevealAt(revealAt)}
                        </p>
                    </>
                )}
            </div>

            {/* PERFURAÇÃO */}
            <div className="relative h-0">
                <div className="absolute left-5 right-5 top-0 border-t-2 border-dashed" style={{ borderColor: top.color }} />
                <div className="absolute -left-4 -top-4 w-8 h-8 rounded-full" style={{ background: notchColor }} />
                <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full" style={{ background: notchColor }} />
            </div>

            {/* CORPO */}
            <div className="rounded-b-3xl px-7 pt-8 pb-7" style={{ background: C.cream, backgroundImage: NOISE, backgroundBlendMode: 'multiply', color: C.ink }}>
                <Field label="PARTICIPANTE" value={ticket.name} big />
                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field label="Nº NO TIME" value={ticket.teamNumber ? `#${String(ticket.teamNumber).padStart(2, '0')}` : '—'} />
                    <Field label="CÓDIGO" value={ticket.code} />
                </div>
                <div className="mt-5"><Field label="SORTEADO EM" value={dateStr} /></div>

                <div className="mt-7 flex items-center gap-5">
                    <div className="p-2 rounded-lg" style={{ background: '#fff' }}>
                        <QRCode value={ticket.code} size={92} fgColor={C.ink} bgColor="#ffffff" />
                    </div>
                    <p className="text-xs leading-relaxed opacity-70" style={{ fontFamily: FONTS.type }}>
                        {team
                            ? 'Mostre este ticket para o staff da gincana. Dica: tire um print da tela!'
                            : 'Guarde seu nome e o código. Quando a contagem acabar, toque em "Revelar meu time".'}
                    </p>
                </div>
            </div>
        </div>
    );
};
