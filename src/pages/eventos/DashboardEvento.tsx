import { useEffect, useState, useMemo } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, Legend, ComposedChart
} from 'recharts';
import {
    Users, ArrowLeft, RefreshCw, Crown, MapPin, Zap, TrendingUp, Briefcase, Smile, Share2, CalendarDays, BarChart2, Activity, Megaphone, ArrowUpRight, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// --- CORES ---
const COLORS = {
    male: '#3B82F6', female: '#EC4899',
    member: '#8B5CF6', visitor: '#F97316',
    kids: '#10B981', youth: '#FACC15', adult: '#6366F1'
};
const COLORS_MARKETING = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

const MAIN_ENTRANCE_NAME = "Recepção / Entrada";

export const DashboardEvento = ({ isLightMode }: { isLightMode: boolean }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'LIVE' | 'ANALYTICS'>('LIVE');

    const today = new Date().getDate().toString();
    const [selectedDay, setSelectedDay] = useState(today);

    const eventDays = ['13', '14', '15', '16', '17'];
    const daysToShow = eventDays.includes(today) ? eventDays : [today, ...eventDays];

    // --- TEMA ---
    const theme = isLightMode ? {
        bg: '#F3F4F6', text: '#1F2937', subText: '#6B7280', cardBg: '#FFFFFF', cardBorder: '#E5E7EB',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        tooltipBg: 'rgba(255, 255, 255, 0.95)', tooltipText: '#1F2937',
        gridColor: '#E5E7EB'
    } : {
        bg: '#0F0014', text: '#FFFFFF', subText: '#9CA3AF', cardBg: '#1A0524', cardBorder: '#2D0A3D',
        shadow: '0 0 40px rgba(0,0,0,0.5)',
        tooltipBg: 'rgba(26, 5, 36, 0.95)', tooltipText: '#FFFFFF',
        gridColor: '#2D0A3D'
    };

    const CustomTooltipStyle = {
        backgroundColor: theme.tooltipBg,
        borderColor: theme.cardBorder,
        color: theme.tooltipText,
        borderRadius: '12px',
        borderWidth: '1px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        fontSize: '12px',
        fontWeight: '600',
        padding: '12px',
        backdropFilter: 'blur(8px)',
        outline: 'none'
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
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // =================================================================================
    // 🧠 PROCESSAMENTO INTELIGENTE (AGREGADOR POR DIA)
    // =================================================================================
    const dailyStats = useMemo(() => {
        const stats = {
            totalEntrance: 0,
            kidsTotal: 0,
            visitors: 0,
            members: 0,
            gender: { M: 0, F: 0 },
            age: { CRIANCA: 0, JOVEM: 0, ADULTO: 0 },
            marketing: {} as Record<string, number>,
            church: {} as Record<string, number>
        };

        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) return stats;

        Object.entries(data.checkpointsData[selectedDay]).forEach(([cpName, cpData]: [string, any]) => {

            // 1. Totais Específicos
            if (cpName === MAIN_ENTRANCE_NAME) {
                stats.totalEntrance = cpData.total || 0;
            }
            if (cpName.toLowerCase().includes('kids') || cpName.toLowerCase().includes('criança')) {
                stats.kidsTotal += cpData.total || 0;
            }

            // 2. Visitantes/Membros
            stats.visitors += cpData.type?.VISITOR || 0;
            stats.members += cpData.type?.MEMBER || 0;

            // 3. Gênero
            if (cpData.gender) {
                stats.gender.M += cpData.gender.M || 0;
                stats.gender.F += cpData.gender.F || 0;
            }

            // 4. Idade
            if (cpData.age) {
                stats.age.CRIANCA += cpData.age.CRIANCA || 0;
                stats.age.JOVEM += cpData.age.JOVEM || 0;
                stats.age.ADULTO += cpData.age.ADULTO || 0;
            }

            // 5. Marketing
            if (cpData.source) {
                Object.entries(cpData.source).forEach(([key, val]) => {
                    stats.marketing[key] = (stats.marketing[key] || 0) + (val as number);
                });
            }

            // 6. Igrejas
            if (cpData.church) {
                Object.entries(cpData.church).forEach(([key, val]) => {
                    stats.church[key] = (stats.church[key] || 0) + (val as number);
                });
            }
        });

        return stats;
    }, [data, selectedDay]);

    // --- CÁLCULOS GERAIS ---
    const getAccumulatedAudience = () => {
        if (!data?.checkpointsData) return 0;
        let sum = 0;
        Object.values(data.checkpointsData).forEach((dayData: any) => {
            sum += dayData[MAIN_ENTRANCE_NAME]?.total || 0;
        });
        return sum;
    };
    const accumulatedTotal = getAccumulatedAudience();

    // --- DADOS DO HORÁRIO DE PICO ---
    const getPeakHour = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) return { hour: '--', val: 0 };
        const dayData = data.timeline[selectedDay];
        const sorted = Object.entries(dayData).sort((a: [string, any], b: [string, any]) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
        if (sorted.length === 0) return { hour: '--', val: 0 };
        return { hour: `${sorted[0][0]}h`, val: Number(sorted[0][1]) || 0 };
    };
    const peakData = getPeakHour();

    // --- PREPARAÇÃO DE DADOS PARA GRÁFICOS ---
    const genderData = [
        { name: 'Homens', value: dailyStats.gender.M },
        { name: 'Mulheres', value: dailyStats.gender.F }
    ];

    const ageData = [
        { name: 'Crianças', value: dailyStats.age.CRIANCA, fill: COLORS.kids },
        { name: 'Jovens', value: dailyStats.age.JOVEM, fill: COLORS.youth },
        { name: 'Adultos', value: dailyStats.age.ADULTO, fill: COLORS.adult },
    ];

    const marketingData = Object.entries(dailyStats.marketing)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const churchData = Object.entries(dailyStats.church)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const topSource = marketingData.length > 0 ? marketingData[0] : { name: 'Sem dados', value: 0 };


    // --- RENDERIZADORES ---

    const renderHourlyChart = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) {
            return <div className="h-96 flex items-center justify-center opacity-50 text-sm font-medium">Aguardando dados de fluxo...</div>;
        }
        const dayData = data.timeline[selectedDay];
        const chartData = Object.keys(dayData).sort((a, b) => parseInt(a) - parseInt(b)).map(hour => ({ name: `${hour}:00`, value: dayData[hour] }));

        return (
            <div className="h-80 md:h-[400px] w-full mt-4 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridColor} opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 11, fontWeight: 500 }} minTickGap={30} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 11 }} width={30} />
                        <Tooltip contentStyle={CustomTooltipStyle} cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, stroke: theme.cardBg, strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderCheckpointsDetails = () => {
        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) return <p className="text-center opacity-50 py-10 text-sm">Nenhum dado de check-in.</p>;
        const locais = Object.entries(data.checkpointsData[selectedDay]);

        return (
            <div className="flex flex-col gap-4">
                {locais.map(([nome, stats]: any) => (
                    <div key={nome} className="p-5 rounded-2xl border transition-all hover:translate-x-1" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2 text-purple-500 w-[70%]">
                                <div className={`p-1.5 rounded-lg ${nome === MAIN_ENTRANCE_NAME ? 'bg-yellow-500/10 text-yellow-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    {nome === MAIN_ENTRANCE_NAME ? <Crown size={14} /> : <MapPin size={14} />}
                                </div>
                                <span className="truncate">{nome}</span>
                            </h4>
                            <span className="text-2xl font-black" style={{ color: theme.text }}>{stats.total}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-500/10 overflow-hidden flex mb-2">
                            <div style={{ width: `${(stats.type?.VISITOR / stats.total) * 100 || 0}%`, background: COLORS.visitor }}></div>
                            <div style={{ width: `${(stats.type?.MEMBER / stats.total) * 100 || 0}%`, background: COLORS.member }}></div>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold uppercase opacity-70" style={{ color: theme.text }}>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: COLORS.visitor }}></div> Vis: {stats.type?.VISITOR || 0}</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: COLORS.member }}></div> Mem: {stats.type?.MEMBER || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderAnalyticsDashboard = () => {
        // Dados de Evolução (Isso precisa de todos os dias para fazer sentido)
        const evolutionData = eventDays.map(day => {
            const dayTotal = data?.checkpointsData?.[day]?.[MAIN_ENTRANCE_NAME]?.total || 0;
            return {
                name: `Dia ${day}`,
                total: dayTotal,
                visitantes: Math.round(dayTotal * ((data?.byType?.VISITOR || 0) / (accumulatedTotal || 1)))
            };
        });

        return (
            <div className="animate-fade-in space-y-8">
                {/* KPIS ANALYTICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-[2rem] border flex flex-col justify-between h-44 shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start"><span className="text-xs font-bold opacity-60 uppercase flex items-center gap-2"><CalendarDays size={14} /> Acumulado</span><div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><BarChart2 size={18} /></div></div>
                        <span className="text-5xl font-black tracking-tight" style={{ color: theme.text }}>{accumulatedTotal}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg w-fit"><ArrowUpRight size={12} /> Total Inscritos</div>
                    </div>
                    <div className="p-6 rounded-[2rem] border flex flex-col justify-between h-44 shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start"><span className="text-xs font-bold opacity-60 uppercase flex items-center gap-2"><Activity size={14} /> Média / Hora</span><div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Zap size={18} /></div></div>
                        <span className="text-5xl font-black tracking-tight" style={{ color: theme.text }}>~{Math.round(dailyStats.totalEntrance / 5)}</span>
                        <span className="text-xs opacity-50 font-bold">Pessoas por hora (Hoje)</span>
                    </div>
                    <div className="p-6 rounded-[2rem] border flex flex-col justify-between h-44 shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start"><span className="text-xs font-bold opacity-60 uppercase flex items-center gap-2"><Megaphone size={14} /> Top Canal</span><div className="p-2 bg-pink-100 text-pink-600 rounded-xl"><Share2 size={18} /></div></div>
                        <span className="text-2xl font-black truncate leading-tight mt-2" style={{ color: theme.text }}>{topSource.name}</span>
                        <div className="mt-auto"><span className="text-xs opacity-50 font-bold block">{topSource.value} Conversões</span><div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden"><div className="h-full bg-pink-500" style={{ width: '70%' }}></div></div></div>
                    </div>
                    <div className="p-6 rounded-[2rem] border flex flex-col justify-between h-44 shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start"><span className="text-xs font-bold opacity-60 uppercase flex items-center gap-2"><Users size={14} /> Total Visitantes</span><div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Smile size={18} /></div></div>
                        {/* AQUI FOI ALTERADO: REMOVIDA % E COLOCADO NÚMERO FIXO */}
                        <span className="text-5xl font-black text-orange-500">{dailyStats.visitors}</span>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${Math.round(((dailyStats.visitors || 0) / (dailyStats.totalEntrance || 1)) * 100)}%` }}></div></div>
                    </div>
                </div>

                {/* TENDÊNCIA */}
                <div className="p-8 rounded-[2.5rem] border shadow-xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <h3 className="font-bold text-lg mb-8 flex items-center gap-3"><TrendingUp size={24} className="text-blue-500" /> Tendência de Público</h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} /></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridColor} opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 12 }} />
                                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: theme.text, opacity: 0.05 }} />
                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} iconType="circle" />
                                <Bar dataKey="total" name="Total Geral" barSize={60} fill="url(#colorTotal)" radius={[8, 8, 0, 0]} />
                                <Line type="monotone" dataKey="visitantes" name="Visitantes" stroke="#F97316" strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: theme.cardBg }} activeDot={{ r: 8 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* DETALHES ANALYTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2.5rem] border shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-3"><Share2 size={24} className="text-pink-500" /> Marketing (Dia {selectedDay})</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={marketingData} margin={{ left: 0, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme.gridColor} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={110} tick={{ fill: theme.text, fontSize: 11, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: theme.text, opacity: 0.05 }} contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {marketingData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] border shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-3"><Users size={24} className="text-green-500" /> Idade (Dia {selectedDay})</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={ageData} margin={{ left: 10, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={theme.gridColor} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12, fill: theme.text, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                        {ageData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index === 0 ? 'kids' : index === 1 ? 'youth' : 'adult']} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || !data) return <div className="fixed inset-0 flex flex-col items-center justify-center font-bold z-50 gap-4" style={{ backgroundColor: theme.bg, color: theme.text }}><RefreshCw className="animate-spin text-purple-500" size={48} /><span className="text-base opacity-70 animate-pulse">Carregando Dashboard...</span></div>;

    const handleExport = () => window.open(`${API_URL}/export`, '_blank');
    console.log(handleExport)

    const containerClasses = "w-full min-h-screen relative";
    const stickyHeaderClasses = "sticky top-[60px] md:top-[70px] z-30 px-3 py-3 md:px-8 mt-[-1rem]";

    return (
        <div className={`${containerClasses} font-sans transition-colors duration-500 pb-24 scrollbar-hide selection:bg-purple-500 selection:text-white`} style={{ backgroundColor: theme.bg, color: theme.text }}>

            {/* HEADER */}
            <div className={`${stickyHeaderClasses} backdrop-blur-xl border-b border-gray-500/5 shadow-sm transition-all`} style={{ backgroundColor: isLightMode ? 'rgba(243, 244, 246, 0.95)' : 'rgba(15, 0, 20, 0.95)' }}>
                <div className="max-w-[1600px] mx-auto flex flex-col gap-3 animate-fade-in-down">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Link to="/ekklesia" className="p-2.5 rounded-xl border active:scale-95 transition-all hover:bg-gray-500/10" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}><ArrowLeft size={20} style={{ color: theme.text }} /></Link>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black tracking-tight leading-none uppercase">Dashboard <span className="text-purple-500">Eventos</span></h1>
                                <p className="text-[10px] md:text-xs font-bold mt-1 opacity-60 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-shadow-green"></span> {viewMode === 'LIVE' ? 'Monitoramento em Tempo Real' : 'Inteligência de Dados'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-3">
                        <div className="flex bg-gray-500/5 p-1.5 rounded-xl border shrink-0" style={{ borderColor: theme.cardBorder }}>
                            <button onClick={() => setViewMode('LIVE')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'LIVE' ? 'bg-white shadow-md text-black transform scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                                <Activity size={14} /> Ao Vivo
                            </button>
                            <button onClick={() => setViewMode('ANALYTICS')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'ANALYTICS' ? 'bg-white shadow-md text-black transform scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                                <BarChart2 size={14} /> Análise
                            </button>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-500/20 shrink-0"></div>
                        <div className="flex gap-2 min-w-max">
                            {daysToShow.map(day => (
                                <button key={day} onClick={() => setSelectedDay(day)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${selectedDay === day ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-110' : 'text-gray-500 bg-transparent border-transparent hover:bg-white/5 hover:border-gray-500/20'}`}>
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-10">
                {viewMode === 'LIVE' ? (
                    <div className="animate-fade-in space-y-6 md:space-y-8">
                        {/* BIG NUMBERS LIVE */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                            {/* Card 1: Total do Dia */}
                            <div className="col-span-2 lg:col-span-1 p-6 rounded-[2rem] relative overflow-hidden flex flex-col justify-center border h-36 md:h-48 shadow-xl transition-transform hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', borderColor: 'transparent' }}>
                                <div className="absolute right-[-20px] top-[-20px] opacity-20 text-white mix-blend-overlay"><Crown size={120} /></div>
                                <span className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Users size={12} /> Público Hoje</span>
                                <span className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter shadow-black drop-shadow-sm">{dailyStats.totalEntrance}</span>
                                <span className="text-[10px] text-white/60 font-medium mt-2 bg-black/10 w-fit px-2 py-0.5 rounded-full">*Recepção Principal</span>
                            </div>

                            {/* Card 2: Acumulado */}
                            <div className="col-span-1 p-6 rounded-[2rem] border flex flex-col justify-between h-36 md:h-48 shadow-lg bg-gradient-to-br from-transparent to-purple-500/5 transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5"><CalendarDays size={12} /> Total Evento</span>
                                <div><span className="text-3xl md:text-6xl font-black block tracking-tighter" style={{ color: theme.text }}>{accumulatedTotal}</span><span className="text-[10px] font-bold opacity-50">Inscritos Gerais</span></div>
                                <div className="w-full h-1.5 bg-purple-500/20 rounded-full"><div className="h-full bg-purple-500 rounded-full w-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div></div>
                            </div>


                            {/* Card 4: VISITANTES/MEMBROS (BARRAS COM NUMEROS FIXOS) */}
                            <div className="col-span-2 lg:col-span-1 p-6 rounded-[2rem] border flex flex-col justify-center gap-4 h-36 md:h-48 shadow-lg bg-gradient-to-br from-transparent to-blue-500/5 transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <div>
                                    <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-orange-500 uppercase">Visitantes</span><span className="text-xs font-black">{dailyStats.visitors}</span></div>
                                    <div className="w-full h-2 rounded-full bg-gray-200/20 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${(dailyStats.visitors / (dailyStats.totalEntrance || 1)) * 100}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-purple-500 uppercase">Membros</span><span className="text-xs font-black">{dailyStats.members}</span></div>
                                    <div className="w-full h-2 rounded-full bg-gray-200/20 overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${(dailyStats.members / (dailyStats.totalEntrance || 1)) * 100}%` }}></div></div>
                                </div>
                            </div>
                        </div>

                        {/* GRÁFICOS LIVE (DADOS DINÂMICOS DO DIA) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 p-6 md:p-8 rounded-[2.5rem] border shadow-xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-purple-500/10"><TrendingUp size={20} className="text-purple-500" /></div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-none">Fluxo em Tempo Real</h3>
                                            <p className="text-xs opacity-50 font-bold mt-1">Monitoramento por hora (Dia {selectedDay})</p>
                                        </div>
                                    </div>
                                    {/* DADO EXTRA: PICO DE HORÁRIO COM NUMERO FIXO */}
                                    <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/20">
                                        <Clock size={16} className="text-yellow-600" />
                                        <div>
                                            <span className="text-[10px] font-bold uppercase text-yellow-600 block leading-none">Pico às {peakData.hour}</span>
                                            <span className="text-xs font-black text-yellow-700">{peakData.val} pessoas</span>
                                        </div>
                                    </div>
                                </div>
                                {renderHourlyChart()}
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                                <div className="p-6 rounded-[2rem] border flex flex-col items-center justify-center text-center shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider">Demografia: Gênero</h3>
                                    <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value">
                                                    <Cell key="male" fill={COLORS.male} stroke="none" /><Cell key="female" fill={COLORS.female} stroke="none" />
                                                </Pie>
                                                <Tooltip contentStyle={CustomTooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-4 justify-center mt-3 w-full">
                                        {/* REMOVIDA % E COLOCADO NUMERO FIXO */}
                                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-500/5 w-1/2 justify-center"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs font-bold text-blue-500">{dailyStats.gender.M} H</span></div>
                                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-pink-500/5 w-1/2 justify-center"><div className="w-2 h-2 rounded-full bg-pink-500"></div><span className="text-xs font-bold text-pink-500">{dailyStats.gender.F} M</span></div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[2rem] border shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="text-xs font-bold uppercase opacity-50 mb-4 text-center tracking-wider">Demografia: Idade</h3>
                                    <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ageData} layout="vertical" margin={{ left: -15, right: 10 }}>
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10, fill: theme.text, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={12}>
                                                    {ageData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index === 0 ? 'kids' : index === 1 ? 'youth' : 'adult']} />))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marketing e Igrejas LIVE (DADOS DINÂMICOS DO DIA) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            <div className="p-8 rounded-[2.5rem] border shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-xl bg-pink-500/10"><Share2 size={20} className="text-pink-500" /></div><h3 className="font-bold text-lg">Origem (Dia {selectedDay})</h3></div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={marketingData} margin={{ left: 0, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme.gridColor} opacity={0.3} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={110} tick={{ fill: theme.text, fontSize: 11, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: theme.text, opacity: 0.05 }} contentStyle={CustomTooltipStyle} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>{(marketingData).map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} />))}</Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="p-8 rounded-[2.5rem] border shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase size={20} className="text-blue-500" /> Top Igrejas (Dia {selectedDay})</h3>
                                    <div className="space-y-3">
                                        {(churchData).slice(0, 3).map((church: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-xl border bg-gray-500/5 transition-colors hover:bg-gray-500/10" style={{ borderColor: theme.cardBorder }}>
                                                <div className="flex items-center gap-3 overflow-hidden"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}>#{index + 1}</span><span className="font-bold text-sm truncate" style={{ color: theme.text }}>{church.name}</span></div><span className="font-black text-lg text-purple-600" style={{ color: theme.text }}>{church.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 p-8 rounded-[2.5rem] border overflow-hidden flex flex-col shadow-lg" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500" /> Raio-X Checkpoints</h3>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide max-h-[350px]">{renderCheckpointsDetails()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    renderAnalyticsDashboard()
                )}
            </div>
        </div>
    );
};