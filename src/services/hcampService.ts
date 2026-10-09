// =====================================================================
// HCAMP — Serviço do sorteio de times da gincana
// ---------------------------------------------------------------------
// Fala com o backend (módulo src/modules/Hcamp no ibmg-backend):
//   POST   {API}/hcamp/draw              { name, deviceId } -> HcampTicket
//   GET    {API}/hcamp/me?deviceId=...   -> HcampTicket | 404
//   GET    {API}/hcamp/stats             -> HcampStats   (staff)
//   DELETE {API}/hcamp/stats             -> 204          (staff, zera tudo)
//   GET    {API}/hcamp/config            -> { revealAt, revealed, serverNow }
//   PUT    {API}/hcamp/config            { revealAt }    (staff)
//   POST   {API}/hcamp/reveal            { name, code? } -> HcampTicket com o time
//
// O time fica LACRADO (team = null) até a data da revelação.
//   POST   {API}/auth/login              { email }       (login do staff)
//
// Para testar só o front, sem backend, use VITE_HCAMP_MOCK=true no .env:
// os sorteios ficam salvos apenas neste navegador.
// =====================================================================

export type TeamId = 'VERMELHO' | 'AMARELO' | 'AZUL' | 'VERDE';
export const TEAM_IDS: TeamId[] = ['VERMELHO', 'AMARELO', 'AZUL', 'VERDE'];

export interface HcampTicket {
    code: string;              // código curto, ex.: HC-7KQ2
    name: string;
    team: TeamId | null;       // null = lacrado (antes da revelação)
    teamNumber: number | null; // posição da pessoa dentro do time (1, 2, 3...)
    createdAt: string;         // ISO
    revealed?: boolean;
}

export interface HcampConfig {
    revealAt: string;  // ISO
    revealed: boolean;
    serverNow: string; // ISO — para acertar o relógio do celular
}

/** Erro da revelação: needCode = tem nome repetido, precisa do código do ticket. */
export class HcampRevealError extends Error {
    needCode: boolean;
    constructor(message: string, needCode = false) { super(message); this.needCode = needCode; }
}

export interface HcampStats {
    counts: Record<TeamId, number>;
    total: number;
    participants: HcampTicket[];
}

export interface HcampStaffUser { id: string; name: string; email?: string; token: string; }

/** Erro de login expirado/negado — a tela do staff volta para o login. */
export class HcampAuthError extends Error { }

const USE_MOCK = import.meta.env.VITE_HCAMP_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TICKET_KEY = 'hcamp_ticket';        // ticket deste celular
const DEVICE_KEY = 'hcamp_device_id';     // identificador deste celular
const STAFF_KEY = 'hcamp_staff_user';     // sessão do staff
const MOCK_DB_KEY = 'hcamp_mock_db';      // "banco" do modo de teste
const MOCK_REVEAL_KEY = 'hcamp_mock_reveal_at';
const MOCK_DEFAULT_REVEAL_AT = '2026-11-14T08:00:00-03:00';

// ---------- helpers ----------
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
const lsDel = (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

const getDeviceId = () => {
    let id = lsGet(DEVICE_KEY);
    if (!id) {
        id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
        lsSet(DEVICE_KEY, id);
    }
    return id;
};

const errorFrom = async (res: Response, fallback: string) => {
    try { const b = await res.json(); return b?.error || fallback; } catch { return fallback; }
};

const emptyCounts = (): Record<TeamId, number> => ({ VERMELHO: 0, AMARELO: 0, AZUL: 0, VERDE: 0 });
const countTeams = (list: HcampTicket[]) => {
    const counts = emptyCounts();
    list.forEach(p => { if (p.team) counts[p.team] += 1; });
    return counts;
};
const normalizeName = (n: string) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const seal = (t: HcampTicket): HcampTicket => ({ ...t, team: null, teamNumber: null, revealed: false });
const mockRevealAt = () => new Date(lsGet(MOCK_REVEAL_KEY) || MOCK_DEFAULT_REVEAL_AT);

/** Sorteia entre os times com MENOS pessoas (empate = sorteio aleatório). Usado só no modo de teste — o backend faz o mesmo. */
const pickBalancedTeam = (counts: Record<TeamId, number>): TeamId => {
    const min = Math.min(...TEAM_IDS.map(t => counts[t]));
    const candidates = TEAM_IDS.filter(t => counts[t] === min);
    return candidates[Math.floor(Math.random() * candidates.length)];
};
const genCode = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let c = '';
    for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return `HC-${c}`;
};
const readMockDb = (): HcampTicket[] => { try { return JSON.parse(lsGet(MOCK_DB_KEY) || '[]'); } catch { return []; } };

const staffHeaders = (): Record<string, string> => {
    const staff = hcampService.getStaffUser();
    return { 'Content-Type': 'application/json', ...(staff ? { Authorization: `Bearer ${staff.token}` } : {}) };
};

// ---------- serviço ----------
export const hcampService = {
    isMock: USE_MOCK,

    /** Ticket já sorteado neste celular (a cor é fixa). */
    getMyTicket(): HcampTicket | null {
        try { const raw = lsGet(TICKET_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
    },

    /**
     * Confere no backend se o ticket deste celular ainda existe.
     * Se o staff zerou o sorteio, apaga o ticket local e devolve null.
     * Sem internet, mantém o ticket local.
     */
    async syncMyTicket(): Promise<HcampTicket | null> {
        const local = this.getMyTicket();
        if (!local) return null;
        if (USE_MOCK) {
            const full = readMockDb().find(p => p.code === local.code);
            if (!full) { lsDel(TICKET_KEY); return null; }
            const t = Date.now() >= mockRevealAt().getTime() ? full : seal(full);
            lsSet(TICKET_KEY, JSON.stringify(t));
            return t;
        }
        try {
            const res = await fetch(`${API_URL}/hcamp/me?deviceId=${encodeURIComponent(getDeviceId())}`);
            if (res.status === 404) { lsDel(TICKET_KEY); return null; }
            if (!res.ok) return local;
            const ticket: HcampTicket = await res.json();
            lsSet(TICKET_KEY, JSON.stringify(ticket));
            return ticket;
        } catch { return local; }
    },

    async draw(name: string): Promise<HcampTicket> {
        const existing = this.getMyTicket();
        if (existing) return existing; // não deixa sortear de novo

        const cleanName = name.trim().replace(/\s+/g, ' ');
        let ticket: HcampTicket;

        if (USE_MOCK) {
            const db = readMockDb();
            const counts = countTeams(db);
            const team = pickBalancedTeam(counts);
            const full: HcampTicket = { code: genCode(), name: cleanName, team, teamNumber: counts[team] + 1, createdAt: new Date().toISOString(), revealed: true };
            lsSet(MOCK_DB_KEY, JSON.stringify([...db, full]));
            ticket = Date.now() >= mockRevealAt().getTime() ? full : seal(full);
        } else {
            const res = await fetch(`${API_URL}/hcamp/draw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: cleanName, deviceId: getDeviceId() }),
            });
            if (!res.ok) throw new Error(await errorFrom(res, 'Não foi possível sortear agora. Tente novamente.'));
            ticket = await res.json();
        }

        lsSet(TICKET_KEY, JSON.stringify(ticket));
        return ticket;
    },

    // ---------- revelação ----------
    async getConfig(): Promise<HcampConfig> {
        if (USE_MOCK) {
            const r = mockRevealAt();
            return { revealAt: r.toISOString(), revealed: Date.now() >= r.getTime(), serverNow: new Date().toISOString() };
        }
        const res = await fetch(`${API_URL}/hcamp/config`, { cache: 'no-store' });
        if (!res.ok) throw new Error(await errorFrom(res, 'Erro ao carregar a configuração.'));
        return res.json();
    },

    async setRevealAt(revealAt: Date): Promise<HcampConfig> {
        if (USE_MOCK) { lsSet(MOCK_REVEAL_KEY, revealAt.toISOString()); return this.getConfig(); }
        const res = await fetch(`${API_URL}/hcamp/config`, {
            method: 'PUT', headers: staffHeaders(), body: JSON.stringify({ revealAt: revealAt.toISOString() }),
        });
        if (res.status === 401) { this.staffLogout(); throw new HcampAuthError(await errorFrom(res, 'Faça login novamente.')); }
        if (!res.ok) throw new Error(await errorFrom(res, 'Erro ao salvar a data.'));
        return res.json();
    },

    /** Revela o time pelo nome (e código, se houver nome repetido). Só funciona após a revelação. */
    async reveal(name: string, code?: string): Promise<HcampTicket> {
        let ticket: HcampTicket;
        if (USE_MOCK) {
            if (Date.now() < mockRevealAt().getTime()) throw new HcampRevealError('Os times ainda não foram revelados.');
            let m = readMockDb().filter(p => normalizeName(p.name) === normalizeName(name));
            if (code) m = m.filter(p => p.code.replace(/^HC-?/, '') === code.toUpperCase().replace(/^HC-?/, ''));
            if (m.length === 0) throw new HcampRevealError('Nome não encontrado. Digite exatamente como no sorteio.');
            if (m.length > 1) throw new HcampRevealError('Tem mais de uma pessoa com esse nome. Digite também o código do seu ticket.', true);
            ticket = m[0];
        } else {
            const res = await fetch(`${API_URL}/hcamp/reveal`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), ...(code ? { code: code.trim() } : {}) }),
            });
            if (!res.ok) {
                let body: { error?: string; needCode?: boolean } = {};
                try { body = await res.json(); } catch { /* ignore */ }
                throw new HcampRevealError(body.error || 'Não foi possível revelar agora.', !!body.needCode);
            }
            ticket = await res.json();
        }
        // Se for o ticket deste celular, guarda já revelado
        const mine = this.getMyTicket();
        if (mine && mine.code === ticket.code) lsSet(TICKET_KEY, JSON.stringify(ticket));
        return ticket;
    },

    // ---------- staff ----------
    getStaffUser(): HcampStaffUser | null {
        try { const raw = lsGet(STAFF_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
    },

    async staffLogin(email: string): Promise<HcampStaffUser> {
        if (USE_MOCK) {
            const user = { id: 'mock', name: 'Staff (teste)', email, token: 'mock' };
            lsSet(STAFF_KEY, JSON.stringify(user));
            return user;
        }
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
        });
        if (!res.ok) throw new Error(await errorFrom(res, 'Acesso negado.'));
        const data = await res.json();
        const user: HcampStaffUser = { id: data.id, name: data.name, email: data.email, token: data.token || data.id };
        lsSet(STAFF_KEY, JSON.stringify(user));
        return user;
    },

    staffLogout() { lsDel(STAFF_KEY); },

    async getStats(): Promise<HcampStats> {
        if (USE_MOCK) {
            const participants = readMockDb();
            return { counts: countTeams(participants), total: participants.length, participants };
        }
        const res = await fetch(`${API_URL}/hcamp/stats`, { headers: staffHeaders() });
        if (res.status === 401) { this.staffLogout(); throw new HcampAuthError(await errorFrom(res, 'Faça login novamente.')); }
        if (!res.ok) throw new Error(await errorFrom(res, 'Erro ao carregar o placar.'));
        return res.json();
    },

    async reset(): Promise<void> {
        if (USE_MOCK) { lsSet(MOCK_DB_KEY, '[]'); lsDel(TICKET_KEY); return; }
        const res = await fetch(`${API_URL}/hcamp/stats`, { method: 'DELETE', headers: staffHeaders() });
        if (res.status === 401) { this.staffLogout(); throw new HcampAuthError(await errorFrom(res, 'Faça login novamente.')); }
        if (!res.ok) throw new Error(await errorFrom(res, 'Erro ao zerar o sorteio.'));
    },
};
