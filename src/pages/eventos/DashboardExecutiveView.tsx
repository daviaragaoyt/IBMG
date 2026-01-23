import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, ShoppingBag, UtensilsCrossed, CalendarClock, ClipboardCheck, HeartHandshake } from 'lucide-react';

export const DashboardExecutiveView = ({ data, isLightMode }: any) => {
    const { salesStats, meetingStats, consolidationCount, manualCount, scannerCount } = data || {};

    // Tema condicional para este bloco
    const bgCard = isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#1A0524] border-white/10 text-white';
    const textSub = isLightMode ? 'text-slate-500' : 'text-slate-400';

    const categoryData = [
        { name: 'Cantina', value: salesStats?.byCategory?.CANTINA || 0, color: '#F59E0B' },
        { name: 'Loja', value: salesStats?.byCategory?.LOJA || 0, color: '#06B6D4' }
    ];
    const demogData = [
        { name: 'Membros', value: salesStats?.demographics?.MEMBER || 0 },
        { name: 'Visitantes', value: salesStats?.demographics?.VISITOR || 0 }
    ];

    return (
        <div className="animate-slide-up space-y-8 p-4">

            {/* BLOCO FINANCEIRO */}
            <div>
                <h3 className={`text-xl font-black mb-4 flex items-center gap-2 opacity-80 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    <TrendingUp size={20} /> Financeiro
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
                        <TrendingUp className="absolute top-4 right-4 opacity-30" size={40} />
                        <p className="text-sm font-bold opacity-80 mb-1">Total de Vendas</p>
                        <h2 className="text-4xl font-black">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.totalRevenue || 0)}
                        </h2>
                        <p className="text-xs opacity-60 mt-2">
                            {(salesStats?.demographics?.MEMBER || 0) + (salesStats?.demographics?.VISITOR || 0)} Transações
                        </p>
                    </div>
                    <div className={`p-6 rounded-3xl shadow-lg border relative ${bgCard}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className={`text-sm font-bold opacity-50 ${textSub}`}>Vendas Cantina</p>
                            <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg"><UtensilsCrossed size={20} /></div>
                        </div>
                        <h2 className="text-3xl font-black text-orange-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.byCategory?.CANTINA || 0)}
                        </h2>
                    </div>
                    <div className={`p-6 rounded-3xl shadow-lg border relative ${bgCard}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className={`text-sm font-bold opacity-50 ${textSub}`}>Vendas Loja</p>
                            <div className="p-2 bg-cyan-500/20 text-cyan-500 rounded-lg"><ShoppingBag size={20} /></div>
                        </div>
                        <h2 className="text-3xl font-black text-cyan-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesStats?.byCategory?.LOJA || 0)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* BLOCO GESTÃO */}
            <div>
                <h3 className={`text-xl font-black mb-4 flex items-center gap-2 opacity-80 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    <ClipboardCheck size={20} /> Gestão do Evento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`p-6 rounded-3xl shadow-lg border relative overflow-hidden ${bgCard}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarClock size={60} /></div>
                        <p className={`text-sm font-bold opacity-60 mb-2 ${textSub}`}>Reuniões de Staff</p>
                        <div className="flex gap-6">
                            <div><span className={`text-3xl font-black ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{meetingStats?.realizadas || 0}</span><p className="text-[10px] font-bold uppercase text-green-500">Realizadas</p></div>
                            <div><span className={`text-3xl font-black opacity-50 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{meetingStats?.agendadas || 0}</span><p className="text-[10px] font-bold uppercase text-orange-500">Agendadas</p></div>
                        </div>
                    </div>
                    <div className={`p-6 rounded-3xl shadow-lg border relative overflow-hidden ${bgCard}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><HeartHandshake size={60} /></div>
                        <p className={`text-sm font-bold opacity-60 mb-2 ${textSub}`}>Vidas Consagradas</p>
                        <h2 className="text-4xl font-black text-red-500">{consolidationCount || 0}</h2>
                        <p className={`text-xs opacity-60 mt-1 ${textSub}`}>Decisões registradas</p>
                    </div>
                    <div className={`p-6 rounded-3xl shadow-lg border relative overflow-hidden ${bgCard}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500"><Users size={60} /></div>
                        <p className={`text-sm font-bold opacity-60 mb-2 ${textSub}`}>Fluxo Total</p>
                        <h2 className="text-4xl font-black text-blue-500">{(manualCount || 0) + (scannerCount || 0)}</h2>
                        <p className={`text-xs opacity-60 mt-1 ${textSub}`}>Manual + Scanner</p>
                    </div>
                </div>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-3xl shadow-lg border ${bgCard}`}>
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
                <div className={`p-6 rounded-3xl shadow-lg border ${bgCard}`}>
                    <h3 className="font-bold mb-6 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Quem está comprando?</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demogData}>
                                <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#888" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
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