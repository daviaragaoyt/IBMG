const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${path}`;
    const headers: any = options.headers || {};

    // Recupera o token salvo (se houver)
    const savedUser = localStorage.getItem('ekklesia_staff_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const token = user.token || user.id;
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) { console.error("Erro token", e); }
    }

    // Lógica inteligente:
    // Se for FormData (arquivo), o navegador define o Content-Type.
    // Se for JSON (texto), nós definimos 'application/json'.
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

    // Evita quebrar se o backend não retornar nada (ex: 204 No Content)
    if (response.status === 204) return null;

    return response.json();
}

export const api = {
    // --- AUTENTICAÇÃO ---
    login: (email: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
    register: (data: any) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
    getPersonByEmail: (email: string) => request(`/person/by-email?email=${email}`),

    // --- OPERAÇÕES (Contagem e Checkpoints) ---
    getCheckpoints: () => request('/operations/checkpoints'),
    count: (data: any) => request('/operations/count', { method: 'POST', body: JSON.stringify(data) }),
    trackMovement: (data: any) => request('/operations/track', { method: 'POST', body: JSON.stringify(data) }),

    // --- PRODUTOS ---
    getProducts: (category?: string) => request(`/products${category ? `?category=${category}` : ''}`),

    // --- PEDIDOS (Vendas) ---
    createOrder: (data: any) => request('/orders', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),

    // Status e Pagamento
    checkPaymentStatus: (paymentId: string) => request(`/orders/check-status/${paymentId}`),
    checkPayment: (paymentId: string, _saleId?: string) => request(`/orders/check-status/${paymentId}`),

    // Staff / Auditoria de Pedidos
    getPendingOrders: () => request('/orders/pending'),
    payOrder: (orderCode: string) => request('/orders/pay', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    rejectOrder: (orderCode: string) => request('/orders/reject', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    deliverOrder: (orderCode: string) => request('/orders/deliver', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    getOrder: (code: string) => request(`/orders/${code}`),

    // --- PESSOAS ---
    getPersonOrders: (id: string) => request(`/person/${id}/orders`),
    getPerson: (id: string) => request(`/person/${id}`),
    updatePerson: (id: string, data: any) => request(`/person/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // --- REUNIÕES (Isso corrige o erro da Vercel) ---
    getMeetings: () => request('/meetings'),
    createMeeting: (data: any) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
    deleteMeeting: (id: string) => request(`/meetings/${id}`, { method: 'DELETE' }),

    // --- DASHBOARD (Estatísticas e Consolidação) ---
    getDashboard: () => request('/dashboard'),
    getMeetingCount: () => request('/dashboard/meeting-count'),
    incrementMeetingCount: () => request('/dashboard/meeting-count/increment', { method: 'POST' }),
    saveConsolidation: (data: any) => request('/dashboard/consolidation/save', { method: 'POST', body: JSON.stringify(data) })
};

export const apiService = api;