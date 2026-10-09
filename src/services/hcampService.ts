// =====================================================================
// HCAMP — Serviço do sorteio de times da gincana
// ---------------------------------------------------------------------
// Fala com o backend (módulo src/modules/Hcamp no ibmg-backend):
//   POST   {API}/hcamp/draw              { name } -> HcampTicket (1 por nome completo; 409 se já existe)
//   GET    {API}/hcamp/tickets?codes=A,B -> HcampTicket[]  ("Meus tickets" deste celular)
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

const TICKETS_KEY = 'hcamp_tickets';      // tickets sorteados NESTE celular (pode ser de várias pessoas)
const OLD_TICKET_KEY = 'hcamp_ticket';    // versão antiga (1 ticket por celular) — migrado
const STAFF_KEY = 'hcamp_staff_user';     // sessão do staff
const MOCK_DB_KEY = 'hcamp_mock_db';      // "banco" do modo de teste
const MOCK_REVEAL_KEY = 'hcamp_mock_reveal_at';
const MOCK_DEFAULT_REVEAL_AT = '2026-11-14T08:00:00-03:00';

// ---------- helpers ----------
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
const lsDel = (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

const readTickets = (): HcampTicket[] => {
    try {
        const list: HcampTicket[] = JSON.parse(lsGet(TICKETS_KEY) || '[]');
        const old = lsGet(OLD_TICKET_KEY);
        if (old) { // migra o formato antigo
            const t: HcampTicket = JSON.parse(old);
            if (!list.some(x => x.code === t.code)) list.unshift(t);
            lsDel(OLD_TICKET_KEY);
            lsSet(TICKETS_KEY, JSON.stringify(list));
        }
        return list;
    } catch { return []; }
};
const writeTickets = (list: HcampTicket[]) => lsSet(TICKETS_KEY, JSON.stringify(list));

// Nome completo: pelo menos 2 palavras de 2+ letras, só letras (com acento), hífen ou apóstrofo.
const NAME_WORD = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’-]*$/;
export const isFullName = (n: string) => {
    const words = n.trim().split(/\s+/).filter(Boolean);
    return words.every(w => NAME_WORD.test(w)) && words.filter(w => w.length >= 2).length >= 2;
};
export const FULL_NAME_ERROR = 'Digite seu nome completo (nome e sobrenome), só com letras.';

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

    /** Tickets sorteados neste celular (mais recente primeiro). */
    getMyTickets(): HcampTicket[] { return readTickets(); },

    getMyTicket(code?: string): HcampTicket | null {
        const list = readTickets();
        return (code ? list.find(t => t.code === code) : list[0]) ?? null;
    },

    /**
     * Atualiza os tickets deste celular com o backend: remove os que o staff apagou
     * (sorteio zerado) e preenche o time quando já tiver sido revelado. Sem internet, mantém.
     */
    async syncMyTickets(): Promise<HcampTicket[]> {
        const local = readTickets();
        if (!local.length) return local;
        try {
            let fresh: HcampTicket[];
            if (USE_MOCK) {
                const revealed = Date.now() >= mockRevealAt().getTime();
                fresh = readMockDb().filter(p => local.some(l => l.code === p.code)).map(p => revealed ? p : seal(p));
            } else {
                const res = await fetch(`${API_URL}/hcamp/tickets?codes=${encodeURIComponent(local.map(t => t.code).join(','))}`, { cache: 'no-store' });
                if (!res.ok) return local;
                fresh = await res.json();
            }
            const list = local.map(l => fresh.find(f => f.code === l.code)).filter((t): t is HcampTicket => !!t);
            writeTickets(list);
            return list;
        } catch { return local; }
    },

    /** Sorteia uma pessoa. 1 ticket por nome completo — nome repetido dá erro. */
    async draw(name: string): Promise<HcampTicket> {
        const cleanName = name.trim().replace(/\s+/g, ' ');
        if (!isFullName(cleanName)) throw new Error(FULL_NAME_ERROR);
        let ticket: HcampTicket;

        if (USE_MOCK) {
            const db = readMockDb();
            if (db.some(p => normalizeName(p.name) === normalizeName(cleanName))) {
                throw new Error('Esse nome já tem um ticket. Cada pessoa só pode ser sorteada uma vez.');
            }
            const counts = countTeams(db);
            const team = pickBalancedTeam(counts);
            const full: HcampTicket = { code: genCode(), name: cleanName, team, teamNumber: counts[team] + 1, createdAt: new Date().toISOString(), revealed: true };
            lsSet(MOCK_DB_KEY, JSON.stringify([...db, full]));
            ticket = Date.now() >= mockRevealAt().getTime() ? full : seal(full);
        } else {
            const res = await fetch(`${API_URL}/hcamp/draw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: cleanName }),
            });
            if (!res.ok) throw new Error(await errorFrom(res, 'Não foi possível sortear agora. Tente novamente.'));
            ticket = await res.json();
        }

        writeTickets([ticket, ...readTickets().filter(t => t.code !== ticket.code)]);
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
        // Se for um ticket deste celular, guarda já revelado
        const mine = readTickets();
        if (mine.some(t => t.code === ticket.code)) writeTickets(mine.map(t => t.code === ticket.code ? ticket : t));
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
        if (USE_MOCK) { lsSet(MOCK_DB_KEY, '[]'); lsDel(TICKETS_KEY); return; }
        const res = await fetch(`${API_URL}/hcamp/stats`, { method: 'DELETE', headers: staffHeaders() });
        if (res.status === 401) { this.staffLogout(); throw new HcampAuthError(await errorFrom(res, 'Faça login novamente.')); }
        if (!res.ok) throw new Error(await errorFrom(res, 'Erro ao zerar o sorteio.'));
    },
};
