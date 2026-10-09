import { useState, useEffect, useCallback } from 'react';
import { hcampService } from '../../../services/hcampService';
import type { HcampConfig } from '../../../services/hcampService';

/**
 * Data da revelação dos times (vem do backend) + contagem regressiva ao vivo.
 * Usa o relógio do servidor para o celular com hora errada não liberar antes.
 */
export const useHcampReveal = () => {
    const [config, setConfig] = useState<HcampConfig | null>(null);
    const [offset, setOffset] = useState(0); // servidor - celular (ms)
    const [now, setNow] = useState(() => Date.now());

    const apply = useCallback((c: HcampConfig) => {
        setConfig(c);
        setOffset(new Date(c.serverNow).getTime() - Date.now());
    }, []);

    const reload = useCallback(() => hcampService.getConfig().then(apply).catch(() => { /* mantém o último */ }), [apply]);

    useEffect(() => {
        reload();
        const tick = setInterval(() => setNow(Date.now()), 1000);
        const refresh = setInterval(reload, 60000); // confere a data a cada minuto
        return () => { clearInterval(tick); clearInterval(refresh); };
    }, [reload]);

    const revealAt = config ? new Date(config.revealAt) : null;
    const diff = revealAt ? Math.max(0, revealAt.getTime() - (now + offset)) : 0;
    const revealed = !!revealAt && diff === 0;

    return {
        loading: !config,
        revealAt,
        revealed,
        timeLeft: {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
        },
        reload,
        apply,
    };
};

export const formatRevealAt = (d: Date | null) => d
    ? `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : '...';
