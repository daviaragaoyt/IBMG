const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Função genérica para Fetch
async function request(path: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = options.headers || {};

    // Injeção Automática de Token
    const savedUser = localStorage.getItem('ekklesia_staff_user'); // Ajuste a chave se for 'ibmg_user'
    if (savedUser) {
        try {
            const { token } = JSON.parse(savedUser);
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Erro ao ler token", e);
        }
    }

    // Se não for FormData, adiciona Content-Type JSON
    if (!(options.body instanceof FormData)) {
        (headers as any)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn("Sessão expirada ou inválida.");
        }
        throw new Error(`Erro na requisição: ${response.status}`);
    }
    return response.json();
}

export const api = {
    // --- AUTH ---
    login: (email: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),

    // --- OPERAÇÕES ---
    getCheckpoints: () => request('/checkpoints'),
    count: (data: any) => request('/count', { method: 'POST', body: JSON.stringify(data) }),
    trackMovement: (data: any) => request('/track', { method: 'POST', body: JSON.stringify(data) }),

    // --- PRODUTOS ---
    getProducts: (category?: string) => request(`/products${category ? `?category=${category}` : ''}`),

    // --- VENDAS E PEDIDOS (CRÍTICO PARA O FLUXO NOVO) ---

    // 1. Criar Pedido (Aceita JSON ou FormData)
    createOrder: (data: any) => request('/orders', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),

    // 2. 👇 AQUI ESTÁ A FUNÇÃO QUE FALTAVA 👇
    checkPayment: (paymentId: string, saleId: string) => request('/orders/check-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentId, saleId })
    }),
    // ----------------------------------------

    // --- AUDITORIA STAFF ---
    getPendingOrders: () => request('/orders/pending'),
    payOrder: (orderCode: string) => request('/orders/pay', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    rejectOrder: (orderCode: string) => request('/orders/reject', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    deliverOrder: (orderCode: string) => request('/orders/deliver', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    getOrder: (code: string) => request(`/orders/${code}`),

    // Gestão de Pessoas
    getPersonOrders: (id: string) => request(`/person/${id}/orders`),
    getPerson: (id: string) => request(`/person/${id}`),
    updatePerson: (id: string, data: any) => request(`/person/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // --- REUNIÕES ---
    getMeetings: () => request('/meetings'),
    createMeeting: (data: any) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
    deleteMeeting: (id: string) => request(`/meetings/${id}`, { method: 'DELETE' }),

    // --- DASHBOARD ---
    getDashboard: () => request('/dashboard'),
    getMeetingCount: () => request('/meeting-count'),
    incrementMeetingCount: () => request('/meeting-count/increment', { method: 'POST' }),
    saveConsolidation: (data: any) => request('/consolidation/save', { method: 'POST', body: JSON.stringify(data) })
};