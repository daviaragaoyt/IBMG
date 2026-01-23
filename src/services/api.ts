const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Função genérica para Fetch
async function request(path: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = options.headers || {};

    // Se não for FormData (upload de arquivo), adiciona Content-Type JSON
    if (!(options.body instanceof FormData)) {
        (headers as any)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
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

    // --- VENDAS E PEDIDOS ---
    createSale: (data: any) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),
    createCheckout: (formData: FormData) => request('/checkout/full', { method: 'POST', body: formData }),

    // --- AUDITORIA STAFF ---
    getPendingOrders: () => request('/orders/pending'),
    payOrder: (orderCode: string) => request('/orders/pay', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    rejectOrder: (orderCode: string) => request('/orders/reject', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    deliverOrder: (orderCode: string) => request('/orders/deliver', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    getOrder: (code: string) => request(`/orders/${code}`),
    getPersonOrders: (id: string) => request(`/person/${id}/orders`),

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