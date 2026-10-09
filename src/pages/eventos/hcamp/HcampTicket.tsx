import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, HcampShell, BackLink } from './hcampTheme';
import { HcampTicketCard } from './HcampTicketCard';
import { useHcampReveal } from './useHcampReveal';
import { hcampService } from '../../../services/hcampService';

interface Props { isLightMode: boolean; }

export const HcampTicket = ({ isLightMode }: Props) => {
    const [ticket, setTicket] = useState(() => hcampService.getMyTicket());
    const { revealAt, revealed } = useHcampReveal();

    // Confere no backend se o ticket ainda vale (e busca o time quando já tiver sido revelado)
    useEffect(() => { hcampService.syncMyTicket().then(setTicket); }, [revealed]);

    if (!ticket) return <Navigate to="/hcamp/sorteio" replace />;

    const team = ticket.team ? TEAMS[ticket.team] : null;
    const pageBg = team ? team.dark : isLightMode ? '#CFC8BE' : C.deep;

    return (
        <HcampShell isLightMode={isLightMode} tint={team?.dark} decor={false}>
            <div className="w-full max-w-sm flex flex-col items-center">
                <BackLink label="Início" />

                <HcampTicketCard ticket={ticket} revealAt={revealAt} notchColor={pageBg} />

                {/* Revelação liberada, mas este ticket ainda está lacrado -> atalho */}
                {!team && revealed && (
                    <Link to="/hcamp/revelar" className="mt-10 w-full">
                        <Scrap bg={C.orange} rot={-1} torn={1}>
                            <div className="flex items-center justify-center gap-3 px-6 py-5 text-xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                <Sparkles size={20} /> Revelar meu time
                            </div>
                        </Scrap>
                    </Link>
                )}
            </div>
        </HcampShell>
    );
};
