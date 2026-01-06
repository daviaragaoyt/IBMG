import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Users, UserCheck, UserPlus, ArrowLeft, RefreshCw, Baby, Crown, Download, Maximize
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = {
    male: '#3B82F6',
    female: '#FF00FF',
    member: '#A855F7',
    visitor: '#FF5500',
    kids: '#00E676',
    youth: '#FFD600',
    adult: '#6366F1'
};

const CustomTooltipStyle = {
    backgroundColor: '#1A0524',
    borderColor: '#2D0A3D',
    color: '#FFF',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
};

export const DashboardEvento = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/dashboard`);
            const json = await res.json();
            setData(json);
        } catch (error) { console.error("Erro ao buscar dados", error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    if (loading || !data) return (
        <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center font-bold text-white bg-[#0F0014] z-50">
            <RefreshCw className="animate-spin mb-4 text-purple-500" size={32} />
            <span className="animate-pulse">Carregando Dashboard...</span>
        </div>
    );

    const genderData = [
        { name: 'Homens', value: data.byGender.M },
        { name: 'Mulheres', value: data.byGender.F },
    ];

    const ageData = [
        { name: 'Crianças', value: data.byAge.CRIANCA, fill: COLORS.kids },
        { name: 'Jovens', value: data.byAge.JOVEM, fill: COLORS.youth },
        { name: 'Adultos', value: data.byAge.ADULTO, fill: COLORS.adult },
    ];

    const handleExport = () => {
        window.open(`${API_URL}/export`, '_blank');
    };

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-y-auto bg-[#0F0014] p-4 pt-24 md:px-6 md:pb-6 md:pt-32 font-sans text-white z-50 scrollbar-hide">
            <div className="max-w-7xl mx-auto pb-20 md:pb-0">

                {/* HEADER RESPONSIVO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in-down">
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <Link to="/ekklesia" className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all shrink-0">
                            <ArrowLeft size={18} className="text-white" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl md:text-3xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
                                DASHBOARD <span className="text-purple-500 block md:inline">AO VIVO</span>
                            </h1>
                            <p className="text-[10px] md:text-xs text-gray-400 font-medium flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Atualizando em tempo real
                            </p>
                        </div>

                        {/* Botões mobile (Movemos para o topo direito em telas pequenas) */}
                        <div className="flex gap-2 md:hidden">
                            <button onClick={toggleFullScreen} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                                <Maximize size={18} />
                            </button>
                            <button onClick={fetchData} className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Botões Desktop (Escondidos no mobile para limpar a visão) */}
                    <div className="hidden md:flex gap-3">
                        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all font-bold text-sm">
                            <Download size={18} />
                            <span>Excel</span>
                        </button>
                        <button onClick={fetchData} className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all">
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* 1. CARDS DE KPI (Grid adaptativo) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">

                    {/* TOTAL */}
                    <div className="col-span-2 sm:col-span-1 bg-[#1A0524] border border-[#2D0A3D] p-4 md:p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all duration-500">
                        <div className="absolute right-0 top-0 p-4 opacity-20 text-purple-500"><Crown size={48} className="md:w-16 md:h-16" /></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider relative z-10">Público Total</span>
                        <span className="text-4xl md:text-5xl font-black text-white relative z-10 mt-1 md:mt-2 block shadow-neon">{data.total}</span>
                    </div>

                    {/* VISITANTES */}
                    <div className="bg-[#1A0524] border border-[#2D0A3D] p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36 relative overflow-hidden hover:border-orange-500/50 transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <span className="text-orange-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Visitantes</span>
                            <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg"><UserPlus size={14} className="md:w-4 md:h-4 text-orange-500" /></div>
                        </div>
                        <span className="text-3xl md:text-4xl font-black text-white">{data.byType.VISITOR}</span>
                        <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(data.byType.VISITOR / data.total) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] md:text-[10px] text-gray-400 mt-1">{((data.byType.VISITOR / data.total) * 100).toFixed(0)}% do total</span>
                    </div>

                    {/* MEMBROS */}
                    <div className="bg-[#1A0524] border border-[#2D0A3D] p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36 relative overflow-hidden hover:border-purple-500/50 transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <span className="text-purple-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Membros</span>
                            <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg"><UserCheck size={14} className="md:w-4 md:h-4 text-purple-500" /></div>
                        </div>
                        <span className="text-3xl md:text-4xl font-black text-white">{data.byType.MEMBER}</span>
                        <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(data.byType.MEMBER / data.total) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] md:text-[10px] text-gray-400 mt-1">{((data.byType.MEMBER / data.total) * 100).toFixed(0)}% do total</span>
                    </div>

                    {/* CRIANÇAS */}
                    <div className="col-span-2 sm:col-span-1 bg-[#1A0524] border border-[#2D0A3D] p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36 hover:border-green-500/50 transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <span className="text-green-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Kids</span>
                            <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg"><Baby size={14} className="md:w-4 md:h-4 text-green-500" /></div>
                        </div>
                        <span className="text-3xl md:text-4xl font-black text-white">{data.byAge.CRIANCA}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-400 mt-1">Crianças registradas</span>
                    </div>
                </div>

                {/* 2. GRÁFICOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">

                    {/* GRÁFICO DE GÊNERO */}
                    <div className="bg-[#1A0524] border border-[#2D0A3D] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl">
                        <h3 className="font-bold text-gray-300 mb-2 md:mb-4 flex items-center gap-2 text-sm md:text-base"><Users size={16} className="md:w-[18px]" /> Distribuição por Gênero</h3>
                        <div className="h-56 md:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" animationDuration={2500}>
                                        <Cell key="male" fill={COLORS.male} stroke="rgba(0,0,0,0)" />
                                        <Cell key="female" fill={COLORS.female} stroke="rgba(0,0,0,0)" />
                                    </Pie>
                                    <Tooltip contentStyle={CustomTooltipStyle} itemStyle={{ color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 md:gap-8 mt-2 text-xs md:text-sm font-bold">
                            <span className="text-blue-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{data.byGender.M} H</span>
                            <span className="text-pink-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div>{data.byGender.F} M</span>
                        </div>
                    </div>

                    {/* GRÁFICO DE IDADE */}
                    <div className="bg-[#1A0524] border border-[#2D0A3D] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl">
                        <h3 className="font-bold text-gray-300 mb-2 md:mb-4 text-sm md:text-base">Faixa Etária</h3>
                        <div className="h-56 md:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D0A3D" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40} animationDuration={2500}>
                                        {ageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. TOP IGREJAS */}
                <div className="bg-[#1A0524] border border-[#2D0A3D] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl mb-12">
                    <h3 className="font-bold text-gray-300 mb-4 text-sm md:text-base">Top 5 Igrejas (Origem)</h3>
                    <div className="space-y-3 md:space-y-4">
                        {data.byChurch.map((church: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                    <span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0
                                ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-gray-700 text-gray-300'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="font-semibold text-gray-200 text-sm md:text-base truncate">{church.name}</span>
                                </div>
                                <span className="font-bold text-white text-base md:text-lg shrink-0 pl-2">{church.value} <span className="text-[10px] md:text-xs font-normal text-gray-500">un</span></span>
                            </div>
                        ))}
                        {data.byChurch.length === 0 && <p className="text-center text-gray-600 py-4 text-sm">Nenhum dado de igreja ainda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};