import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { HCAMP_COLORS as C, FONTS, TEAMS, NOISE, HcampShell, BackLink } from './hcampTheme';
import { hcampService } from '../../../services/hcampService';

interface Props { isLightMode: boolean; }

const Field = ({ label, value, big = false }: { label: string; value: string; big?: boolean }) => (
    <div className="text-left">
        <div className="text-[10px] tracking-[0.25em] opacity-60" style={{ fontFamily: FONTS.type }}>{label}</div>
        <div className={big ? 'text-2xl leading-tight' : 'text-lg leading-tight'} style={{ fontFamily: FONTS.slab }}>{value}</div>
    </div>
);

export const HcampTicket = ({ isLightMode }: Props) => {
    const [ticket, setTicket] = useState(() => hcampService.getMyTicket());

    // Confere no backend se o ticket ainda vale (o staff pode ter zerado o sorteio)
    useEffect(() => { hcampService.syncMyTicket().then(setTicket); }, []);

    if (!ticket) return <Navigate to="/hcamp/sorteio" replace />;

    const team = TEAMS[ticket.team];
    const date = new Date(ticket.createdAt);
    const dateStr = date.toLocaleDateString('pt-BR') + ' · ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <HcampShell isLightMode={isLightMode} tint={team.dark}>
            <div className="w-full max-w-sm flex flex-col items-center">
                <BackLink label="Início" />

                <div className="hc-pop w-full relative" style={{ filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))', transform: 'rotate(-1.5deg)' }}>
                    {/* TOPO — cor do time */}
                    <div className="relative rounded-t-3xl px-7 pt-7 pb-9 overflow-hidden" style={{ background: team.color, backgroundImage: NOISE, backgroundBlendMode: 'multiply', color: team.text }}>
                        <div className="flex justify-between items-start text-[11px] tracking-[0.25em]" style={{ fontFamily: FONTS.type }}>
                            <span>HCAMP 2026</span>
                            <span>GINCANA</span>
                        </div>
                        <div className="mt-8 text-sm tracking-[0.3em] opacity-85" style={{ fontFamily: FONTS.type }}>TIME</div>
                        <div className="leading-none mt-1 whitespace-nowrap" style={{ fontFamily: FONTS.slab, fontSize: 'clamp(2.6rem, 13vw, 3.6rem)' }}>{team.name}</div>
                        <div className="absolute -right-4 -bottom-8 text-[150px] leading-none opacity-15 select-none" style={{ fontFamily: FONTS.chunky }} aria-hidden>
                            #{ticket.teamNumber}
                        </div>
                    </div>

                    {/* PERFURAÇÃO */}
                    <div className="relative h-0">
                        <div className="absolute left-5 right-5 top-0 border-t-2 border-dashed" style={{ borderColor: team.color }} />
                        <div className="absolute -left-4 -top-4 w-8 h-8 rounded-full" style={{ background: team.dark }} />
                        <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full" style={{ background: team.dark }} />
                    </div>

                    {/* CORPO — dados do participante */}
                    <div className="rounded-b-3xl px-7 pt-8 pb-7" style={{ background: C.cream, backgroundImage: NOISE, backgroundBlendMode: 'multiply', color: C.ink }}>
                        <Field label="PARTICIPANTE" value={ticket.name} big />
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <Field label="Nº NO TIME" value={`#${String(ticket.teamNumber).padStart(2, '0')}`} />
                            <Field label="CÓDIGO" value={ticket.code} />
                        </div>
                        <div className="mt-5"><Field label="SORTEADO EM" value={dateStr} /></div>

                        <div className="mt-7 flex items-center gap-5">
                            <div className="p-2 rounded-lg" style={{ background: '#fff' }}>
                                <QRCode value={ticket.code} size={92} fgColor={C.ink} bgColor="#ffffff" />
                            </div>
                            <p className="text-xs leading-relaxed opacity-70" style={{ fontFamily: FONTS.type }}>
                                Mostre este ticket para o staff da gincana. Dica: tire um print da tela!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </HcampShell>
    );
};
