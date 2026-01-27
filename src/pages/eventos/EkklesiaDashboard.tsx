import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    ArrowLeft, TrendingUp, Users, ShoppingBag, UtensilsCrossed,
    CalendarClock, ClipboardCheck, HeartHandshake, LayoutTemplate, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
// IMPORTANTE: Importando o componente detalhado que criamos acima
import { DashboardEvento } from './DashboardEvento';

export const EkklesiaDashboard = ({ isLightMode }: any) => {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'EVENTS'>('EVENTS');

    useEffect(() => {
        api.getDashboard().then(setData).catch(console.error);
    }, []);

    if (!data) return <div className="min-h-screen flex items-center justify-center text-2xl font-black opacity-50 pt-20">CARREGANDO DADOS...</div>;

    const { salesStats, meetingStats, consolidationCount, manualCount, scannerCount } = data;
    const theme = isLightMode ? { bg: '#F3F4F6', text: '#1A1A1A', card: '#FFFFFF' } : { bg: '#0F0014', text: '#FFFFFF', card: '#1A0524' };

    // --- RENDERIZAÇÃO DO DASHBOARD EXECUTIVO (FINANCEIRO / GESTÃO) ---
    const renderExecutive = () => {
        const categoryData = [
            { name: 'Cantina', value: salesStats?.byCategory?.CANTINA || 0, color: '#F59E0B' },
            { name: 'Loja', value: salesStats?.byCategory?.LOJA || 0, color: '#06B6D4' }
        ];
        const demogData = [
            { name: 'Membros', value: salesStats?.demographics?.MEMBER || 0 },
            { name: 'Visitantes', value: salesStats?.demographics?.VISITOR || 0 }
        ];

        return (
            <div className="animate-slide-up">
                {/* BLOCO FINANCEIRO */}
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 opacity-80"><TrendingUp size={20} /> Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
                        <TrendingUp className="absolute top-4 right-4 opacity-30" size={40} />
                        <p className="text-sm font-bold opacity-80 mb-1">Total de Vendas</p>
                        <h2 className="text-3xl font-black">
                            {(salesStats?.demographics?.MEMBER || 0) + (salesStats?.demographics?.VISITOR || 0)}
                        </h2>
                        <p className="text-xs opacity-60 mt-2">Transações realizadas</p>
                    </div>
                    <div className="p-6 rounded-3xl shadow-lg border relative" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold opacity-50">Vendas Cantina</p>
                            <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg"><UtensilsCrossed size={20} /></div>
                        </div>
                        <h2 className="text-3xl font-black text-orange-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.byCategory?.CANTINA || 0)}
                        </h2>
                    </div>
                    <div className="p-6 rounded-3xl shadow-lg border relative" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold opacity-50">Vendas Loja</p>
                            <div className="p-2 bg-cyan-500/20 text-cyan-500 rounded-lg"><ShoppingBag size={20} /></div>
                        </div>
                        <h2 className="text-3xl font-black text-cyan-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.byCategory?.LOJA || 0)}
                        </h2>
                    </div>
                </div>

                {/* BLOCO GESTÃO */}
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 opacity-80"><ClipboardCheck size={20} /> Gestão do Evento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-3xl shadow-lg border relative overflow-hidden" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarClock size={60} /></div>
                        <p className="text-sm font-bold opacity-60 mb-2">Reuniões de Staff</p>
                        <div className="flex gap-6">
                            <div><span className="text-3xl font-black">{meetingStats?.realizadas || 0}</span><p className="text-[10px] font-bold uppercase text-green-500">Realizadas</p></div>
                            <div><span className="text-3xl font-black opacity-50">{meetingStats?.agendadas || 0}</span><p className="text-[10px] font-bold uppercase text-orange-500">Agendadas</p></div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl shadow-lg border relative overflow-hidden" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><HeartHandshake size={60} /></div>
                        <p className="text-sm font-bold opacity-60 mb-2">Vidas Consagradas</p>
                        <h2 className="text-4xl font-black text-red-500">{consolidationCount || 0}</h2>
                        <p className="text-xs opacity-60 mt-1">Decisões registradas</p>
                    </div>
                    <div className="p-6 rounded-3xl shadow-lg border relative overflow-hidden" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500"><Users size={60} /></div>
                        <p className="text-sm font-bold opacity-60 mb-2">Fluxo Total</p>
                        <h2 className="text-4xl font-black text-blue-500">{(manualCount || 0) + (scannerCount || 0)}</h2>
                        <p className="text-xs opacity-60 mt-1">Manual + Scanner</p>
                    </div>
                </div>

                {/* GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl shadow-lg border" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <h3 className="font-bold mb-6 flex items-center gap-2"><ShoppingBag size={18} className="text-purple-500" /> Receita por Setor</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl shadow-lg border" style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#FFFFFF10' }}>
                        <h3 className="font-bold mb-6 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Quem está comprando?</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={demogData}>
                                    <XAxis dataKey="name" stroke={isLightMode ? '#888' : '#666'} tick={{ fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis stroke={isLightMode ? '#888' : '#666'} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-6 pt-24 font-sans transition-colors duration-500" style={{ background: theme.bg, color: theme.text }}>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <Link to="/ekklesia/admin" className="text-sm font-bold opacity-50 hover:opacity-100 flex items-center gap-2 mb-2"><ArrowLeft size={16} /> Voltar para Admin</Link>
                    <h1 className="text-3xl font-black tracking-tight">Dashboard Central</h1>
                </div>

                {/* MENU DE ABAS */}
                <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('EVENTS')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'EVENTS' ? 'bg-orange-500 text-white shadow-lg' : 'opacity-60'}`}
                    >
                        <Activity size={14} /> EVENTOS
                    </button>
                    <button
                        onClick={() => setActiveTab('EXECUTIVE')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'EXECUTIVE' ? 'bg-purple-600 text-white shadow-lg' : 'opacity-60'}`}
                    >
                        <LayoutTemplate size={14} /> EXECUTIVO
                    </button>
                </div>
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL */}
            {activeTab === 'EVENTS' ? (
                // Aqui passamos os dados para o componente detalhado
                <DashboardEvento isLightMode={isLightMode} data={data} />
            ) : (
                renderExecutive()
            )}

        </div>
    );
};