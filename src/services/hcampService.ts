// =====================================================================
// HCAMP — Serviço do sorteio de times da gincana
// ---------------------------------------------------------------------
// Fala com o backend (módulo src/modules/Hcamp no ibmg-backend):
//   POST   {API}/hcamp/draw              { name, deviceId } -> HcampTicket
//   GET    {API}/hcamp/me?deviceId=...   -> HcampTicket | 404
//   GET    {API}/hcamp/stats             -> HcampStats   (staff)
//   DELETE {API}/hcamp/stats             -> 204          (staff, zera tudo)
//   POST   {API}/auth/login              { email }       (login do staff)
//
// Para testar só o front, sem backend, use VITE_HCAMP_MOCK=true no .env:
// os sorteios ficam salvos apenas neste navegador.
// =====================================================================

export type TeamId = 'VERMELHO' | 'AMARELO' | 'AZUL' | 'VERDE';
export const TEAM_IDS: TeamId[] = ['VERMELHO', 'AMARELO', 'AZUL', 'VERDE'];

export interface HcampTicket {
    code: string;        // código curto, ex.: HC-7KQ2
    name: string;
    team: TeamId;
    teamNumber: number;  // posição da pessoa dentro do time (1, 2, 3...)
    createdAt: string;   // ISO
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
    list.forEach(p => { counts[p.team] += 1; });
    return counts;
};

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
        if (USE_MOCK || !local) return local;
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
            ticket = { code: genCode(), name: cleanName, team, teamNumber: counts[team] + 1, createdAt: new Date().toISOString() };
            lsSet(MOCK_DB_KEY, JSON.stringify([...db, ticket]));
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
