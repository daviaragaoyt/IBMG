import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, RotateCcw, Search, Lock, RefreshCw, LogOut, Sparkles, CalendarClock, Unlock } from 'lucide-react';
import { HCAMP_COLORS as C, FONTS, TEAMS, Scrap, Tape, HcampShell, BackLink } from './hcampTheme';
import { hcampService, HcampAuthError, TEAM_IDS } from '../../../services/hcampService';
import type { HcampStats, HcampStaffUser, TeamId } from '../../../services/hcampService';
import { useHcampReveal, formatRevealAt } from './useHcampReveal';

/** Date -> valor do <input type="datetime-local"> no fuso do aparelho */
const toLocalInput = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

interface Props { isLightMode: boolean; }

// Login do staff: mesmo e-mail cadastrado como STAFF no sistema (rota /auth/login).
const REFRESH_MS = 4000;

export const HcampStaff = ({ isLightMode }: Props) => {
    const [staff, setStaff] = useState<HcampStaffUser | null>(() => hcampService.getStaffUser());
    const [email, setEmail] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const authed = !!staff;

    const [stats, setStats] = useState<HcampStats | null>(null);
    const [loadError, setLoadError] = useState('');
    const [query, setQuery] = useState('');
    const [confirmReset, setConfirmReset] = useState(false);

    // Revelação dos times
    const reveal = useHcampReveal();
    const [revealInput, setRevealInput] = useState('');
    const [revealMsg, setRevealMsg] = useState('');
    const [confirmNow, setConfirmNow] = useState(false);
    useEffect(() => { if (reveal.revealAt && !revealInput) setRevealInput(toLocalInput(reveal.revealAt)); }, [reveal.revealAt, revealInput]);

    const load = useCallback(async () => {
        try { setStats(await hcampService.getStats()); setLoadError(''); }
        catch (e) {
            if (e instanceof HcampAuthError) { setStaff(null); setLoginError(e.message); return; }
            setLoadError(e instanceof Error ? e.message : 'Erro ao carregar.');
        }
    }, []);

    useEffect(() => {
        if (!authed) return;
        load();
        const id = setInterval(load, REFRESH_MS);
        return () => clearInterval(id);
    }, [authed, load]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoggingIn(true); setLoginError('');
        try { setStaff(await hcampService.staffLogin(email)); }
        catch (err) { setLoginError(err instanceof Error ? err.message : 'Acesso negado.'); }
        finally { setLoggingIn(false); }
    };

    const handleLogout = () => { hcampService.staffLogout(); setStaff(null); setStats(null); };

    const saveRevealAt = async (d: Date) => {
        setRevealMsg('');
        try {
            const cfg = await hcampService.setRevealAt(d);
            reveal.apply(cfg);
            setRevealInput(toLocalInput(new Date(cfg.revealAt)));
            setRevealMsg('Data salva!');
        } catch (e) {
            if (e instanceof HcampAuthError) { setStaff(null); setLoginError(e.message); return; }
            setRevealMsg(e instanceof Error ? e.message : 'Erro ao salvar.');
        }
    };
    const handleSaveReveal = (e: FormEvent) => {
        e.preventDefault();
        const d = new Date(revealInput);
        if (isNaN(d.getTime())) { setRevealMsg('Data inválida.'); return; }
        saveRevealAt(d);
    };
    const handleRevealNow = () => {
        if (!confirmNow) { setConfirmNow(true); setTimeout(() => setConfirmNow(false), 4000); return; }
        setConfirmNow(false);
        saveRevealAt(new Date());
    };

    const handleReset = async () => {
        if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); return; }
        setConfirmReset(false);
        try { await hcampService.reset(); }
        catch (e) {
            if (e instanceof HcampAuthError) { setStaff(null); setLoginError(e.message); return; }
            setLoadError(e instanceof Error ? e.message : 'Erro ao zerar.');
        }
        load();
    };

    const muted = isLightMode ? '#5b5249' : '#b9b2a5';

    // ---------- LOGIN ----------
    if (!authed) {
        return (
            <HcampShell isLightMode={isLightMode}>
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                    <BackLink />
                    <div className="mb-6"><Tape>Área do staff</Tape></div>
                    <Lock size={36} className="mb-4 opacity-80" />
                    <h1 className="text-4xl mb-8" style={{ fontFamily: FONTS.fat }}>Painel da gincana</h1>
                    <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
                        <Scrap bg="rgba(239,230,218,0.97)" rot={-1} torn={1} hover={false}>
                            <input type="email" value={email} autoFocus autoComplete="email"
                                onChange={e => { setEmail(e.target.value); setLoginError(''); }}
                                placeholder="seu-email@staff.com" aria-label="E-mail do staff"
                                className="w-full bg-transparent px-5 py-5 text-xl text-center outline-none placeholder:opacity-40"
                                style={{ color: C.ink, fontFamily: FONTS.slab }} />
                        </Scrap>
                        {loginError && <p className="text-sm" role="alert" style={{ color: isLightMode ? C.red : C.peach, fontFamily: FONTS.type }}>{loginError}</p>}
                        <button type="submit" disabled={loggingIn}>
                            <Scrap bg={C.limeLight} rot={1} torn={2}>
                                <div className="px-8 py-5 text-xl" style={{ color: C.forest, fontFamily: FONTS.slab, opacity: loggingIn ? 0.6 : 1 }}>{loggingIn ? 'Entrando...' : 'Entrar'}</div>
                            </Scrap>
                        </button>
                        <p className="text-xs opacity-60" style={{ fontFamily: FONTS.type }}>Use o e-mail cadastrado como staff no sistema.</p>
                    </form>
                </div>
            </HcampShell>
        );
    }

    // ---------- PAINEL ----------
    const counts = stats?.counts ?? { VERMELHO: 0, AMARELO: 0, AZUL: 0, VERDE: 0 };
    const total = stats?.total ?? 0;
    const max = Math.max(1, ...TEAM_IDS.map(t => counts[t]));
    const diff = Math.max(...TEAM_IDS.map(t => counts[t])) - Math.min(...TEAM_IDS.map(t => counts[t]));
    const q = query.trim().toLowerCase();
    const byTeam = (t: TeamId) => (stats?.participants ?? [])
        .filter(p => p.team === t && (!q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)))
        .sort((a, b) => (a.teamNumber ?? 0) - (b.teamNumber ?? 0));

    return (
        <HcampShell isLightMode={isLightMode} decor={false}>
            <div className="w-full max-w-6xl">
                <BackLink />

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <div className="mb-4"><Tape rot={-1}>Painel do staff</Tape></div>
                        <h1 className="text-4xl sm:text-5xl" style={{ fontFamily: FONTS.fat }}>Placar da gincana</h1>
                        <p className="mt-2 text-sm flex flex-wrap items-center gap-2" style={{ color: muted, fontFamily: FONTS.type }}>
                            Olá, {staff?.name?.split(' ')[0]} ·
                            <RefreshCw size={14} /> Atualiza sozinho a cada {REFRESH_MS / 1000}s
                            {loadError && <span style={{ color: C.coral }}> · {loadError}</span>}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm opacity-70 hover:opacity-100" style={{ border: `1px solid ${muted}` }} title="Sair">
                            <LogOut size={16} /> Sair
                        </button>
                        <Link to="/hcamp/qrcode" className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold" style={{ background: C.cream, color: C.forest }}>
                            <QrCode size={18} /> Tela do QR Code
                        </Link>
                        <button onClick={handleReset} className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-colors"
                            style={{ background: confirmReset ? C.red : 'transparent', color: confirmReset ? C.cream : C.coral, border: `2px solid ${C.coral}` }}>
                            <RotateCcw size={18} /> {confirmReset ? 'Toque de novo para zerar tudo' : 'Zerar sorteio'}
                        </button>
                    </div>
                </div>

                {hcampService.isMock && (
                    <div className="mb-8 px-4 py-3 text-sm rounded-lg border border-dashed" style={{ borderColor: C.peach, color: isLightMode ? C.ink : C.peach, fontFamily: FONTS.type }}>
                        Modo de teste (VITE_HCAMP_MOCK=true): os sorteios ficam salvos só neste navegador.
                    </div>
                )}

                {/* REVELAÇÃO DOS TIMES */}
                <div className="mb-10 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center gap-5"
                    style={{ background: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)', border: `1px solid ${isLightMode ? '#e5ddd2' : 'rgba(255,255,255,0.08)'}` }}>
                    <div className="flex items-center gap-3 lg:w-72">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: reveal.revealed ? C.orange : '#3A3430', color: C.cream }}>
                            {reveal.revealed ? <Sparkles size={20} /> : <Lock size={20} />}
                        </div>
                        <div>
                            <div className="text-lg" style={{ fontFamily: FONTS.slab }}>{reveal.revealed ? 'Times revelados' : 'Times lacrados'}</div>
                            <div className="text-xs" style={{ color: muted, fontFamily: FONTS.type }}>
                                {reveal.revealed ? `Liberado desde ${formatRevealAt(reveal.revealAt)}` : `Revelação em ${formatRevealAt(reveal.revealAt)}`}
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSaveReveal} className="flex flex-wrap items-center gap-3 flex-1">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm" style={{ background: isLightMode ? '#f3eee7' : 'rgba(255,255,255,0.08)' }}>
                            <CalendarClock size={16} className="opacity-60" />
                            <input type="datetime-local" value={revealInput} onChange={e => setRevealInput(e.target.value)} aria-label="Data e hora da revelação"
                                className="bg-transparent outline-none" style={{ colorScheme: isLightMode ? 'light' : 'dark' }} />
                        </label>
                        <button type="submit" className="px-5 py-2.5 rounded-full text-sm font-bold" style={{ background: C.cream, color: C.forest }}>Salvar data</button>
                        <button type="button" onClick={handleRevealNow} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
                            style={{ background: confirmNow ? C.orange : 'transparent', color: confirmNow ? C.cream : C.orange, border: `2px solid ${C.orange}` }}>
                            <Unlock size={16} /> {confirmNow ? 'Toque de novo para liberar' : 'Liberar agora'}
                        </button>
                        {revealMsg && <span className="text-sm" style={{ fontFamily: FONTS.type, color: muted }}>{revealMsg}</span>}
                    </form>
                </div>

                {/* PLACAR */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {TEAM_IDS.map((id, i) => {
                        const t = TEAMS[id];
                        return (
                            <Scrap key={id} bg={t.color} rot={[-1.5, 1, -1, 1.5][i]} torn={i} hover={false}>
                                <div className="p-5" style={{ color: t.text }}>
                                    <div className="text-xs tracking-[0.25em] opacity-80" style={{ fontFamily: FONTS.type }}>TIME</div>
                                    <div className="text-2xl" style={{ fontFamily: FONTS.slab }}>{t.name}</div>
                                    <div className="mt-3 text-6xl leading-none tabular-nums" style={{ fontFamily: FONTS.slab }}>{counts[id]}</div>
                                    <div className="mt-4 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(counts[id] / max) * 100}%`, background: t.text }} />
                                    </div>
                                </div>
                            </Scrap>
                        );
                    })}
                </div>

                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm" style={{ fontFamily: FONTS.type, color: muted }}>
                    <span>Total: <b style={{ color: isLightMode ? C.ink : C.cream }}>{total}</b> participantes</span>
                    <span>Diferença entre o maior e o menor time: <b style={{ color: diff <= 1 ? (isLightMode ? C.forest : C.lime) : C.coral }}>{diff}</b> {diff <= 1 ? '(equilibrado)' : ''}</span>
                </div>

                {/* LISTA */}
                <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-3xl" style={{ fontFamily: FONTS.fat }}>Participantes</h2>
                    <label className="flex items-center gap-2 px-4 py-2 rounded-full w-full sm:w-72" style={{ background: isLightMode ? '#fff' : 'rgba(255,255,255,0.08)' }}>
                        <Search size={16} className="opacity-60" />
                        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar nome ou código"
                            className="bg-transparent outline-none w-full text-sm" style={{ fontFamily: FONTS.type }} />
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {TEAM_IDS.map(id => {
                        const t = TEAMS[id];
                        const list = byTeam(id);
                        return (
                            <div key={id} className="rounded-xl overflow-hidden" style={{ background: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)', border: `1px solid ${isLightMode ? '#e5ddd2' : 'rgba(255,255,255,0.08)'}` }}>
                                <div className="px-4 py-3 flex justify-between items-center" style={{ background: t.color, color: t.text, fontFamily: FONTS.slab }}>
                                    <span>{t.name}</span><span>{list.length}</span>
                                </div>
                                <ul className="max-h-[360px] overflow-y-auto divide-y" style={{ borderColor: 'transparent' }}>
                                    {list.length === 0 && <li className="px-4 py-6 text-sm text-center opacity-50" style={{ fontFamily: FONTS.type }}>Ninguém ainda</li>}
                                    {list.map(p => (
                                        <li key={p.code} className="px-4 py-2.5 flex items-center gap-3 text-sm" style={{ borderColor: isLightMode ? '#eee6dc' : 'rgba(255,255,255,0.06)' }}>
                                            <span className="w-8 text-xs opacity-50 tabular-nums" style={{ fontFamily: FONTS.type }}>#{p.teamNumber}</span>
                                            <span className="flex-1 truncate">{p.name}</span>
                                            <span className="text-xs opacity-50" style={{ fontFamily: FONTS.type }}>{p.code}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </HcampShell>
    );
};
