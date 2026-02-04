const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${path}`;
    const headers: any = options.headers || {};

    // Recupera token/usuário se existir (para autenticação futura)
    const savedUser = localStorage.getItem('ekklesia_staff_user');
    if (savedUser) {
        try {
            const { token } = JSON.parse(savedUser);
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) { console.error("Erro token", e); }
    }

    // Se for FormData (upload de foto), não define Content-Type (o browser faz sozinho)
    // Se for JSON, define application/json
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        let errorMsg = `Erro ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody.error) errorMsg = errorBody.error;
        } catch (e) { }
        throw new Error(errorMsg);
    }

    // Evita erro se a resposta for vazia (ex: status 204)
    if (response.status === 204) return null;

    return response.json();
}

export const api = {
    // --- AUTENTICAÇÃO ---
    login: (email: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
    register: (data: any) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
    getPersonByEmail: (email: string) => request(`/person/by-email?email=${email}`),

    // --- OPERAÇÕES (Checkpoints & Contagem) ---
    getCheckpoints: () => request('/operations/checkpoints'),
    count: (data: any) => request('/operations/count', { method: 'POST', body: JSON.stringify(data) }),
    trackMovement: (data: any) => request('/operations/track', { method: 'POST', body: JSON.stringify(data) }),

    // --- PRODUTOS (Loja/Cantina) ---
    getProducts: (category?: string) => request(`/products${category ? `?category=${category}` : ''}`),

    // --- PEDIDOS (Criação e Pagamento) ---
    // Suporta JSON ou FormData (para envio de foto do comprovante)
    createOrder: (data: any) => request('/orders', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),

    // Checagem de status para quem comprou Online
    checkPaymentStatus: (paymentId: string) => request(`/orders/check-status/${paymentId}`),

    // --- GESTÃO DE PEDIDOS (Painel Staff) ---
    getPendingOrders: () => request('/orders/pending'), // Lista Pendentes e Pagos (não entregues)

    payOrder: (orderCode: string) => request('/orders/pay', {
        method: 'POST',
        body: JSON.stringify({ orderCode })
    }),

    rejectOrder: (orderCode: string) => request('/orders/reject', {
        method: 'POST',
        body: JSON.stringify({ orderCode })
    }),

    deliverOrder: (orderCode: string) => request('/orders/deliver', {
        method: 'POST',
        body: JSON.stringify({ orderCode })
    }),

    // Busca pedido específico (Scanner ou Recibo)
    getOrder: (code: string) => request(`/orders/${code}`),

    // Busca pedidos pendentes de uma pessoa específica (para Scanner de Crachá)
    getPersonOrders: (id: string) => request(`/person/${id}/orders`),

    // --- DASHBOARD E ESTATÍSTICAS ---
    // 🔥 IMPORTANTE: Todos esses precisam do prefixo /dashboard agora
    getDashboard: () => request('/dashboard'),

    getMeetingCount: () => request('/dashboard/meeting-count'),

    incrementMeetingCount: () => request('/dashboard/meeting-count/increment', { method: 'POST' }),

    saveConsolidation: (data: any) => request('/dashboard/consolidation/save', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

export const apiService = api;