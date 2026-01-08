import { useEffect, useState } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, ArrowLeft, RefreshCw, Baby, Crown, Download, MapPin, Zap, TrendingUp, Briefcase, Smile, Share2,
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

export const DashboardEvento = ({ isLightMode }: { isLightMode: boolean }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const today = new Date().getDate().toString();
    const [selectedDay, setSelectedDay] = useState(today);

    const eventDays = ['13', '14', '15', '16', '17'];
    const daysToShow = eventDays.includes(today) ? eventDays : [today, ...eventDays];

    // --- TEMA ---
    const theme = isLightMode ? {
        bg: '#F3F4F6', text: '#1F2937', subText: '#4B5563', cardBg: '#FFFFFF', cardBorder: '#E5E7EB',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', tooltipBg: '#FFFFFF', tooltipText: '#1F2937',
        gridColor: '#E5E7EB'
    } : {
        bg: '#0F0014', text: '#FFFFFF', subText: '#D1D5DB', cardBg: '#1A0524', cardBorder: '#2D0A3D',
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
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '10px'
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

    const getPeakHour = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) return { hour: '--', val: 0 };
        const dayData = data.timeline[selectedDay];
        const sorted = Object.entries(dayData).sort((a: [string, any], b: [string, any]) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
        if (sorted.length === 0) return { hour: '--', val: 0 };
        return { hour: `${sorted[0][0]}h`, val: Number(sorted[0][1]) || 0 };
    };

    const peakData = getPeakHour();

    // --- RENDERIZADORES ---

    const renderHourlyChart = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) {
            return <div className="h-64 flex items-center justify-center opacity-50">Sem dados para este dia.</div>;
        }
        const dayData = data.timeline[selectedDay];
        const chartData = Object.keys(dayData)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(hour => ({ name: `${hour}h`, value: dayData[hour] }));

        return (
            <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    {/* Aumentei a margem esquerda para garantir que os números não cortem */}
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridColor} opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 12, fontWeight: 500 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 12 }} width={30} />
                        <Tooltip contentStyle={CustomTooltipStyle} />
                        <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderCheckpointsDetails = () => {
        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) return <p className="text-center opacity-50 py-4">Sem dados.</p>;
        const locais = Object.entries(data.checkpointsData[selectedDay]);
        if (locais.length === 0) return <p className="text-center opacity-50 py-4">Nenhum registro.</p>;

        return (
            <div className="flex flex-col gap-3">
                {locais.map(([nome, stats]: any) => (
                    <div key={nome} className="p-4 rounded-xl border transition-all hover:translate-x-1" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2 truncate text-purple-500">
                                <MapPin size={16} /> {nome}
                            </h4>
                            <span className="text-2xl font-black" style={{ color: theme.text }}>{stats.total}</span>
                        </div>

                        <div className="w-full h-3 rounded-full bg-gray-500/10 overflow-hidden flex">
                            <div style={{ width: `${(stats.type?.VISITOR / stats.total) * 100 || 0}%`, background: COLORS.visitor }}></div>
                            <div style={{ width: `${(stats.type?.MEMBER / stats.total) * 100 || 0}%`, background: COLORS.member }}></div>
                        </div>

                        <div className="flex justify-between text-xs font-bold uppercase mt-2 opacity-70" style={{ color: theme.text }}>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Visitantes: {stats.type?.VISITOR || 0}</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Membros: {stats.type?.MEMBER || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading || !data) return <div className="fixed inset-0 flex items-center justify-center font-bold z-50" style={{ backgroundColor: theme.bg, color: theme.text }}><RefreshCw className="animate-spin mb-4 text-purple-500" size={32} /><span className="ml-2 text-lg">Carregando Dashboard...</span></div>;

    // Dados
    const genderData = [{ name: 'Homens', value: data?.byGender?.M || 0 }, { name: 'Mulheres', value: data?.byGender?.F || 0 }];
    const ageData = [
        { name: 'Crianças', value: data?.byAge?.CRIANCA || 0, fill: COLORS.kids },
        { name: 'Jovens', value: data?.byAge?.JOVEM || 0, fill: COLORS.youth },
        { name: 'Adultos', value: data?.byAge?.ADULTO || 0, fill: COLORS.adult },
    ];
    const handleExport = () => window.open(`${API_URL}/export`, '_blank');

    // Layout Classes
    const containerClasses = "w-full min-h-screen relative";
    const stickyHeaderClasses = "sticky top-[60px] md:top-[70px] z-30 px-4 py-4 md:px-8 mt-[-1rem]";

    return (
        <div className={`${containerClasses} font-sans transition-colors duration-500 pb-20 scrollbar-hide`} style={{ backgroundColor: theme.bg, color: theme.text }}>

            {/* --- HEADER --- */}
            <div className={`${stickyHeaderClasses} backdrop-blur-xl border-b border-gray-500/5 shadow-sm transition-all`} style={{ backgroundColor: isLightMode ? 'rgba(243, 244, 246, 0.90)' : 'rgba(15, 0, 20, 0.90)' }}>
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/ekklesia" className="p-2.5 rounded-xl border active:scale-95 transition-all hover:bg-white/10" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}><ArrowLeft size={20} style={{ color: theme.text }} /></Link>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none uppercase">Dashboard</h1>
                                <p className="text-xs font-bold mt-1 opacity-60 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Dados Ao Vivo</p>
                            </div>
                        </div>
                    </div>

                    {/* Day Selector */}
                    <div className="w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
                        <div className="flex gap-2 min-w-max">
                            <div className="flex bg-gray-500/5 p-1.5 rounded-xl border" style={{ borderColor: theme.cardBorder }}>
                                {daysToShow.map(day => (
                                    <button key={day} onClick={() => setSelectedDay(day)} className={`px-5 py-2 rounded-lg text-xs md:text-sm font-black transition-all ${selectedDay === day ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:bg-white/10'}`}>{day === today ? 'HOJE' : `DIA ${day}`}</button>
                                ))}
                            </div>
                            <button onClick={handleExport} className="hidden md:flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-green-600/20"><Download size={18} /><span>Excel</span></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8">

                {/* --- 1. BIG NUMBERS (KPIs) --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="col-span-2 lg:col-span-1 p-6 rounded-[2rem] relative overflow-hidden flex flex-col justify-center border h-32 md:h-40 shadow-lg" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', borderColor: 'transparent' }}>
                        <div className="absolute right-[-15px] top-[-15px] opacity-20 text-white"><Crown size={100} /></div>
                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Público Total</span>
                        <span className="text-5xl md:text-7xl font-black text-white">{data?.total || 0}</span>
                    </div>

                    {/* Pico */}
                    <div className="col-span-1 p-5 rounded-[2rem] border flex flex-col justify-between relative overflow-hidden h-32 md:h-40" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start"><span className="text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1"><Zap size={14} /> Pico</span></div>
                        <div>
                            <span className="text-3xl md:text-5xl font-black block" style={{ color: theme.text }}>{peakData.hour}</span>
                            <span className="text-xs font-bold opacity-50 block mt-1">{peakData.val} pessoas</span>
                        </div>
                        <div className="w-full h-1.5 bg-yellow-500/20 rounded-full mt-2"><div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div></div>
                    </div>

                    {/* Kids */}
                    <div className="col-span-1 p-5 rounded-[2rem] border flex flex-col justify-between h-32 md:h-40" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex justify-between items-start"><span className="text-xs font-bold uppercase tracking-wider text-green-500 flex items-center gap-1"><Baby size={14} /> Kids</span></div>
                        <span className="text-3xl md:text-5xl font-black" style={{ color: theme.text }}>{data?.byAge?.CRIANCA || 0}</span>
                        <div className="w-full h-1.5 bg-green-500/20 rounded-full mt-2"><div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div></div>
                    </div>

                    {/* Comparativo */}
                    <div className="col-span-2 lg:col-span-1 p-5 rounded-[2rem] border flex flex-col justify-center gap-4 h-32 md:h-40" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div>
                            <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-orange-500 uppercase">Visitantes</span><span className="text-sm font-black">{data?.byType?.VISITOR || 0}</span></div>
                            <div className="w-full h-2 rounded-full bg-gray-200/20 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${(data?.byType?.VISITOR / (data?.total || 1)) * 100}%` }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-purple-500 uppercase">Membros</span><span className="text-sm font-black">{data?.byType?.MEMBER || 0}</span></div>
                            <div className="w-full h-2 rounded-full bg-gray-200/20 overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${(data?.byType?.MEMBER / (data?.total || 1)) * 100}%` }}></div></div>
                        </div>
                    </div>
                </div>

                {/* --- 2. GRÁFICOS DE FLUXO & PERFIL --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Fluxo */}
                    <div className="lg:col-span-2 p-6 rounded-[2rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-purple-500/10"><TrendingUp size={20} className="text-purple-500" /></div>
                            <div><h3 className="font-bold text-lg leading-none">Fluxo Global</h3><p className="text-xs opacity-50 font-bold mt-1">Entrada de pessoas por horário</p></div>
                        </div>
                        {renderHourlyChart()}
                    </div>

                    {/* Demografia (Gênero e Idade) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 p-5 rounded-[2rem] border flex items-center justify-between relative overflow-hidden" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                            <div className="z-10">
                                <h3 className="text-xs font-bold uppercase opacity-50 mb-1 flex items-center gap-1"><Users size={12} /> Gênero</h3>
                                <div className="flex flex-col gap-1">
                                    <span className="text-lg font-bold text-blue-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {data?.byGender?.M || 0} Homens</span>
                                    <span className="text-lg font-bold text-pink-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pink-500"></span> {data?.byGender?.F || 0} Mulheres</span>
                                </div>
                            </div>
                            <div className="h-24 w-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} paddingAngle={5} dataKey="value">
                                            <Cell key="male" fill={COLORS.male} stroke="none" />
                                            <Cell key="female" fill={COLORS.female} stroke="none" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="flex-1 p-5 rounded-[2rem] border flex flex-col justify-center" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                            <h3 className="text-xs font-bold uppercase opacity-50 mb-3 flex items-center gap-1"><Smile size={12} /> Faixa Etária</h3>
                            <div className="h-24 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {/* CORREÇÃO DO RECORTE (Age Data): Aumentei o width do YAxis de 60 para 70 e adicionei margin */}
                                    <BarChart data={ageData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: theme.text, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                            {ageData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index === 0 ? 'kids' : index === 1 ? 'youth' : 'adult']} />))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. MARKETING E IGREJAS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* MARKETING GIGANTE */}
                    <div className="p-6 rounded-[2rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-pink-500/10"><Share2 size={20} className="text-pink-500" /></div>
                            <div>
                                <h3 className="font-bold text-lg leading-none">Origem (Marketing)</h3>
                                <p className="text-xs opacity-50 font-bold mt-1">Como os visitantes conheceram?</p>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {/* CORREÇÃO DO RECORTE (Marketing): Aumentei o width do YAxis para 140 para caber nomes longos */}
                                <BarChart layout="vertical" data={data?.bySource || []} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme.gridColor} opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={140} tick={{ fill: theme.text, fontSize: 13, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                                        {(data?.bySource || []).map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            {(data?.bySource || []).length === 0 && <p className="text-center text-sm opacity-50 mt-10">Nenhum dado de marketing registrado.</p>}
                        </div>
                    </div>

                    {/* IGREJAS + RAIO-X (LADO DIREITO) */}
                    <div className="flex flex-col gap-6">
                        <div className="p-6 rounded-[2rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase size={20} className="text-blue-500" /> Top 5 Igrejas</h3>
                            <div className="space-y-3">
                                {(data?.byChurch || []).map((church: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-black/5" style={{ backgroundColor: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.02)', borderColor: theme.cardBorder }}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${index === 0 ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-500/20 text-gray-500'}`}>{index + 1}</span>
                                            <span className="font-bold text-sm truncate" style={{ color: theme.text }}>{church.name}</span>
                                        </div>
                                        <span className="font-black text-lg" style={{ color: theme.text }}>{church.value}</span>
                                    </div>
                                ))}
                                {(data?.byChurch || []).length === 0 && <p className="text-center text-sm opacity-50 py-4">Sem dados.</p>}
                            </div>
                        </div>

                        <div className="flex-1 p-6 rounded-[2rem] border overflow-hidden flex flex-col" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500" /> Raio-X por Local</h3>
                            <div className="flex-1 overflow-y-auto scrollbar-hide max-h-[500px]">
                                {renderCheckpointsDetails()}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};