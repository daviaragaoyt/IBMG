import { useEffect, useState } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, ArrowLeft, RefreshCw, Baby, Crown, Download, Maximize, BarChart3, MapPin, Zap, TrendingUp, Briefcase, Smile
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// --- PALETA DE CORES ---
const COLORS = {
    male: '#3B82F6', female: '#EC4899',
    member: '#8B5CF6', visitor: '#F97316',
    kids: '#10B981', youth: '#FACC15', adult: '#6366F1'
};
const COLORS_MARKETING = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

export const DashboardEvento = ({ isLightMode }: { isLightMode: boolean }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const today = new Date().getDate().toString();
    const [selectedDay, setSelectedDay] = useState(today);

    // Lista de dias do evento
    const eventDays = ['13', '14', '15', '16', '17'];
    const daysToShow = eventDays.includes(today) ? eventDays : [today, ...eventDays];

    // --- TEMA ---
    const theme = isLightMode ? {
        bg: '#F3F4F6', text: '#1F2937', subText: '#6B7280', cardBg: '#FFFFFF', cardBorder: '#E5E7EB',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', tooltipBg: '#FFFFFF', tooltipText: '#1F2937',
        barBg: '#E5E7EB', gridColor: '#E5E7EB'
    } : {
        bg: '#0F0014', text: '#FFFFFF', subText: '#9CA3AF', cardBg: '#1A0524', cardBorder: '#2D0A3D',
        shadow: '0 0 20px rgba(0,0,0,0.5)', tooltipBg: '#1A0524', tooltipText: '#FFFFFF',
        barBg: 'rgba(255,255,255,0.1)', gridColor: '#2D0A3D'
    };

    const CustomTooltipStyle = {
        backgroundColor: theme.tooltipBg,
        borderColor: theme.cardBorder,
        color: theme.tooltipText,
        borderRadius: '12px',
        borderWidth: '1px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '8px 12px'
    };

    // --- FETCH DADOS ---
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

    // --- TELA CHEIA ---
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => console.log(e));
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    // --- CÁLCULO PICO (CORRIGIDO TYPE) ---
    const getPeakHour = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) return { hour: '--', val: 0 };
        const dayData = data.timeline[selectedDay];
        const sorted = Object.entries(dayData).sort((a: [string, any], b: [string, any]) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
        if (sorted.length === 0) return { hour: '--', val: 0 };
        return { hour: `${sorted[0][0]}h`, val: Number(sorted[0][1]) || 0 };
    };

    const peakData = getPeakHour();

    // --- GRÁFICO DE ÁREA ---
    const renderHourlyChart = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) {
            return <div className="h-48 md:h-64 flex flex-col items-center justify-center opacity-50 text-xs md:text-sm">Sem dados para o dia {selectedDay}</div>;
        }

        const dayData = data.timeline[selectedDay];
        const chartData = Object.keys(dayData)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(hour => ({ name: `${hour}h`, value: dayData[hour] }));

        return (
            <div className="h-48 md:h-64 w-full mt-2 md:mt-4 -ml-4 md:ml-0 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.gridColor} opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10 }} interval="preserveStartEnd" minTickGap={20} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.subText, fontSize: 10 }} width={35} />
                        <Tooltip contentStyle={CustomTooltipStyle} />
                        <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // --- CARDS RAIO-X ---
    const renderCheckpointsDetails = () => {
        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) return <p className="text-center opacity-50 py-10 text-xs">Sem dados.</p>;
        const locais = Object.entries(data.checkpointsData[selectedDay]);
        if (locais.length === 0) return <p className="text-center opacity-50 py-10 text-xs">Nenhum registro.</p>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {locais.map(([nome, stats]: any) => (
                    <div key={nome} className="p-4 rounded-2xl border transition-all active:scale-[0.98]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-xs opacity-60 uppercase tracking-wider flex items-center gap-1.5 truncate max-w-[150px] md:max-w-none" style={{ color: theme.subText }}>
                                    <MapPin size={12} /> {nome}
                                </h4>
                                <span className="text-2xl md:text-3xl font-black block mt-0.5" style={{ color: theme.text }}>{stats.total}</span>
                            </div>
                            <div className="p-2 rounded-full bg-gray-100/5"><BarChart3 size={16} className="text-purple-500" /></div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-[9px] md:text-[10px] font-bold uppercase mb-1" style={{ color: theme.subText }}>
                                    <span>Visitantes ({stats.type?.VISITOR || 0})</span>
                                    <span>Membros ({stats.type?.MEMBER || 0})</span>
                                </div>
                                <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200/20">
                                    <div style={{ width: `${(stats.type?.VISITOR / stats.total) * 100 || 0}%`, background: COLORS.visitor }}></div>
                                    <div style={{ width: `${(stats.type?.MEMBER / stats.total) * 100 || 0}%`, background: COLORS.member }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading || !data) return <div className="fixed inset-0 flex items-center justify-center font-bold z-50" style={{ backgroundColor: theme.bg, color: theme.text }}><RefreshCw className="animate-spin mb-4 text-purple-500" size={32} /><span className="ml-2 text-sm">Carregando...</span></div>;

    // Dados auxiliares
    const genderData = [{ name: 'Homens', value: data?.byGender?.M || 0 }, { name: 'Mulheres', value: data?.byGender?.F || 0 }];
    const ageData = [
        { name: 'Kids', value: data?.byAge?.CRIANCA || 0, fill: COLORS.kids },
        { name: 'Jovens', value: data?.byAge?.JOVEM || 0, fill: COLORS.youth },
        { name: 'Adultos', value: data?.byAge?.ADULTO || 0, fill: COLORS.adult },
    ];
    const handleExport = () => window.open(`${API_URL}/export`, '_blank');

    // --- CLASSES DE LAYOUT (A FIX DO PROBLEMA) ---
    // Se FullScreen: Cobre tudo. Se Normal: Relativo e respeita o menu.
    const containerClasses = isFullScreen
        ? "fixed inset-0 w-screen h-screen z-50 overflow-y-auto pt-4"
        : "w-full min-h-screen relative pt-4 md:pt-8";

    // Se Normal: Fica 'sticky' mas deslocado para baixo (top-16 ou top-20) para não ficar atrás do menu.
    const stickyHeaderClasses = isFullScreen
        ? "sticky top-0 z-40 px-4 py-4"
        : "sticky top-[60px] md:top-[70px] z-30 px-4 py-2 mt-[-1rem]";

    return (
        <div className={`${containerClasses} font-sans transition-colors duration-500 pb-20 md:pb-12 scrollbar-hide`} style={{ backgroundColor: theme.bg, color: theme.text }}>

            {/* --- HEADER DASHBOARD --- */}
            <div className={`${stickyHeaderClasses} backdrop-blur-md border-b border-gray-500/5 shadow-sm transition-all`} style={{ backgroundColor: isLightMode ? 'rgba(243, 244, 246, 0.95)' : 'rgba(15, 0, 20, 0.95)' }}>
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-fade-in-down">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <Link to="/ekklesia" className="p-2 rounded-xl border active:scale-95 transition-all" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}><ArrowLeft size={18} style={{ color: theme.text }} /></Link>
                            <div>
                                <h1 className="text-lg md:text-2xl font-black tracking-tight leading-none uppercase">Dashboard</h1>
                                <p className="text-[10px] font-bold mt-0.5 opacity-60 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Ao Vivo</p>
                            </div>
                        </div>
                        <div className="flex gap-2 md:hidden">
                            <button onClick={handleExport} className="p-2 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20 active:scale-95"><Download size={18} /></button>
                            <button onClick={toggleFullScreen} className={`p-2 rounded-lg border active:scale-95 ${isFullScreen ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                <Maximize size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Seletor de Data */}
                    <div className="w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
                        <div className="flex gap-2 min-w-max">
                            <div className="flex bg-gray-500/5 p-1 rounded-xl border" style={{ borderColor: theme.cardBorder }}>
                                {daysToShow.map(day => (
                                    <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${selectedDay === day ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-white/10'}`}>{day === today ? 'HOJE' : `DIA ${day}`}</button>
                                ))}
                            </div>
                            <div className="hidden md:flex gap-2">

                                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-green-500/20"><Download size={16} /><span>Excel</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto">

                {/* SEÇÃO 1: BIG NUMBERS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="col-span-2 lg:col-span-1 p-5 rounded-[1.5rem] relative overflow-hidden flex flex-col justify-center border h-28 md:h-auto" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', borderColor: 'transparent' }}>
                        <div className="absolute right-[-10px] top-[-10px] opacity-20 text-white"><Crown size={80} /></div>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Público Total</span>
                        <span className="text-4xl md:text-6xl font-black text-white">{data?.total || 0}</span>
                    </div>

                    <div className="col-span-1 p-4 md:p-6 rounded-[1.5rem] border flex flex-col justify-between relative overflow-hidden h-28 md:h-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1"><Zap size={10} /> Pico</span>
                        <div>
                            <span className="text-2xl md:text-4xl font-black block" style={{ color: theme.text }}>{peakData.hour}</span>
                            <span className="text-[9px] md:text-xs font-bold opacity-50 block mt-0.5">{peakData.val} pess.</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500/20"><div className="h-full bg-yellow-500" style={{ width: '100%' }}></div></div>
                    </div>

                    <div className="col-span-1 p-4 md:p-6 rounded-[1.5rem] border flex flex-col justify-between h-28 md:h-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-green-500 flex items-center gap-1"><Baby size={12} /> Kids</span>
                        <span className="text-2xl md:text-4xl font-black" style={{ color: theme.text }}>{data?.byAge?.CRIANCA || 0}</span>
                        <div className="w-full h-1.5 rounded-full bg-green-500/20 mt-1"><div className="h-full bg-green-500" style={{ width: '100%' }}></div></div>
                    </div>

                    <div className="col-span-2 p-4 md:p-6 rounded-[1.5rem] border flex flex-col justify-center gap-3 h-auto min-h-[110px]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div>
                            <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-orange-500 uppercase">Visitantes</span><span className="text-xs font-black">{data?.byType?.VISITOR || 0}</span></div>
                            <div className="w-full h-1.5 rounded-full bg-gray-200/20 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${(data?.byType?.VISITOR / (data?.total || 1)) * 100}%` }}></div></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-purple-500 uppercase">Membros</span><span className="text-xs font-black">{data?.byType?.MEMBER || 0}</span></div>
                            <div className="w-full h-1.5 rounded-full bg-gray-200/20 overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${(data?.byType?.MEMBER / (data?.total || 1)) * 100}%` }}></div></div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 2: GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <div className="lg:col-span-2 p-5 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/10"><TrendingUp size={16} className="text-purple-500" /></div>
                            <div><h3 className="font-bold text-sm leading-none">Fluxo Global</h3><p className="text-[10px] opacity-50 font-bold">Atividade por horário</p></div>
                        </div>
                        {renderHourlyChart()}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="p-4 rounded-[1.5rem] border flex flex-col items-center justify-center text-center" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                            <h3 className="text-[10px] font-bold uppercase opacity-50 mb-2 flex items-center justify-center gap-1"><Users size={12} /> Gênero</h3>
                            <div className="h-24 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} paddingAngle={5} dataKey="value">
                                            <Cell key="male" fill={COLORS.male} stroke="none" />
                                            <Cell key="female" fill={COLORS.female} stroke="none" />
                                        </Pie>
                                        <Tooltip contentStyle={CustomTooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex gap-2 justify-center mt-2">
                                <div className="text-[9px] font-bold text-blue-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {data?.byGender?.M || 0}</div>
                                <div className="text-[9px] font-bold text-pink-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> {data?.byGender?.F || 0}</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                            <h3 className="text-[10px] font-bold uppercase opacity-50 mb-2 flex items-center justify-center gap-1"><Smile size={12} /> Idade</h3>
                            <div className="h-24 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ageData} layout="vertical" margin={{ left: -20, right: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 9, fill: theme.text, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
                                            {ageData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 3: ORIGEM & RAIO-X */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
                    <div className="p-5 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><MapPin size={16} className="text-pink-500" /> Origem</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={data?.bySource || []} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme.gridColor} opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: theme.text, fontSize: 9, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                                        {(data?.bySource || []).map((index: number) => (<Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            {(data?.bySource || []).length === 0 && <p className="text-center text-[10px] opacity-50 mt-4">Nenhum dado.</p>}
                        </div>
                    </div>

                    <div className="p-5 rounded-[1.5rem] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Top 5 Igrejas</h3>
                        <div className="space-y-2">
                            {(data?.byChurch || []).map((church: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg border transition-colors" style={{ backgroundColor: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.02)', borderColor: theme.cardBorder }}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${index === 0 ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-500/20 text-gray-500'}`}>{index + 1}</span>
                                        <span className="font-bold text-[10px] truncate" style={{ color: theme.text }}>{church.name}</span>
                                    </div>
                                    <span className="font-black text-xs" style={{ color: theme.text }}>{church.value}</span>
                                </div>
                            ))}
                            {(data?.byChurch || []).length === 0 && <p className="text-center text-[10px] opacity-50 mt-4">Sem dados.</p>}
                        </div>
                    </div>

                    <div className="p-5 rounded-[1.5rem] border overflow-hidden flex flex-col" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Raio-X Rápido</h3>
                        <div className="flex-1 overflow-y-auto scrollbar-hide max-h-[400px]">
                            {renderCheckpointsDetails()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};