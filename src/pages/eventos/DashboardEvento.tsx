import { useEffect, useState } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, Legend, ComposedChart
} from 'recharts';
import {
    Users, ArrowLeft, RefreshCw, Crown, MapPin, Zap, TrendingUp, Briefcase, Smile, Share2, CalendarDays, BarChart2, Activity, Megaphone, ArrowUpRight
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
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', tooltipBg: '#FFFFFF', tooltipText: '#1F2937',
        gridColor: '#E5E7EB'
    } : {
        bg: '#0F0014', text: '#FFFFFF', subText: '#9CA3AF', cardBg: '#1A0524', cardBorder: '#2D0A3D',
        shadow: '0 0 20px rgba(0,0,0,0.5)', tooltipBg: '#1A0524', tooltipText: '#FFFFFF',
        gridColor: '#2D0A3D'
    };

    const CustomTooltipStyle = {
        backgroundColor: theme.tooltipBg,
        borderColor: theme.cardBorder,
        color: theme.tooltipText,
        borderRadius: '8px',
        borderWidth: '1px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '8px'
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

    // --- CÁLCULOS ---
    const getTodayAudience = () => {
        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) return 0;
        return data.checkpointsData[selectedDay][MAIN_ENTRANCE_NAME]?.total || 0;
    };

    const getAccumulatedAudience = () => {
        if (!data?.checkpointsData) return 0;
        let sum = 0;
        Object.values(data.checkpointsData).forEach((dayData: any) => {
            sum += dayData[MAIN_ENTRANCE_NAME]?.total || 0;
        });
        return sum;
    };

    const getPeakHour = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) return { hour: '--', val: 0 };
        const dayData = data.timeline[selectedDay];
        const sorted = Object.entries(dayData).sort((a: [string, any], b: [string, any]) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
        if (sorted.length === 0) return { hour: '--', val: 0 };
        return { hour: `${sorted[0][0]}h`, val: Number(sorted[0][1]) || 0 };
    };

    const todayTotal = getTodayAudience();
    const accumulatedTotal = getAccumulatedAudience();
    const peakData = getPeakHour();
    console.log(peakData)

    // --- RENDERIZADORES ---

    const renderHourlyChart = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) {
            return <div className="h-48 md:h-64 flex items-center justify-center opacity-50 text-xs">Sem dados.</div>;
        }
        const dayData = data.timeline[selectedDay];
        const chartData = Object.keys(dayData).sort((a, b) => parseInt(a) - parseInt(b)).map(hour => ({ name: `${hour}h`, value: dayData[hour] }));

        return (
            <div className="h-48 md:h-64 w-full mt-2 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridColor} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10, fontWeight: 500 }} minTickGap={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10 }} width={25} />
                        <Tooltip contentStyle={CustomTooltipStyle} />
                        <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderCheckpointsDetails = () => {
        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) return <p className="text-center opacity-50 py-4 text-xs">Sem dados.</p>;
        const locais = Object.entries(data.checkpointsData[selectedDay]);

        return (
            <div className="flex flex-col gap-3">
                {locais.map(([nome, stats]: any) => (
                    <div key={nome} className="p-4 rounded-2xl border transition-all active:scale-[0.98]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 truncate text-purple-500 max-w-[70%]">
                                {nome === MAIN_ENTRANCE_NAME ? <Crown size={14} className="text-yellow-500" /> : <MapPin size={14} />}
                                <span className="truncate">{nome}</span>
                            </h4>
                            <span className="text-xl font-black" style={{ color: theme.text }}>{stats.total}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-500/10 overflow-hidden flex">
                            <div style={{ width: `${(stats.type?.VISITOR / stats.total) * 100 || 0}%`, background: COLORS.visitor }}></div>
                            <div style={{ width: `${(stats.type?.MEMBER / stats.total) * 100 || 0}%`, background: COLORS.member }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase mt-1.5 opacity-70" style={{ color: theme.text }}>
                            <span>Vis: {stats.type?.VISITOR || 0}</span>
                            <span>Mem: {stats.type?.MEMBER || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // === ANALYTICS VIEW RENDERER (NOVO) ===
    const renderAnalyticsDashboard = () => {
        const evolutionData = eventDays.map(day => {
            const dayTotal = data?.checkpointsData?.[day]?.[MAIN_ENTRANCE_NAME]?.total || 0;
            return {
                name: `Dia ${day}`,
                total: dayTotal,
                visitantes: Math.round(dayTotal * ((data?.byType?.VISITOR || 0) / (accumulatedTotal || 1)))
            };
        });

        const topSource = data?.bySource?.[0] || { name: 'Sem dados', value: 0 };

        return (
            <div className="animate-fade-in space-y-6">

                {/* 1. KPIS ESTRATÉGICOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-[1.5rem] border flex flex-col justify-between h-32" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1"><CalendarDays size={12} /> Acumulado</span>
                            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><BarChart2 size={14} /></div>
                        </div>
                        <span className="text-4xl font-black" style={{ color: theme.text }}>{accumulatedTotal}</span>
                        <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><ArrowUpRight size={10} /> Total de Inscritos</span>
                    </div>

                    <div className="p-5 rounded-[1.5rem] border flex flex-col justify-between h-32" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1"><Activity size={12} /> Média / Hora</span>
                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Zap size={14} /></div>
                        </div>
                        <span className="text-4xl font-black" style={{ color: theme.text }}>~{Math.round(todayTotal / 5)}</span>
                        <span className="text-[10px] opacity-40 font-bold">Pessoas por hora</span>
                    </div>

                    <div className="p-5 rounded-[1.5rem] border flex flex-col justify-between h-32" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1"><Megaphone size={12} /> Top Canal</span>
                            <div className="p-1.5 bg-pink-100 text-pink-600 rounded-lg"><Share2 size={14} /></div>
                        </div>
                        <span className="text-xl font-black truncate leading-tight mt-1" style={{ color: theme.text }}>{topSource.name}</span>
                        <span className="text-[10px] opacity-40 font-bold">{topSource.value} Conversões</span>
                    </div>

                    <div className="p-5 rounded-[1.5rem] border flex flex-col justify-between h-32" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1"><Users size={12} /> % Visitantes</span>
                            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Smile size={14} /></div>
                        </div>
                        <span className="text-4xl font-black text-orange-500">
                            {Math.round(((data?.byType?.VISITOR || 0) / (todayTotal || 1)) * 100)}%
                        </span>
                        <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: `${Math.round(((data?.byType?.VISITOR || 0) / (todayTotal || 1)) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* 2. GRÁFICO DE TENDÊNCIA (TOTAL VS VISITANTES) */}
                <div className="p-6 rounded-[2rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <h3 className="font-bold text-base mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" /> Tendência de Público (Total vs Visitantes)</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridColor} opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10 }} />
                                <Tooltip contentStyle={CustomTooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                                <Bar dataKey="total" name="Total Geral" barSize={30} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="visitantes" name="Visitantes" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 3. MARKETING DONUT */}
                    <div className="p-6 rounded-[2rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-base mb-2 flex items-center gap-2"><Share2 size={18} className="text-pink-500" /> Distribuição de Marketing</h3>
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="h-64 w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data?.bySource || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {(data?.bySource || []).map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={CustomTooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {(data?.bySource || []).map((source: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-xs font-bold p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_MARKETING[index % COLORS_MARKETING.length] }}></div>
                                            <span className="truncate max-w-[100px]" style={{ color: theme.text }}>{source.name}</span>
                                        </div>
                                        <span style={{ color: theme.text }}>{source.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. PERFIL (IDADE) */}
                    <div className="p-6 rounded-[2rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-base mb-6 flex items-center gap-2"><Users size={18} className="text-green-500" /> Perfil do Público</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={ageData} margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10, fill: theme.text, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {ageData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index === 0 ? 'kids' : index === 1 ? 'youth' : 'adult']} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || !data) return <div className="fixed inset-0 flex flex-col items-center justify-center font-bold z-50 gap-2" style={{ backgroundColor: theme.bg, color: theme.text }}><RefreshCw className="animate-spin text-purple-500" size={40} /><span className="text-sm opacity-70">Carregando dados...</span></div>;

    const genderData = [{ name: 'Homens', value: data?.byGender?.M || 0 }, { name: 'Mulheres', value: data?.byGender?.F || 0 }];
    const ageData = [
        { name: 'Crianças', value: data?.byAge?.CRIANCA || 0, fill: COLORS.kids },
        { name: 'Jovens', value: data?.byAge?.JOVEM || 0, fill: COLORS.youth },
        { name: 'Adultos', value: data?.byAge?.ADULTO || 0, fill: COLORS.adult },
    ];
    const handleExport = () => window.open(`${API_URL}/export`, '_blank');
    console.log(handleExport)

    const containerClasses = "w-full min-h-screen relative";
    const stickyHeaderClasses = "sticky top-[60px] md:top-[70px] z-30 px-3 py-3 md:px-8 mt-[-1rem]";

    return (
        <div className={`${containerClasses} font-sans transition-colors duration-500 pb-24 scrollbar-hide`} style={{ backgroundColor: theme.bg, color: theme.text }}>

            {/* HEADER */}
            <div className={`${stickyHeaderClasses} backdrop-blur-xl border-b border-gray-500/5 shadow-sm transition-all`} style={{ backgroundColor: isLightMode ? 'rgba(243, 244, 246, 0.95)' : 'rgba(15, 0, 20, 0.95)' }}>
                <div className="max-w-[1400px] mx-auto flex flex-col gap-3 animate-fade-in-down">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Link to="/ekklesia" className="p-2 rounded-xl border active:scale-95 transition-all" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}><ArrowLeft size={18} style={{ color: theme.text }} /></Link>
                            <div>
                                <h1 className="text-lg md:text-2xl font-black tracking-tight leading-none uppercase">Dashboard</h1>
                                <p className="text-[10px] md:text-xs font-bold mt-0.5 opacity-60 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {viewMode === 'LIVE' ? 'Ao Vivo' : 'Inteligência'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-3">
                        <div className="flex bg-gray-500/5 p-1 rounded-xl border shrink-0" style={{ borderColor: theme.cardBorder }}>
                            <button onClick={() => setViewMode('LIVE')} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'LIVE' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>
                                <Activity size={12} /> Ao Vivo
                            </button>
                            <button onClick={() => setViewMode('ANALYTICS')} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'ANALYTICS' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>
                                <BarChart2 size={12} /> Análise
                            </button>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-500/20 shrink-0"></div>
                        <div className="flex gap-2 min-w-max">
                            {daysToShow.map(day => (
                                <button key={day} onClick={() => setSelectedDay(day)} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all border ${selectedDay === day ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'text-gray-500 bg-transparent border-transparent hover:bg-white/5'}`}>
                                    {day === today ? 'HJ' : day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 md:p-8 max-w-[1400px] mx-auto space-y-4 md:space-y-8">
                {viewMode === 'LIVE' ? (
                    <div className="animate-fade-in space-y-4 md:space-y-6">
                        {/* BIG NUMBERS LIVE (ATUALIZADO SEM O CARD KIDS) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

                            {/* Card 1: Total do Dia */}
                            <div className="col-span-2 lg:col-span-1 p-5 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-center border h-28 md:h-40 shadow-lg" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', borderColor: 'transparent' }}>
                                <div className="absolute right-[-10px] top-[-10px] opacity-20 text-white"><Crown size={80} /></div>
                                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={10} /> Público Hoje</span>
                                <span className="text-4xl md:text-7xl font-black text-white leading-none">{todayTotal}</span>
                                <span className="text-[9px] text-white/60 font-medium mt-1">*Só Recepção</span>
                            </div>

                            {/* Card 2: Acumulado */}
                            <div className="col-span-1 p-4 rounded-[1.5rem] border flex flex-col justify-between h-28 md:h-40" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1"><CalendarDays size={10} /> Total</span>
                                <div><span className="text-2xl md:text-5xl font-black block" style={{ color: theme.text }}>{accumulatedTotal}</span><span className="text-[9px] font-bold opacity-50">Geral</span></div>
                                <div className="w-full h-1 bg-purple-500/20 rounded-full"><div className="h-full bg-purple-500 rounded-full w-full"></div></div>
                            </div>

                            {/* Card 3: VISITANTES HOJE (Novo, substituiu o Kids) */}
                            <div className="col-span-1 p-4 rounded-[1.5rem] border flex flex-col justify-between h-28 md:h-40" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1"><Smile size={10} /> Visitantes</span>
                                <span className="text-2xl md:text-5xl font-black" style={{ color: theme.text }}>{data?.byType?.VISITOR || 0}</span>
                                <div className="w-full h-1 bg-orange-500/20 rounded-full"><div className="h-full bg-orange-500 rounded-full w-full"></div></div>
                            </div>

                            {/* Card 4: MEMBROS HOJE (Novo, substituiu o Kids) */}
                            <div className="col-span-2 lg:col-span-1 p-4 rounded-[1.5rem] border flex flex-col justify-between h-28 md:h-40" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1"><Briefcase size={10} /> Membros Hoje</span>
                                </div>
                                <span className="text-2xl md:text-5xl font-black" style={{ color: theme.text }}>{data?.byType?.MEMBER || 0}</span>
                                <div className="w-full h-1.5 rounded-full bg-purple-500/20 overflow-hidden"><div className="h-full bg-purple-500" style={{ width: '100%' }}></div></div>
                            </div>
                        </div>

                        {/* GRÁFICOS LIVE */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
                            <div className="lg:col-span-2 p-5 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded-lg bg-purple-500/10"><TrendingUp size={16} className="text-purple-500" /></div><div><h3 className="font-bold text-sm leading-none">Fluxo Global</h3></div></div>
                                {renderHourlyChart()}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                <div className="p-4 rounded-[1.5rem] border flex flex-col items-center justify-center text-center" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="text-[10px] font-bold uppercase opacity-50 mb-1">Gênero</h3>
                                    <div className="h-20 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={genderData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value"><Cell key="male" fill={COLORS.male} stroke="none" /><Cell key="female" fill={COLORS.female} stroke="none" /></Pie></PieChart></ResponsiveContainer></div>
                                    <div className="flex gap-2 justify-center mt-1"><span className="text-[9px] font-bold text-blue-500">{data?.byGender?.M} H</span><span className="text-[9px] font-bold text-pink-500">{data?.byGender?.F} M</span></div>
                                </div>
                                <div className="p-4 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="text-[10px] font-bold uppercase opacity-50 mb-2 text-center">Idade</h3>
                                    <div className="h-20 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageData} layout="vertical" margin={{ left: -20, right: 10 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 9, fill: theme.text, fontWeight: 'bold' }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} /><Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={8}>{ageData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index === 0 ? 'kids' : index === 1 ? 'youth' : 'adult']} />))}</Bar></BarChart></ResponsiveContainer></div>
                                </div>
                            </div>
                        </div>

                        {/* Marketing e Igrejas LIVE */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                            <div className="p-5 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                <div className="flex items-center gap-2 mb-4"><div className="p-1.5 rounded-lg bg-pink-500/10"><Share2 size={16} className="text-pink-500" /></div><h3 className="font-bold text-sm">Origem (Marketing)</h3></div>
                                <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={data?.bySource || []} margin={{ left: -10, right: 10 }}><CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme.gridColor} opacity={0.5} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={90} tick={{ fill: theme.text, fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} /><Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>{(data?.bySource || []).map((_: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} />))}</Bar></BarChart></ResponsiveContainer></div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="p-5 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Top Igrejas</h3>
                                    <div className="space-y-2">{(data?.byChurch || []).slice(0, 3).map((church: any, index: number) => (<div key={index} className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: theme.cardBorder }}><div className="flex items-center gap-2 overflow-hidden"><span className="text-[10px] font-bold text-gray-500">#{index + 1}</span><span className="font-bold text-xs truncate" style={{ color: theme.text }}>{church.name}</span></div><span className="font-black text-sm" style={{ color: theme.text }}>{church.value}</span></div>))}</div>
                                </div>
                                <div className="flex-1 p-5 rounded-[1.5rem] border overflow-hidden flex flex-col" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}><h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Raio-X</h3><div className="flex-1 overflow-y-auto scrollbar-hide max-h-[300px]">{renderCheckpointsDetails()}</div></div>
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