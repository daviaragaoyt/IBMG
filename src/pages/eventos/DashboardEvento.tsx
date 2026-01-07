import { useEffect, useState } from 'react';
import {
    Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    UserCheck, UserPlus, ArrowLeft, RefreshCw, Crown, Download, Maximize, BarChart3, Clock, MapPin, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// CORES
const COLORS = {
    male: '#3B82F6', female: '#EC4899',
    member: '#8B5CF6', visitor: '#F97316',
    kids: '#10B981', youth: '#FACC15', adult: '#6366F1'
};
const COLORS_MARKETING = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

export const DashboardEvento = ({ isLightMode }: { isLightMode: boolean }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Detecta o dia de hoje
    const today = new Date().getDate().toString();
    const [selectedDay, setSelectedDay] = useState(today);

    // Lista de dias (HOJE + Dias do Evento)
    const eventDays = ['13', '14', '15', '16', '17'];
    const daysToShow = eventDays.includes(today) ? eventDays : [today, ...eventDays];

    // TEMA
    const theme = isLightMode ? {
        bg: '#F3F4F6', text: '#1F2937', subText: '#6B7280', cardBg: '#FFFFFF', cardBorder: '#E5E7EB',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', tooltipBg: '#FFFFFF', tooltipText: '#1F2937',
        barBg: '#E5E7EB'
    } : {
        bg: '#0F0014', text: '#FFFFFF', subText: '#9CA3AF', cardBg: '#1A0524', cardBorder: '#2D0A3D',
        shadow: '0 0 20px rgba(0,0,0,0.5)', tooltipBg: '#1A0524', tooltipText: '#FFFFFF',
        barBg: 'rgba(255,255,255,0.1)'
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
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    };

    const getPeakHour = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) return { hour: '--', val: 0 };

        const dayData = data.timeline[selectedDay];

        // CORREÇÃO: Forçamos a tipagem dos dados do sort e do retorno
        const sorted = Object.entries(dayData).sort((a: [string, any], b: [string, any]) => {
            return (Number(b[1]) || 0) - (Number(a[1]) || 0);
        });

        if (sorted.length === 0) return { hour: '--', val: 0 };

        // Retornamos garantindo que 'val' é um número
        return {
            hour: `${sorted[0][0]}h`,
            val: Number(sorted[0][1]) || 0
        };
    };

    const peakData = getPeakHour();

    // --- GRÁFICO DE FLUXO (HORÁRIO) ---
    const renderHourlyChart = () => {
        if (!data?.timeline || !data.timeline[selectedDay]) {
            return (
                <div className="h-40 flex flex-col items-center justify-center text-sm font-medium opacity-50" style={{ color: theme.subText }}>
                    <Clock size={32} className="mb-2 opacity-50" />
                    Sem dados para o dia {selectedDay}
                </div>
            );
        }
        const dayData = data.timeline[selectedDay];
        const hours = Object.keys(dayData).sort((a, b) => parseInt(a) - parseInt(b));
        const maxVal = Math.max(...Object.values(dayData) as number[]) || 1;

        return (
            <div className="flex items-end justify-between h-48 gap-2 pt-6 px-2">
                {hours.map(hour => {
                    const val = dayData[hour];
                    const heightPercent = (val / maxVal) * 100;
                    const isPeak = `${hour}h` === peakData.hour; // Destaca a barra do pico

                    return (
                        <div key={hour} className="flex flex-col items-center flex-1 group cursor-pointer relative">
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 pointer-events-none whitespace-nowrap z-10">{val}</div>
                            <div className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 relative shadow-lg"
                                style={{
                                    height: `${heightPercent}%`,
                                    minHeight: '8px',
                                    background: isPeak ? '#FACC15' : 'linear-gradient(to top, #8B5CF6, #3B82F6)', // Amarelo se for pico
                                    boxShadow: isPeak ? '0 0 15px rgba(250, 204, 21, 0.5)' : 'none'
                                }}>
                            </div>
                            <div className={`text-[10px] font-bold mt-2 ${isPeak ? 'text-yellow-500 scale-110' : 'opacity-60'}`} style={{ color: isPeak ? undefined : theme.text }}>{hour}h</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- RAIO-X DETALHADO POR LOCAL ---
    const renderCheckpointsDetails = () => {
        if (!data?.checkpointsData || !data.checkpointsData[selectedDay]) {
            return <p className="text-center opacity-50 py-10">Sem dados de locais para o dia {selectedDay}.</p>;
        }

        const locais = Object.entries(data.checkpointsData[selectedDay]);
        if (locais.length === 0) return <p className="text-center opacity-50 py-10">Nenhum registro encontrado.</p>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locais.map(([nome, stats]: any) => (
                    <div key={nome} className="p-5 rounded-2xl border flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>

                        <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: theme.cardBorder }}>
                            <h4 className="font-bold flex items-center gap-2 text-base" style={{ color: theme.text }}><MapPin size={18} className="text-purple-500" /> {nome}</h4>
                            <span className="font-black text-lg bg-purple-500 text-white px-3 py-1 rounded-lg shadow-lg shadow-purple-500/30">{stats.total}</span>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-1" style={{ color: theme.subText }}><span className="text-purple-500">Membros ({stats.type?.MEMBER || 0})</span><span className="text-orange-500">Visitantes ({stats.type?.VISITOR || 0})</span></div>
                            <div className="flex h-2 rounded-full overflow-hidden w-full" style={{ backgroundColor: theme.barBg }}>
                                <div style={{ width: `${(stats.type?.MEMBER / stats.total) * 100 || 0}%`, background: COLORS.member }}></div>
                                <div style={{ width: `${(stats.type?.VISITOR / stats.total) * 100 || 0}%`, background: COLORS.visitor }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading || !data) return (
        <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center font-bold z-50" style={{ backgroundColor: theme.bg, color: theme.text }}>
            <RefreshCw className="animate-spin mb-4 text-purple-500" size={32} />
            <span className="animate-pulse">Carregando Dashboard...</span>
        </div>
    );

    // const genderData = [
    //     { name: 'Homens', value: data?.byGender?.M || 0 },
    //     { name: 'Mulheres', value: data?.byGender?.F || 0 },
    // ];

    // const ageData = [
    //     { name: 'Crianças', value: data?.byAge?.CRIANCA || 0, fill: COLORS.kids },
    //     { name: 'Jovens', value: data?.byAge?.JOVEM || 0, fill: COLORS.youth },
    //     { name: 'Adultos', value: data?.byAge?.ADULTO || 0, fill: COLORS.adult },
    // ];

    const handleExport = () => window.open(`${API_URL}/export`, '_blank');

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-y-auto p-4 pt-24 md:px-6 md:pb-6 md:pt-32 font-sans transition-colors duration-500 z-50 scrollbar-hide" style={{ backgroundColor: theme.bg, color: theme.text }}>
            <div className="max-w-7xl mx-auto pb-20 md:pb-0">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in-down">
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <Link to="/ekklesia" className="p-2 md:p-3 rounded-full transition-all shrink-0 border" style={{ backgroundColor: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)', borderColor: theme.cardBorder }}><ArrowLeft size={18} style={{ color: theme.text }} /></Link>
                        <div className="flex-1">
                            <h1 className="text-xl md:text-3xl font-black tracking-tight drop-shadow-sm leading-tight">DASHBOARD <span className="text-purple-500 block md:inline">AO VIVO</span></h1>
                            <p className="text-[10px] md:text-xs font-medium flex items-center gap-2 mt-1" style={{ color: theme.subText }}><span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span> Atualizando em tempo real</p>
                        </div>
                        <div className="flex gap-2 md:hidden">
                            <button onClick={toggleFullScreen} className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg"><Maximize size={18} /></button>
                            <button onClick={fetchData} className="p-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg"><RefreshCw size={18} /></button>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button onClick={toggleFullScreen} className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all" title="Modo TV"><Maximize size={20} /></button>
                        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all font-bold text-sm"><Download size={18} /><span>Excel</span></button>
                        <button onClick={fetchData} className="p-3 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all"><RefreshCw size={20} /></button>
                    </div>
                </div>

                {/* KPI CARDS (TOTAIS) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {/* TOTAL GERAL */}
                    <div className="col-span-2 sm:col-span-1 border p-4 md:p-5 rounded-2xl relative overflow-hidden" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="absolute right-0 top-0 p-4 opacity-20 text-purple-500"><Crown size={48} className="md:w-16 md:h-16" /></div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider relative z-10" style={{ color: theme.subText }}>Público Total</span>
                        <span className="text-4xl md:text-5xl font-black relative z-10 mt-1 md:mt-2 block" style={{ color: theme.text }}>{data?.total || 0}</span>
                    </div>

                    {/* HORÁRIO DE PICO (NOVO) */}
                    <div className="border p-4 md:p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start">
                            <span className="text-yellow-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Horário de Pico</span>
                            <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg"><Zap size={14} className="md:w-4 md:h-4 text-yellow-500" /></div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>{peakData.hour}</span>
                            <span className="text-xs font-bold opacity-60">({peakData.val} pessoas)</span>
                        </div>
                        <div className="w-full h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.barBg }}>
                            <div className="h-full bg-yellow-500" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {/* VISITANTES */}
                    <div className="border p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start"><span className="text-orange-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Visitantes</span><div className="p-1.5 md:p-2 bg-orange-500/10 rounded-lg"><UserPlus size={14} className="md:w-4 md:h-4 text-orange-500" /></div></div>
                        <span className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>{data?.byType?.VISITOR || 0}</span>
                        <div className="w-full h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.barBg }}><div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(data?.byType?.VISITOR / data?.total) * 100 || 0}%` }}></div></div>
                    </div>

                    {/* MEMBROS */}
                    <div className="border p-3 md:p-5 rounded-2xl flex flex-col justify-between h-28 md:h-36" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <div className="flex justify-between items-start"><span className="text-purple-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Membros</span><div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg"><UserCheck size={14} className="md:w-4 md:h-4 text-purple-500" /></div></div>
                        <span className="text-3xl md:text-4xl font-black" style={{ color: theme.text }}>{data?.byType?.MEMBER || 0}</span>
                        <div className="w-full h-1 mt-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.barBg }}><div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(data?.byType?.MEMBER / data?.total) * 100 || 0}%` }}></div></div>
                    </div>
                </div>

                {/* GRÁFICO DE FLUXO GLOBAL (ATUALIZADO) */}
                <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] mb-6 md:mb-8" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="font-bold text-sm md:text-base flex items-center gap-2" style={{ color: theme.subText }}>
                            <BarChart3 size={18} className="text-purple-500" /> Fluxo Global de Movimentação (Todos os Pontos)
                        </h3>
                        <div className="flex bg-gray-100/10 p-1 rounded-xl overflow-hidden border" style={{ borderColor: theme.cardBorder }}>
                            {daysToShow.map(day => (
                                <button key={day} onClick={() => setSelectedDay(day)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs font-bold transition-all ${selectedDay === day ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-white/5'}`}>{day === today ? `HOJE (${day})` : `DIA ${day}`}</button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full rounded-2xl p-4 border border-dashed border-gray-500/20" style={{ backgroundColor: isLightMode ? '#F9FAFB' : 'rgba(0,0,0,0.2)' }}>{renderHourlyChart()}</div>
                </div>

                {/* RAIO-X DOS LOCAIS */}
                <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] mb-6 md:mb-8" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                    <h3 className="font-bold text-sm md:text-base flex items-center gap-2 mb-6" style={{ color: theme.subText }}>📍 Raio-X Detalhado por Local (Dia {selectedDay})</h3>
                    {renderCheckpointsDetails()}
                </div>

                {/* IGREJAS E MARKETING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">
                    <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <h3 className="font-bold mb-4 text-sm md:text-base" style={{ color: theme.subText }}>Top 5 Igrejas</h3>
                        <div className="space-y-3 md:space-y-4">
                            {(data?.byChurch || []).map((church: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 md:p-4 rounded-xl border transition-colors" style={{ backgroundColor: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.05)', borderColor: theme.cardBorder }}>
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden"><span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${index === 0 ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-200 text-gray-500'}`} style={index !== 0 ? { backgroundColor: isLightMode ? '#E5E7EB' : '#374151', color: theme.subText } : {}}>{index + 1}</span><span className="font-semibold text-sm md:text-base truncate" style={{ color: theme.text }}>{church.name}</span></div><span className="font-bold text-base md:text-lg shrink-0 pl-2" style={{ color: theme.text }}>{church.value}</span>
                                </div>
                            ))}
                            {(data?.byChurch || []).length === 0 && <p className="text-center py-4 text-sm" style={{ color: theme.subText }}>Sem dados.</p>}
                        </div>
                    </div>
                    <div className="border p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadow }}>
                        <h3 className="font-bold mb-4 text-sm md:text-base" style={{ color: theme.subText }}>📢 Origem (Marketing)</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={data?.bySource || []} margin={{ left: 10, right: 10 }}><CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme.cardBorder} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={90} tick={{ fill: theme.text, fontSize: 11 }} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={CustomTooltipStyle} /><Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={2000}>{(data?.bySource || []).map((index: number) => (<Cell key={`cell-${index}`} fill={COLORS_MARKETING[index % COLORS_MARKETING.length]} />))}</Bar></BarChart></ResponsiveContainer>
                            {(data?.bySource || []).length === 0 && <p className="text-center text-sm mt-8 opacity-50">Sem dados.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};