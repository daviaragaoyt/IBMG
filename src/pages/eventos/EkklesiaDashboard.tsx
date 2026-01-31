import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
    ArrowLeft, TrendingUp, Users, ShoppingBag, UtensilsCrossed,
    CalendarClock, ClipboardCheck, HeartHandshake, LayoutTemplate, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
// Importa o componente detalhado
import { DashboardEvento } from './DashboardEvento';

export const EkklesiaDashboard = ({ isLightMode }: any) => {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'EVENTS'>('EVENTS');

    useEffect(() => {
        api.getDashboard().then(setData).catch(console.error);
    }, []);

    const theme = {
        bg: isLightMode ? 'bg-gray-100' : 'bg-[#0F0014]',
        text: isLightMode ? 'text-gray-900' : 'text-white',
        card: isLightMode ? '#FFFFFF' : '#1A0524',
        border: isLightMode ? '#E5E7EB' : '#2D0A3D',
        muted: isLightMode ? 'text-gray-500' : 'text-gray-400',
        chartTooltip: isLightMode ? '#FFFFFF' : '#0F0014'
    };

    if (!data) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center text-2xl font-black text-purple-600 opacity-50`}>CARREGANDO...</div>;

    const { salesStats, meetingStats, consolidationCount, manualCount, scannerCount } = data;

    // --- RENDERIZAÇÃO DO DASHBOARD EXECUTIVO ---
    const renderExecutive = () => {
        const categoryData = [
            { name: 'Cantina', value: salesStats?.byCategory?.CANTINA || 0, color: '#F59E0B' }, // Laranja
            { name: 'Loja', value: salesStats?.byCategory?.LOJA || 0, color: '#06B6D4' }       // Ciano
        ];

        const demogData = [
            { name: 'Membros', value: salesStats?.demographics?.MEMBER || 0 },
            { name: 'Visitantes', value: salesStats?.demographics?.VISITOR || 0 }
        ];

        const ExecCard = ({ children, className = "" }: any) => (
            <div className={`p-6 rounded-[1.5rem] border shadow-lg relative overflow-hidden ${className}`}
                style={{ backgroundColor: theme.card, borderColor: theme.border, color: isLightMode ? '#1F2937' : '#FFFFFF' }}>
                {children}
            </div>
        );

        return (
            <div className="animate-slide-up space-y-8">

                {/* BLOCO FINANCEIRO */}
                <div>
                    <h3 className={`text-xl font-black mb-4 flex items-center gap-2 opacity-80 ${theme.text}`}><TrendingUp size={20} className="text-green-500" /> Visão Financeira</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-blue-700 text-white shadow-xl relative overflow-hidden border border-white/10">
                            <TrendingUp className="absolute top-4 right-4 opacity-30" size={40} />
                            <p className="text-sm font-bold opacity-80 mb-1 uppercase tracking-wider">Total de Vendas</p>
                            <h2 className="text-4xl font-black tracking-tight">
                                {(salesStats?.demographics?.MEMBER || 0) + (salesStats?.demographics?.VISITOR || 0)}
                            </h2>
                            <p className="text-xs opacity-60 mt-2 font-medium bg-black/20 inline-block px-2 py-1 rounded-lg">Transações realizadas</p>
                        </div>
                        <ExecCard>
                            <div className="flex justify-between items-start mb-4">
                                <p className={`text-xs font-bold uppercase tracking-widest ${theme.muted}`}>Cantina</p>
                                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl"><UtensilsCrossed size={20} /></div>
                            </div>
                            <h2 className="text-3xl font-black text-orange-500">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.byCategory?.CANTINA || 0)}
                            </h2>
                        </ExecCard>
                        <ExecCard>
                            <div className="flex justify-between items-start mb-4">
                                <p className={`text-xs font-bold uppercase tracking-widest ${theme.muted}`}>Loja Psalms</p>
                                <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl"><ShoppingBag size={20} /></div>
                            </div>
                            <h2 className="text-3xl font-black text-cyan-500">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.byCategory?.LOJA || 0)}
                            </h2>
                        </ExecCard>
                    </div>
                </div>

                {/* BLOCO GESTÃO */}
                <div>
                    <h3 className={`text-xl font-black mb-4 flex items-center gap-2 opacity-80 ${theme.text}`}><ClipboardCheck size={20} className="text-blue-500" /> Gestão Operacional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ExecCard>
                            <div className={`absolute top-0 right-0 p-4 opacity-5 ${theme.text}`}><CalendarClock size={80} /></div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme.muted}`}>Reuniões de Staff</p>
                            <div className="flex gap-8 items-end">
                                <div><span className="text-4xl font-black">{meetingStats?.realizadas || 0}</span><p className="text-[10px] font-bold uppercase text-green-500 mt-1">Realizadas</p></div>
                                <div className={`w-[1px] h-10 ${isLightMode ? 'bg-gray-300' : 'bg-white/10'}`}></div>
                                <div><span className={`text-3xl font-bold opacity-40`}>{meetingStats?.agendadas || 0}</span><p className="text-[10px] font-bold uppercase text-orange-400 mt-1">Agendadas</p></div>
                            </div>
                        </ExecCard>
                        <ExecCard>
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><HeartHandshake size={60} /></div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme.muted}`}>Vidas Consagradas</p>
                            <h2 className="text-5xl font-black text-red-500">{consolidationCount || 0}</h2>
                            <p className={`text-xs mt-2 ${theme.muted}`}>Decisões registradas</p>
                        </ExecCard>
                        <ExecCard>
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500"><Users size={60} /></div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme.muted}`}>Fluxo Total Estimado</p>
                            <h2 className="text-5xl font-black text-blue-500">{(manualCount || 0) + (scannerCount || 0)}</h2>
                            <p className={`text-xs mt-2 ${theme.muted}`}>Manual + Leitura QR</p>
                        </ExecCard>
                    </div>
                </div>

                {/* GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ExecCard>
                        <h3 className="font-bold mb-6 flex items-center gap-2"><ShoppingBag size={18} className="text-purple-500" /> Composição da Receita</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: theme.chartTooltip, border: `1px solid ${theme.border}`, borderRadius: '12px', color: isLightMode ? '#000' : '#fff' }} itemStyle={{ color: isLightMode ? '#000' : '#fff' }} formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ExecCard>
                    <ExecCard>
                        <h3 className="font-bold mb-6 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Perfil de Compra</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={demogData}>
                                    <XAxis dataKey="name" stroke={isLightMode ? '#666' : '#999'} tick={{ fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis stroke={isLightMode ? '#666' : '#999'} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: theme.chartTooltip, border: `1px solid ${theme.border}`, borderRadius: '12px', color: isLightMode ? '#000' : '#fff' }} />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ExecCard>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen p-4 md:p-8 pt-24 font-sans transition-colors duration-500 overflow-x-hidden ${theme.bg} ${theme.text}`}>

            {/* HEADER COM NAVEGAÇÃO DE ABAS SUPERIOR */}
            <div className={`flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6 border-b pb-6 ${isLightMode ? 'border-gray-200' : 'border-white/5'}`}>
                <div>
                    <Link to="/ekklesia/admin" className={`text-xs font-bold transition-colors flex items-center gap-2 mb-3 group ${theme.muted} hover:opacity-100`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isLightMode ? 'bg-gray-200 group-hover:bg-gray-300' : 'bg-white/5 group-hover:bg-white/10'}`}><ArrowLeft size={14} /></div>
                        Voltar para Admin
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Central</span>
                    </h1>
                </div>

                <div className={`p-1.5 rounded-2xl border flex gap-1 shadow-2xl ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#1A0524] border-[#2D0A3D]'}`}>
                    <button onClick={() => setActiveTab('EVENTS')} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 uppercase tracking-wider ${activeTab === 'EVENTS' ? 'bg-[#F97316] text-white shadow-lg shadow-orange-900/20 translate-y-[-1px]' : `${theme.muted} hover:opacity-100 hover:bg-gray-50 dark:hover:bg-white/5`}`}>
                        <Activity size={16} /> EVENTOS
                    </button>
                    <button onClick={() => setActiveTab('EXECUTIVE')} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 uppercase tracking-wider ${activeTab === 'EXECUTIVE' ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-900/20 translate-y-[-1px]' : `${theme.muted} hover:opacity-100 hover:bg-gray-50 dark:hover:bg-white/5`}`}>
                        <LayoutTemplate size={16} /> EXECUTIVO
                    </button>
                </div>
            </div>

            {/* ÁREA DE CONTEÚDO */}
            <div className="min-h-[500px]">
                {activeTab === 'EVENTS' ? <DashboardEvento isLightMode={isLightMode} data={data} /> : renderExecutive()}
            </div>
        </div>
    );
};