import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, Tape, HcampShell, BackLink } from './hcampTheme';
import { hcampService, TEAM_IDS } from '../../../services/hcampService';
import type { TeamId } from '../../../services/hcampService';

interface Props { isLightMode: boolean; }

const MIN_ROLL_MS = 2600; // duração mínima da animação

export const HcampSorteio = ({ isLightMode }: Props) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [phase, setPhase] = useState<'form' | 'rolling' | 'done'>('form');
    const [shown, setShown] = useState<TeamId>('VERMELHO');
    const rollRef = useRef<number | null>(null);

    useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current); }, []);

    // Cor já sorteada neste celular → vai direto para o ticket
    if (phase === 'form' && hcampService.getMyTicket()) return <Navigate to="/hcamp/ticket" replace />;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const clean = name.trim().replace(/\s+/g, ' ');
        if (clean.split(' ').length < 2 || clean.length < 5) {
            setError('Digite seu nome e sobrenome.');
            return;
        }
        setError('');
        setPhase('rolling');

        let i = 0;
        rollRef.current = window.setInterval(() => {
            i = (i + 1) % TEAM_IDS.length;
            setShown(TEAM_IDS[i]);
        }, 120);

        try {
            const [ticket] = await Promise.all([
                hcampService.draw(clean),
                new Promise(r => setTimeout(r, MIN_ROLL_MS)),
            ]);
            if (rollRef.current) clearInterval(rollRef.current);
            setShown(ticket.team);
            setPhase('done');
            setTimeout(() => navigate('/hcamp/ticket', { replace: true }), 1400);
        } catch (err) {
            if (rollRef.current) clearInterval(rollRef.current);
            setPhase('form');
            setError(err instanceof Error ? err.message : 'Erro ao sortear. Tente novamente.');
        }
    };

    const team = TEAMS[shown];
    const inputBg = isLightMode ? '#FFFFFF' : 'rgba(239,230,218,0.95)';

    return (
        <HcampShell isLightMode={isLightMode} tint={phase === 'form' ? undefined : team.dark} animateBg={phase !== 'rolling'}>
            <div className="w-full max-w-lg flex flex-col items-center text-center">
                {phase === 'form' && <BackLink />}

                {phase === 'form' ? (
                    <>
                        <div className="mb-8"><Tape>Gincana HCAMP</Tape></div>
                        <h1 className="text-5xl sm:text-6xl leading-tight" style={{ fontFamily: FONTS.fat }}>Qual é o seu time?</h1>
                        <p className="mt-4 text-lg opacity-80" style={{ fontFamily: FONTS.type }}>
                            Digite seu nome e toque em sortear. A cor que cair é a sua até o fim do acampamento!
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 w-full flex flex-col gap-6">
                            <Scrap bg={inputBg} rot={-1} torn={1} hover={false}>
                                <label className="block text-left px-5 pt-4 text-xs tracking-[0.2em]" style={{ color: C.forest, fontFamily: FONTS.type }} htmlFor="hc-name">
                                    NOME E SOBRENOME
                                </label>
                                <input
                                    id="hc-name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoComplete="name"
                                    autoFocus
                                    maxLength={60}
                                    placeholder="Ex.: Maria Souza"
                                    className="w-full bg-transparent px-5 pb-4 pt-1 text-2xl outline-none placeholder:opacity-40"
                                    style={{ color: C.ink, fontFamily: FONTS.slab }}
                                />
                            </Scrap>

                            {error && (
                                <p className="text-sm -mt-2" role="alert" style={{ color: isLightMode ? C.red : C.peach, fontFamily: FONTS.type }}>{error}</p>
                            )}

                            <button type="submit" className="w-full">
                                <Scrap bg={C.red} rot={1} torn={0}>
                                    <div className="flex items-center justify-center gap-3 px-8 py-6 text-2xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                        <Shuffle size={24} /> Sortear meu time
                                    </div>
                                </Scrap>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center pt-10" aria-live="polite">
                        <p className="text-xl mb-8" style={{ fontFamily: FONTS.marker, color: C.cream }}>
                            {phase === 'rolling' ? 'Sorteando...' : 'Seu time é...'}
                        </p>
                        <div key={phase} className={phase === 'done' ? 'hc-pop' : ''}>
                            <Scrap bg={team.color} rot={phase === 'done' ? -3 : 0} torn={2} hover={false}>
                                <div className="w-[260px] sm:w-[320px] py-16 flex flex-col items-center" style={{ color: team.text }}>
                                    <span className="text-xs tracking-[0.3em] opacity-80" style={{ fontFamily: FONTS.type }}>TIME</span>
                                    <span className="text-5xl sm:text-6xl mt-2" style={{ fontFamily: FONTS.slab }}>{team.name}</span>
                                </div>
                            </Scrap>
                        </div>
                    </div>
                )}
            </div>
        </HcampShell>
    );
};
