const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${path}`;
    const headers: any = options.headers || {};

    const savedUser = localStorage.getItem('ekklesia_staff_user');
    if (savedUser) {
        try {
            const { token } = JSON.parse(savedUser);
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) { console.error("Erro token", e); }
    }

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
    return response.json();
}

export const api = {
    // Auth
    login: (email: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),

    // Operações Evento
    getCheckpoints: () => request('/checkpoints'),
    count: (data: any) => request('/count', { method: 'POST', body: JSON.stringify(data) }),
    trackMovement: (data: any) => request('/track', { method: 'POST', body: JSON.stringify(data) }),

    // Loja
    getProducts: (category?: string) => request(`/products${category ? `?category=${category}` : ''}`),
    createOrder: (data: any) => request('/orders', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),

    // Pagamento (Polling) - Ambas as funções apontam para a rota GET correta
    checkPaymentStatus: (paymentId: string) => request(`/orders/check-status/${paymentId}`),
    checkPayment: (paymentId: string, _saleId?: string) => request(`/orders/check-status/${paymentId}`),

    // Staff / Auditoria
    getPendingOrders: () => request('/orders/pending'),
    payOrder: (orderCode: string) => request('/orders/pay', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    rejectOrder: (orderCode: string) => request('/orders/reject', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    deliverOrder: (orderCode: string) => request('/orders/deliver', { method: 'POST', body: JSON.stringify({ orderCode }) }),
    getOrder: (code: string) => request(`/orders/${code}`),

    // Pessoas
    getPersonOrders: (id: string) => request(`/person/${id}/orders`),
    getPerson: (id: string) => request(`/person/${id}`),
    updatePerson: (id: string, data: any) => request(`/person/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Reuniões e Dashboard
    getMeetings: () => request('/meetings'),
    createMeeting: (data: any) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
    deleteMeeting: (id: string) => request(`/meetings/${id}`, { method: 'DELETE' }),
    getDashboard: () => request('/dashboard'),
    getMeetingCount: () => request('/meeting-count'),
    incrementMeetingCount: () => request('/meeting-count/increment', { method: 'POST' }),
    saveConsolidation: (data: any) => request('/consolidation/save', { method: 'POST', body: JSON.stringify(data) })
};

export const apiService = api;