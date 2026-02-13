import { useState, useEffect } from 'react';
import { api } from '../services/api'; // Ajuste o caminho conforme sua estrutura
import { XCircle, ShoppingBag, DollarSign, User, Clock, Package } from 'lucide-react';
import { formatCurrency } from './StaffComponents'; // Ou onde estiver sua função de formatar

export const StoreOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- 1. BUSCAR PEDIDOS (POLLING) ---
    const fetchOrders = async () => {
        try {
            // Chama a rota /orders/pending que criamos no backend
            const data = await api.getPendingOrders();
            setOrders(data);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Atualiza a cada 5 segundos para ver novos pedidos chegando
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    // --- 2. AÇÕES (PAGAR, ENTREGAR, CANCELAR) ---
    const handleAction = async (action: 'pay' | 'deliver' | 'reject', orderCode: string) => {
        const actionText = action === 'pay' ? 'RECEBER' : action === 'deliver' ? 'ENTREGAR' : 'CANCELAR';
        if (!confirm(`Confirmar ${actionText} do pedido #${orderCode}?`)) return;

        setLoading(true);
        try {
            if (action === 'pay') await api.payOrder(orderCode);
            if (action === 'deliver') await api.deliverOrder(orderCode);
            if (action === 'reject') await api.rejectOrder(orderCode);

            await fetchOrders(); // Atualiza a lista na hora
        } catch (error) {
            alert("Erro ao atualizar pedido.");
        } finally {
            setLoading(false);
        }
    };

    // --- 3. SEPARAÇÃO (ONLINE vs BALCÃO) ---
    // Online = PIX (Feito pelo App)
    // Balcão = MONEY ou CREDIT (Feito pela Staff)
    const onlineOrders = orders.filter(o => o.paymentMethod === 'PIX' && o.status !== 'DELIVERED' && o.status !== 'CANCELED');
    const counterOrders = orders.filter(o => o.paymentMethod !== 'PIX' && o.status !== 'DELIVERED' && o.status !== 'CANCELED');

    // --- COMPONENTE DE CARD (Visual) ---
    const OrderCard = ({ order }: any) => {
        const isPaid = order.status === 'PAID';

        return (
            <div className={`p-4 rounded-xl border-l-4 shadow-lg bg-[#1a1a1a] mb-3 animate-fade-in ${isPaid ? 'border-green-500' : 'border-yellow-500'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg">#{order.orderCode}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {isPaid ? 'PAGO' : 'PENDENTE'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                            <User size={14} />
                            <span className="font-medium">{order.buyerName || 'Cliente Balcão'}</span>
                            {/* Mostra se é MEMBRO ou VISITANTE */}
                            <span className={`text-[10px] px-1.5 rounded border ${order.buyerType === 'MEMBER' ? 'border-purple-500 text-purple-400' : 'border-gray-600 text-gray-500'}`}>
                                {order.buyerType === 'MEMBER' ? 'MEMBRO' : 'VISITANTE'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block font-black text-xl text-purple-400">{formatCurrency(order.total)}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{order.paymentMethod}</span>
                    </div>
                </div>

                {/* Lista de Itens */}
                <div className="bg-black/40 p-3 rounded-lg mb-4 space-y-1 border border-white/5">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-300 border-b border-white/5 last:border-0 pb-1 last:pb-0">
                            <span className="flex items-center gap-2">
                                <span className="font-bold text-white">{item.quantity}x</span>
                                {item.product?.name || item.name}
                                {item.size && <span className="bg-white/20 px-1.5 rounded textxs font-bold">{item.size}</span>}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 h-10">
                    {!isPaid && (
                        <button
                            onClick={() => handleAction('pay', order.orderCode)}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wide transition-colors"
                        >
                            <DollarSign size={16} /> Receber Dinheiro
                        </button>
                    )}

                    {isPaid && (
                        <button
                            onClick={() => handleAction('deliver', order.orderCode)}
                            disabled={loading}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wide transition-colors"
                        >
                            <Package size={16} /> Entregar Pedido
                        </button>
                    )}

                    <button
                        onClick={() => handleAction('reject', order.orderCode)}
                        disabled={loading}
                        className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                        title="Cancelar Pedido"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4">

                {/* COLUNA 1: ONLINE (PIX/APP) */}
                <div className="bg-[#111] p-4 rounded-2xl border border-gray-800 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                        <h2 className="font-bold text-gray-300 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            Pedidos Online ({onlineOrders.length})
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {onlineOrders.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <ShoppingBag className="mx-auto mb-3 w-12 h-12" />
                                <p className="italic">Nenhum pedido online aguardando.</p>
                            </div>
                        ) : (
                            onlineOrders.map(order => <OrderCard key={order.id} order={order} />)
                        )}
                    </div>
                </div>

                {/* COLUNA 2: BALCÃO (STAFF) */}
                <div className="bg-[#111] p-4 rounded-2xl border border-gray-800 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                        <h2 className="font-bold text-gray-300 uppercase tracking-wider text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            Fila do Balcão ({counterOrders.length})
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {counterOrders.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <Clock className="mx-auto mb-3 w-12 h-12" />
                                <p className="italic">Fila do balcão vazia.</p>
                            </div>
                        ) : (
                            counterOrders.map(order => <OrderCard key={order.id} order={order} />)
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};