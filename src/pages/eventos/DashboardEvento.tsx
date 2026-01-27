import { useEffect, useState, useMemo } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ComposedChart
} from 'recharts';
import {
    Users, RefreshCw, Crown, Zap, TrendingUp, Briefcase, Activity, Baby, Clock, UserCheck, Target, Layers,
    Truck, HeartHandshake, Home, CalendarDays
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// --- CORES & TEMA ---
const COLORS = {
    live: '#EF4444', male: '#3B82F6', female: '#EC4899', kids: '#10B981',
    marketing: '#8B5CF6', visitor: '#F97316', member: '#8B5CF6',
    youth: '#FACC15', adult: '#6366F1',
    evangelism: '#D97706', consolidation: '#059669', reception: '#2563EB',
    mkt: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']
};

// --- AJUSTE DE TEMA (O QUE VOCÊ PEDIU) ---
const getChartTheme = (isLight: boolean) => ({
    // Modo Claro: Preto (#000000) | Modo Escuro: Branco (#FFFFFF)
    text: isLight ? '#000000' : '#FFFFFF',
    grid: isLight ? '#e5e7eb' : '#2D0A3D',
    tooltipBg: isLight ? '#ffffff' : '#1A0524',
    tooltipBorder: isLight ? '#e2e8f0' : '#4c1d95',
    color: isLight ? '#000000' : '#FFFFFF'
});

// --- TYPES ---
interface CheckpointData { total: number; visitor: number; member: number; name?: string; }
interface StatsState {
    totalEntrance: number; kidsTotal: number; visitors: number; members: number;
    gender: { M: number; F: number }; age: { CRIANCA: number; JOVEM: number; ADULTO: number };
    marketing: Record<string, number>; church: Record<string, number>; checkpointsList: CheckpointData[];
    evangelism: { total: number }; consolidation: { total: number; accepted: number; reconciled: number };
}

// --- VISUAL COMPONENTS (Auxiliares) ---
const Card = ({ children, className = "" }: any) => (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-[1.5rem] border shadow-sm transition-all duration-300 bg-white dark:bg-[#1A0524] border-slate-200 dark:border-[#2D0A3D] text-slate-900 dark:text-white ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ icon, title, color = "blue" }: any) => (
    <div className="flex items-center gap-2 mb-4 w-full justify-center opacity-90">
        <div className={`p-1.5 rounded-lg text-${color}-600 bg-${color}-50 dark:bg-white/5 dark:text-${color}-400`}>{icon}</div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-center text-slate-500 dark:text-slate-400">{title}</h3>
    </div>
);

export const DashboardEvento = ({ isLightMode, data }: { isLightMode: boolean, data?: any }) => {
    const [localData, setLocalData] = useState<any>(data || null);
    const [loading, setLoading] = useState(!data);
    const [activeTab, setActiveTab] = useState<'LIVE' | 'DEPTS' | 'PEOPLE' | 'MARKETING'>('LIVE');

    const today = new Date().getDate().toString();
    const [selectedDay, setSelectedDay] = useState(today);

    useEffect(() => {
        if (data) {
            setLocalData(data);
            setLoading(false);
        } else {
            const fetchData = async () => {
                try {
                    const res = await fetch(`${API_URL}/dashboard`);
                    const json = await res.json();
                    setLocalData(json);
                } catch (e) { console.error(e); } finally { setLoading(false); }
            };
            fetchData();
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [data]);

    const daysToShow = useMemo(() => {
        if (!localData?.checkpointsData) return [today];
        const apiDays = Object.keys(localData.checkpointsData);
        return Array.from(new Set([...apiDays, today])).sort((a, b) => parseInt(a) - parseInt(b));
    }, [today, localData]);

    const stats = useMemo<StatsState>(() => {
        const s: StatsState = {
            totalEntrance: 0, kidsTotal: 0, visitors: 0, members: 0,
            gender: { M: 0, F: 0 }, age: { CRIANCA: 0, JOVEM: 0, ADULTO: 0 },
            marketing: {}, church: {}, checkpointsList: [],
            evangelism: { total: 0 }, consolidation: { total: 0, accepted: 0, reconciled: 0 }
        };

        if (!localData?.checkpointsData) return s;

        const cpMap: Record<string, CheckpointData> = {};

        const aggregate = (dataSet: any) => {
            Object.entries(dataSet).forEach(([name, d]: [string, any]) => {
                if (d.total !== undefined) {
                    const nameLower = name.toLowerCase();
                    const isKids = nameLower.includes('kids') || nameLower.includes('criança');
                    const isEntrance = nameLower.includes('entrada') || nameLower.includes('recepção');
                    const isKombi = nameLower.includes('kombi') || nameLower.includes('evangelismo');

                    if (isEntrance) s.totalEntrance += (d.total || 0);
                    if (isKids) s.kidsTotal += (d.total || 0);
                    if (isKombi) s.evangelism.total += (d.total || 0);

                    s.visitors += d.type?.VISITOR || 0;
                    s.members += d.type?.MEMBER || 0;

                    if (d.gender) { s.gender.M += d.gender.M || 0; s.gender.F += d.gender.F || 0; }
                    if (d.age) { s.age.CRIANCA += d.age.CRIANCA || 0; s.age.JOVEM += d.age.JOVEM || 0; s.age.ADULTO += d.age.ADULTO || 0; }

                    const mkt = d.marketing || d.marketingSource;
                    if (mkt) {
                        Object.entries(mkt).forEach(([k, v]) => {
                            s.marketing[k || 'Outros'] = (s.marketing[k || 'Outros'] || 0) + (v as number);
                            const sourceLower = (k || '').toLowerCase();
                            if (sourceLower.includes('aceitou') || sourceLower.includes('decisão')) { s.consolidation.total += (v as number); s.consolidation.accepted += (v as number); }
                            if (sourceLower.includes('reconcilia')) { s.consolidation.total += (v as number); s.consolidation.reconciled += (v as number); }
                        });
                    }

                    const ch = d.church;
                    if (ch) Object.entries(ch).forEach(([k, v]) => s.church[k || 'Sem Igreja'] = (s.church[k || 'Sem Igreja'] || 0) + (v as number));

                    if (!cpMap[name]) cpMap[name] = { total: 0, visitor: 0, member: 0, name: name };
                    cpMap[name].total += d.total || 0;
                    cpMap[name].visitor += d.type?.VISITOR || 0;
                    cpMap[name].member += d.type?.MEMBER || 0;
                } else { aggregate(d); }
            });
        };

        if (localData.checkpointsData[selectedDay]) aggregate(localData.checkpointsData[selectedDay]);

        s.checkpointsList = Object.values(cpMap).sort((a, b) => b.total - a.total);
        if (s.totalEntrance === 0 && (s.visitors + s.members) > 0) s.totalEntrance = s.visitors + s.members;

        return s;
    }, [localData, selectedDay]);

    const chartTheme = getChartTheme(isLightMode);

    const hourlyData = localData?.timeline?.[selectedDay]
        ? Object.keys(localData.timeline[selectedDay])
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(h => ({ name: `${h}h`, value: localData.timeline[selectedDay][h] }))
        : [];

    const peakData = useMemo(() => {
        if (!localData?.timeline?.[selectedDay]) return { hour: '--', val: 0 };
        const entries = Object.entries(localData.timeline[selectedDay]) as [string, number][];
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        return sorted.length ? { hour: `${sorted[0][0]}h`, val: Number(sorted[0][1]) } : { hour: '--', val: 0 };
    }, [localData, selectedDay]);

    const genderData = [{ name: 'Homens', value: stats.gender.M }, { name: 'Mulheres', value: stats.gender.F }];
    const ageData = [{ name: 'Crianças', value: stats.age.CRIANCA, fill: COLORS.kids }, { name: 'Jovens', value: stats.age.JOVEM, fill: '#F59E0B' }, { name: 'Adultos', value: stats.age.ADULTO, fill: COLORS.adult }];
    const accumulatedTotal = stats.totalEntrance;

    const evolutionData = ['14', '15', '16', '17'].map(day => {
        let total = 0; let vis = 0;
        if (localData?.checkpointsData?.[day]) {
            const checkData = localData.checkpointsData[day];
            const aggr = (obj: any) => {
                Object.values(obj).forEach((val: any) => {
                    if (val.total !== undefined) { total += val.total || 0; vis += val.type?.VISITOR || 0; } else { aggr(val); }
                })
            };
            aggr(checkData);
        }
        return { name: `Dia ${day}`, total, visitantes: vis };
    });

    if (loading || !localData) return <div className="flex items-center justify-center p-10"><RefreshCw className="animate-spin text-purple-600" size={32} /></div>;

    return (
        <div className={`w-full ${!isLightMode ? 'dark' : ''}`}>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="w-full py-4 animate-fade-in">

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full xl:w-auto">
                        <div className="flex p-1 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/5 shrink-0">
                            <button onClick={() => setActiveTab('LIVE')} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'LIVE' ? 'bg-white dark:bg-[#1A0524] text-red-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}><Activity size={14} /> Geral</button>
                            <button onClick={() => setActiveTab('DEPTS')} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'DEPTS' ? 'bg-white dark:bg-[#1A0524] text-green-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}><Briefcase size={14} /> Ministérios</button>
                            <button onClick={() => setActiveTab('PEOPLE')} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'PEOPLE' ? 'bg-white dark:bg-[#1A0524] text-blue-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}><Users size={14} /> Perfil</button>
                            <button onClick={() => setActiveTab('MARKETING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'MARKETING' ? 'bg-white dark:bg-[#1A0524] text-purple-600 shadow-sm' : 'opacity-60 hover:opacity-100'}`}><Target size={14} /> Marketing</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 no-scrollbar overflow-x-auto max-w-full">
                        <span className="text-[10px] font-black uppercase opacity-40 flex items-center gap-1 pl-1 text-white">
                            <CalendarDays size={12} /> DIAS
                        </span>
                        <div className="h-6 w-[1px] bg-white/10"></div>
                        <div className="flex gap-2">
                            {daysToShow.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center ${selectedDay === day ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-110' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === ABA: AO VIVO (GERAL) === */}
                {activeTab === 'LIVE' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <div className="col-span-1 p-8 rounded-[1.5rem] relative overflow-hidden flex flex-col items-center justify-center text-center shadow-xl bg-gradient-to-br from-red-600 to-orange-600 text-white border border-transparent h-64">
                                <div className="absolute top-[-20%] right-[-20%] opacity-20"><Crown size={180} /></div>
                                <span className="text-xs font-bold uppercase tracking-widest mb-2 opacity-90 flex items-center gap-2"><Users size={14} /> Total Dia {selectedDay}</span>
                                <span className="text-8xl font-black leading-none drop-shadow-md">{stats.totalEntrance}</span>
                                <div className="mt-4 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-sm border border-white/20">Check-ins</div>
                            </div>

                            <Card className="h-64"><CardTitle icon={<Baby size={18} />} title="Kids" color="green" /><span className="text-7xl font-black mb-2">{stats.kidsTotal}</span><div className="w-24 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-full animate-pulse"></div></div></Card>
                            <Card className="h-64"><CardTitle icon={<Clock size={18} />} title="Pico" color="orange" /><span className="text-6xl font-black">{peakData.hour}</span><span className="text-sm font-bold text-orange-500 mt-2 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full border border-orange-100 dark:border-transparent">{String(peakData.val)} p/h</span></Card>
                            <Card className="h-64 justify-around py-8">
                                <div className="w-full px-4"><div className="flex justify-between mb-1"><span className="text-xs font-bold opacity-60">VISITANTES</span><span className="font-black text-orange-500">{stats.visitors}</span></div><div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${(stats.visitors / (stats.totalEntrance || 1)) * 100}%` }}></div></div></div>
                                <div className="w-full px-4"><div className="flex justify-between mb-1"><span className="text-xs font-bold opacity-60">MEMBROS</span><span className="font-black text-purple-500">{stats.members}</span></div><div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stats.members / (stats.totalEntrance || 1)) * 100}%` }}></div></div></div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <Card className="xl:col-span-8 h-[500px] !items-stretch !p-8">
                                <div className="flex items-center gap-3 mb-6"><Activity className="text-red-500" /><h3 className="font-bold text-lg">Fluxo em Tempo Real</h3></div>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hourlyData}>
                                            <defs><linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.live} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.live} stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                            {/* EIXO X COM NEGRITO */}
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: '900', fill: chartTheme.text }} dy={10} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${chartTheme.tooltipBorder}`, backgroundColor: chartTheme.tooltipBg, color: chartTheme.color }} />
                                            <Area type="monotone" dataKey="value" stroke={COLORS.live} strokeWidth={4} fill="url(#colorLive)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="xl:col-span-4 h-[500px] !justify-start !items-stretch !p-0 overflow-hidden bg-slate-50 dark:bg-[#0F0014] border-0">
                                <div className="p-6 bg-white dark:bg-[#1A0524] border-b border-slate-200 dark:border-[#2D0A3D] flex items-center gap-2 rounded-t-[1.5rem]"><Zap className="text-yellow-500" size={18} /><span className="font-bold text-sm">RAIO-X DETALHADO</span></div>
                                <div className="overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-[#0F0014] h-full rounded-b-[1.5rem] no-scrollbar">
                                    {stats.checkpointsList.map((cp: CheckpointData) => (
                                        <div key={cp.name} className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
                                            <div><span className="block text-xs font-bold opacity-60 uppercase">{cp.name}</span><span className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded mt-1 inline-block text-slate-500 dark:text-slate-300">{cp.visitor || 0} Visitantes</span></div>
                                            <span className="text-2xl font-black">{cp.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* === ABA: MINISTÉRIOS === */}
                {activeTab === 'DEPTS' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <Card className="h-64 border-l-4 !border-l-orange-500"><CardTitle icon={<Truck size={20} />} title="Evangelismo (Kombi)" color="orange" /><span className="text-6xl font-black text-orange-500">{stats.evangelism.total}</span><span className="text-xs font-bold opacity-60 mt-2">Vidas Alcançadas na Rua</span></Card>
                            <Card className="h-64 border-l-4 !border-l-emerald-500"><CardTitle icon={<HeartHandshake size={20} />} title="Consolidação" color="emerald" /><div className="flex items-end gap-2"><span className="text-6xl font-black text-emerald-600">{stats.consolidation.total}</span><span className="text-sm font-bold text-emerald-600/60 mb-2">Decisões</span></div><div className="flex gap-2 mt-4 w-full px-4"><div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded p-2 text-center"><span className="block text-xl font-bold text-emerald-600">{stats.consolidation.accepted}</span><span className="text-[10px] uppercase font-bold opacity-50">Aceitou</span></div><div className="flex-1 bg-yellow-50 dark:bg-yellow-900/20 rounded p-2 text-center"><span className="block text-xl font-bold text-yellow-600">{stats.consolidation.reconciled}</span><span className="text-[10px] uppercase font-bold opacity-50">Reconc.</span></div></div></Card>
                            <Card className="h-64 border-l-4 !border-l-green-500"><CardTitle icon={<Baby size={20} />} title="Ministério Kids" color="green" /><span className="text-6xl font-black text-green-500">{stats.kidsTotal}</span><span className="text-xs font-bold opacity-60 mt-2">Crianças Cuidadas</span></Card>
                            <Card className="h-64 border-l-4 !border-l-blue-500"><CardTitle icon={<Home size={20} />} title="Recepção / Hall" color="blue" /><span className="text-6xl font-black text-blue-500">{stats.totalEntrance}</span><div className="w-full mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(stats.visitors / stats.totalEntrance) * 100}%` }}></div></div><span className="text-[10px] font-bold mt-1 text-blue-400 block text-center">{stats.visitors} Visitantes Novos</span></Card>
                        </div>
                    </div>
                )}

                {/* === ABA: PERFIL (Demografia) === */}
                {activeTab === 'PEOPLE' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="h-[400px]">
                                <CardTitle icon={<Users size={18} />} title={`Gênero (Dia ${selectedDay})`} color="blue" />
                                <div className="h-60 w-full relative">
                                    <ResponsiveContainer><PieChart><Pie data={genderData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none"><Cell fill={COLORS.male} /><Cell fill={COLORS.female} /></Pie><Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${chartTheme.tooltipBorder}`, backgroundColor: chartTheme.tooltipBg, color: chartTheme.color }} /></PieChart></ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-4xl font-black">{stats.gender.M + stats.gender.F}</span><span className="text-xs font-bold opacity-50">TOTAL</span></div>
                                </div>
                            </Card>
                            <Card className="h-[400px]">
                                <CardTitle icon={<UserCheck size={18} />} title={`Idade (Dia ${selectedDay})`} color="indigo" />
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ageData} layout="vertical">
                                        <XAxis type="number" hide />
                                        {/* EIXO Y COM NEGRITO */}
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fill: chartTheme.text, fontSize: 11, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: `1px solid ${chartTheme.tooltipBorder}`, backgroundColor: chartTheme.tooltipBg, color: chartTheme.color }} />
                                        <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0] as any}>{ageData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>
                )}

                {/* === ABA: MARKETING === */}
                {activeTab === 'MARKETING' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-1 p-8 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl flex flex-col items-center justify-center text-center h-80 relative overflow-hidden"><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div><Target size={48} className="mb-4 opacity-50" /><span className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Alcance do Dia {selectedDay}</span><span className="text-7xl font-black tracking-tighter mb-4 drop-shadow-lg">{accumulatedTotal}</span><div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"><TrendingUp size={16} /> <span className="text-xs font-bold">Pessoas Impactadas</span></div></div>
                            <Card className="xl:col-span-2 h-80 !items-stretch !p-8">
                                <div className="flex items-center gap-3 mb-4"><Layers className="text-purple-500" /><h3 className="font-bold text-lg">Evolução Geral (Todo o Evento)</h3></div>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={evolutionData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                                            {/* EIXO X COM NEGRITO */}
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: '900', fill: chartTheme.text }} dy={10} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${chartTheme.tooltipBorder}`, backgroundColor: chartTheme.tooltipBg, color: chartTheme.color }} />
                                            <Bar dataKey="total" barSize={50} fill={COLORS.marketing} radius={[8, 8, 0, 0] as any} />
                                            <Line type="monotone" dataKey="visitantes" stroke={COLORS.visitor} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};