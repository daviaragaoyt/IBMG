import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Users, UserCheck, UserPlus, ArrowLeft, RefreshCw, Baby, Crown, Download, Maximize,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// CORES DOS GRÁFICOS (Mantidas iguais para identidade visual)
const COLORS = {
    male: '#3B82F6',
    female: '#EC4899',
    member: '#8B5CF6',
    visitor: '#F97316',
    kids: '#10B981',
    youth: '#FACC15',
    adult: '#6366F1'
};

// --- COMPONENTE PRINCIPAL ---
export const DashboardEvento = ({ isLightMode }: { isLightMode: boolean }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- CONFIGURAÇÃO DO TEMA (Claro vs Escuro) ---
    const theme = isLightMode ? {
        bg: '#F3F4F6',          // Fundo Claro (Gray 100)
        text: '#1F2937',        // Texto Escuro (Gray 800)
        subText: '#6B7280',     // Texto Cinza
        cardBg: '#FFFFFF',      // Card Branco
        cardBorder: '#E5E7EB',  // Borda Sutil
        hoverBorder: 'rgba(139, 92, 246, 0.3)', // Roxo suave no hover
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', // Sombra suave
        tooltipBg: '#FFFFFF',
        tooltipText: '#1F2937'
    } : {
        bg: '#0F0014',          // Fundo Escuro (Roxo Profundo)
        text: '#FFFFFF',        // Texto Branco
        subText: '#9CA3AF',     // Texto Cinza Claro
        cardBg: '#1A0524',      // Card Roxo Escuro
        cardBorder: '#2D0A3D',  // Borda Roxa
        hoverBorder: 'rgba(168, 85, 247, 0.5)', // Neon no hover
        shadow: '0 0 20px rgba(0,0,0,0.5)', // Sombra escura
        tooltipBg: '#1A0524',
        tooltipText: '#FFFFFF'
    };

    const CustomTooltipStyle = {
        backgroundColor: theme.tooltipBg,
        borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D',
        color: theme.tooltipText,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    };

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
        <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center font-bold z-50"
            style={{ backgroundColor: theme.bg, color: theme.text }}>
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
        <div className="fixed inset-0 w-screen h-screen overflow-y-auto p-4 pt-24 md:px-6 md:pb-6 md:pt-32 font-sans transition-colors duration-500 z-50 scrollbar-hide"
            style={{ backgroundColor: theme.bg, color: theme.text }}>

            <div className="max-w-7xl mx-auto pb-20 md:pb-0">

                {/* HEADER RESPONSIVO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in-down">
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <Link to="/ekklesia" className="p-2 md:p-3 rounded-full transition-all shrink-0 border"
                            style={{ backgroundColor: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)', borderColor: theme.cardBorder }}>
                            <ArrowLeft size={18} style={{ color: theme.text }} />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl md:text-3xl font-black tracking-tight drop-shadow-sm leading-tight">
                                DASHBOARD <span className="text-purple-500 block md:inline">AO VIVO</span>
                            </h1>
                            <p className="text-[10px] md:text-xs font-medium flex items-center gap-2 mt-1" style={{ color: theme.subText }}>
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Atualizando em tempo real
                            </p>
                        </div>

                        {/* Botões mobile */}
                        <div className="flex gap-2 md:hidden">
                            <button onClick={toggleFullScreen} className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg">
                                <Maximize size={18} />
                            </button>
                            <button onClick={fetchData} className="p-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Botões Desktop */}
                    <div className="hidden md:flex gap-3">
                        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all font-bold text-sm">
                            <Download size={18} />
                            <span>Excel</span>
                        </button>
                        <button onClick={fetchData} className="p-3 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all">
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* 1. CARDS DE KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">

                    {/* TOTAL */}
                    <div className="col-span-2 sm:col-span-1 border p-4 md:p-5 rounded-2xl relative overflow-hidden group transition-all duration-500"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="absolute right-0 top-0 p-4 opacity-20 text-purple-500"><Crown size={48} className="md:w-16 md:h-16" /></div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider relative z-10" style={{ color: theme.subText }}>Público Total</span>
                        <span className="text-4xl md:text-5xl font-black relative z-10 mt-1 md:mt-2 block" style={{ color: theme.text }}>{data.total}</span>
                    </div>

                    {/* VISITANTES */}
                    <div className="border p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36 relative overflow-hidden transition-all duration-500"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start">
                            <span className="text-orange-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Visitantes</span>
                            <div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg"><UserPlus size={14} className="md:w-4 md:h-4 text-orange-500" /></div>
                        </div>
                        <span className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>{data.byType.VISITOR}</span>
                        <div className="w-full h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: isLightMode ? '#E5E7EB' : '#374151' }}>
                            <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(data.byType.VISITOR / data.total) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] md:text-[10px] mt-1" style={{ color: theme.subText }}>{((data.byType.VISITOR / data.total) * 100).toFixed(0)}% do total</span>
                    </div>

                    {/* MEMBROS */}
                    <div className="border p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36 relative overflow-hidden transition-all duration-500"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start">
                            <span className="text-purple-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Membros</span>
                            <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg"><UserCheck size={14} className="md:w-4 md:h-4 text-purple-500" /></div>
                        </div>
                        <span className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>{data.byType.MEMBER}</span>
                        <div className="w-full h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: isLightMode ? '#E5E7EB' : '#374151' }}>
                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(data.byType.MEMBER / data.total) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] md:text-[10px] mt-1" style={{ color: theme.subText }}>{((data.byType.MEMBER / data.total) * 100).toFixed(0)}% do total</span>
                    </div>

                    {/* CRIANÇAS */}
                    <div className="col-span-2 sm:col-span-1 border p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36 transition-all duration-500"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start">
                            <span className="text-green-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Kids</span>
                            <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg"><Baby size={14} className="md:w-4 md:h-4 text-green-500" /></div>
                        </div>
                        <span className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>{data.byAge.CRIANCA}</span>
                        <span className="text-[9px] md:text-[10px] mt-1" style={{ color: theme.subText }}>Crianças registradas</span>
                    </div>
                </div>

                {/* 2. GRÁFICOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">

                    {/* GRÁFICO DE GÊNERO */}
                    <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem]"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <h3 className="font-bold mb-2 md:mb-4 flex items-center gap-2 text-sm md:text-base" style={{ color: theme.subText }}>
                            <Users size={16} className="md:w-[18px]" /> Distribuição por Gênero
                        </h3>
                        <div className="h-56 md:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" animationDuration={2500}>
                                        <Cell key="male" fill={COLORS.male} stroke="rgba(0,0,0,0)" />
                                        <Cell key="female" fill={COLORS.female} stroke="rgba(0,0,0,0)" />
                                    </Pie>
                                    <Tooltip contentStyle={CustomTooltipStyle} itemStyle={{ color: theme.text }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: theme.text, fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 md:gap-8 mt-2 text-xs md:text-sm font-bold">
                            <span className="text-blue-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{data.byGender.M} H</span>
                            <span className="text-pink-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div>{data.byGender.F} M</span>
                        </div>
                    </div>

                    {/* GRÁFICO DE IDADE */}
                    <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem]"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <h3 className="font-bold mb-2 md:mb-4 text-sm md:text-base" style={{ color: theme.subText }}>Faixa Etária</h3>
                        <div className="h-56 md:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? '#E5E7EB' : '#2D0A3D'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10 }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }} contentStyle={CustomTooltipStyle} />
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
                <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] mb-12"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                    <h3 className="font-bold mb-4 text-sm md:text-base" style={{ color: theme.subText }}>Top 5 Igrejas (Origem)</h3>
                    <div className="space-y-3 md:space-y-4">
                        {data.byChurch.map((church: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 md:p-4 rounded-xl border transition-colors"
                                style={{ backgroundColor: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.05)', borderColor: theme.cardBorder }}>
                                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                    <span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0
                                ${index === 0 ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-200 text-gray-500'}`}
                                        style={index !== 0 ? { backgroundColor: isLightMode ? '#E5E7EB' : '#374151', color: theme.subText } : {}}>
                                        {index + 1}
                                    </span>
                                    <span className="font-semibold text-sm md:text-base truncate" style={{ color: theme.text }}>{church.name}</span>
                                </div>
                                <span className="font-bold text-base md:text-lg shrink-0 pl-2" style={{ color: theme.text }}>{church.value} <span className="text-[10px] md:text-xs font-normal" style={{ color: theme.subText }}>un</span></span>
                            </div>
                        ))}
                        {data.byChurch.length === 0 && <p className="text-center py-4 text-sm" style={{ color: theme.subText }}>Nenhum dado de igreja ainda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};