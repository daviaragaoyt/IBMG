import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, Lock, RotateCcw } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, Tape, HcampShell, BackLink } from './hcampTheme';
import { HcampTicketCard } from './HcampTicketCard';
import { useHcampReveal, formatRevealAt } from './useHcampReveal';
import { hcampService, HcampRevealError, TEAM_IDS } from '../../../services/hcampService';
import type { HcampTicket, TeamId } from '../../../services/hcampService';

interface Props { isLightMode: boolean; }

const MIN_ROLL_MS = 2200;

export const HcampRevelar = ({ isLightMode }: Props) => {
    const { revealAt, revealed, loading, timeLeft } = useHcampReveal();
    const [name, setName] = useState(() => hcampService.getMyTicket()?.name ?? '');
    const [code, setCode] = useState('');
    const [needCode, setNeedCode] = useState(false);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState<'form' | 'rolling' | 'done'>('form');
    const [shown, setShown] = useState<TeamId>('VERMELHO');
    const [result, setResult] = useState<HcampTicket | null>(null);
    const rollRef = useRef<number | null>(null);

    useEffect(() => () => { if (rollRef.current) clearInterval(rollRef.current); }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 3) { setError('Digite seu nome.'); return; }
        if (needCode && !code.trim()) { setError('Digite o código do seu ticket.'); return; }
        setError('');
        setPhase('rolling');
        let i = 0;
        rollRef.current = window.setInterval(() => { i = (i + 1) % TEAM_IDS.length; setShown(TEAM_IDS[i]); }, 120);

        try {
            const [ticket] = await Promise.all([
                hcampService.reveal(name, needCode ? code : undefined),
                new Promise(r => setTimeout(r, MIN_ROLL_MS)),
            ]);
            if (rollRef.current) clearInterval(rollRef.current);
            if (ticket.team) setShown(ticket.team);
            setResult(ticket);
            setPhase('done');
        } catch (err) {
            if (rollRef.current) clearInterval(rollRef.current);
            setPhase('form');
            if (err instanceof HcampRevealError && err.needCode) setNeedCode(true);
            setError(err instanceof Error ? err.message : 'Erro ao revelar. Tente novamente.');
        }
    };

    const reset = () => { setResult(null); setPhase('form'); setCode(''); setNeedCode(false); setError(''); };

    const inputBg = isLightMode ? '#FFFFFF' : 'rgba(239,230,218,0.95)';
    const team = TEAMS[shown];
    const tint = phase === 'form' ? undefined : team.dark;

    // ---------- AINDA NÃO LIBERADO ----------
    if (!loading && !revealed) {
        return (
            <HcampShell isLightMode={isLightMode}>
                <div className="w-full max-w-lg flex flex-col items-center text-center">
                    <BackLink />
                    <Lock size={40} className="mb-5 opacity-80" />
                    <h1 className="text-4xl sm:text-5xl leading-tight" style={{ fontFamily: FONTS.fat }}>Ainda é segredo!</h1>
                    <p className="mt-4 text-lg opacity-80" style={{ fontFamily: FONTS.type }}>
                        Os times serão revelados em {formatRevealAt(revealAt)}.
                    </p>
                    <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-4 w-full">
                        {([['days', 'DIAS'], ['hours', 'HRS'], ['minutes', 'MIN'], ['seconds', 'SEG']] as const).map(([k, l], i) => (
                            <Scrap key={k} bg={[C.cream, C.lime, C.orange, C.coral][i]} rot={[-2, 1.5, -1, 2][i]} torn={i} hover={false}>
                                <div className="py-3 sm:py-4 flex flex-col items-center" style={{ color: i === 0 ? C.red : i === 1 ? C.forest : C.cream }}>
                                    <span className="text-3xl sm:text-4xl leading-none tabular-nums" style={{ fontFamily: FONTS.slab }}>{String(timeLeft[k]).padStart(2, '0')}</span>
                                    <span className="mt-1 text-[10px] tracking-[0.2em] opacity-80" style={{ fontFamily: FONTS.type }}>{l}</span>
                                </div>
                            </Scrap>
                        ))}
                    </div>
                </div>
            </HcampShell>
        );
    }

    return (
        <HcampShell isLightMode={isLightMode} tint={tint} animateBg={phase !== 'rolling'} decor={phase === 'form'}>
            <div className="w-full max-w-lg flex flex-col items-center text-center">
                {phase !== 'rolling' && <BackLink />}

                {phase === 'form' && (
                    <>
                        <div className="mb-8"><Tape>Revelação dos times</Tape></div>
                        <h1 className="text-5xl sm:text-6xl leading-tight" style={{ fontFamily: FONTS.fat }}>Chegou a hora!</h1>
                        <p className="mt-4 text-lg opacity-80" style={{ fontFamily: FONTS.type }}>
                            Digite seu nome do jeito que você colocou no sorteio.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 w-full flex flex-col gap-6">
                            <Scrap bg={inputBg} rot={-1} torn={1} hover={false}>
                                <label className="block text-left px-5 pt-4 text-xs tracking-[0.2em]" style={{ color: C.forest, fontFamily: FONTS.type }} htmlFor="hc-reveal-name">
                                    NOME E SOBRENOME
                                </label>
                                <input id="hc-reveal-name" value={name} onChange={e => { setName(e.target.value); setNeedCode(false); }}
                                    autoComplete="name" maxLength={60} placeholder="Ex.: Maria Souza"
                                    className="w-full bg-transparent px-5 pb-4 pt-1 text-2xl outline-none placeholder:opacity-40"
                                    style={{ color: C.ink, fontFamily: FONTS.slab }} />
                            </Scrap>

                            {needCode && (
                                <Scrap bg={inputBg} rot={1} torn={2} hover={false}>
                                    <label className="block text-left px-5 pt-4 text-xs tracking-[0.2em]" style={{ color: C.forest, fontFamily: FONTS.type }} htmlFor="hc-reveal-code">
                                        CÓDIGO DO TICKET
                                    </label>
                                    <input id="hc-reveal-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoFocus maxLength={8}
                                        placeholder="Ex.: HC-7KQ2"
                                        className="w-full bg-transparent px-5 pb-4 pt-1 text-2xl outline-none placeholder:opacity-40 tracking-widest"
                                        style={{ color: C.ink, fontFamily: FONTS.slab }} />
                                </Scrap>
                            )}

                            {error && <p className="text-sm -mt-2" role="alert" style={{ color: isLightMode ? C.red : C.peach, fontFamily: FONTS.type }}>{error}</p>}

                            <button type="submit" className="w-full">
                                <Scrap bg={C.orange} rot={1} torn={0}>
                                    <div className="flex items-center justify-center gap-3 px-8 py-6 text-2xl" style={{ color: C.cream, fontFamily: FONTS.slab }}>
                                        <Sparkles size={24} /> Revelar meu time
                                    </div>
                                </Scrap>
                            </button>
                        </form>
                    </>
                )}

                {phase === 'rolling' && (
                    <div className="flex flex-col items-center pt-10" aria-live="polite">
                        <p className="text-xl mb-8" style={{ fontFamily: FONTS.marker, color: C.cream }}>Abrindo o lacre...</p>
                        <Scrap bg={team.color} torn={2} hover={false}>
                            <div className="w-[260px] sm:w-[320px] py-16 flex flex-col items-center" style={{ color: team.text }}>
                                <span className="text-xs tracking-[0.3em] opacity-80" style={{ fontFamily: FONTS.type }}>TIME</span>
                                <span className="text-5xl sm:text-6xl mt-2" style={{ fontFamily: FONTS.slab }}>{team.name}</span>
                            </div>
                        </Scrap>
                    </div>
                )}

                {phase === 'done' && result && (
                    <div className="w-full max-w-sm flex flex-col items-center" aria-live="polite">
                        <p className="text-2xl mb-6" style={{ fontFamily: FONTS.marker, color: C.cream }}>Seu time é...</p>
                        <HcampTicketCard ticket={result} revealAt={revealAt} notchColor={team.dark} />
                        <button onClick={reset} className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full border text-sm opacity-80 hover:opacity-100"
                            style={{ borderColor: 'currentColor', fontFamily: FONTS.type }}>
                            <RotateCcw size={16} /> Revelar outro nome
                        </button>
                    </div>
                )}
            </div>
        </HcampShell>
    );
};
