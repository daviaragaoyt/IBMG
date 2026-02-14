import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, RefreshCw, Crown, Zap, Briefcase, Activity, UserCheck, Target,
    Home, CalendarDays, ArrowLeft
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = {
    live: '#EF4444', male: '#3B82F6', female: '#EC4899', kids: '#10B981',
    marketing: ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
    visitor: '#F97316', member: '#8B5CF6',
    youth: '#FACC15', adult: '#6366F1',
    evangelism: '#D97706', consolidation: '#059669', reception: '#2563EB'
};

// --- TYPES ---
interface CheckpointData {
    total: number;
    visitor: number;
    member: number;
    gender?: { M: number; F: number };
    name?: string;
    salvation?: { total: number; M: number; F: number };
    healing?: { total: number; M: number; F: number };
    deliverance?: { total: number; M: number; F: number };
}
interface StatsState {
    totalEntrance: number; visitors: number; members: number;
    gender: { M: number; F: number }; age: { CRIANCA: number; JOVEM: number; ADULTO: number };
    marketing: Record<string, number>; church: Record<string, number>; checkpointsList: CheckpointData[];
    evangelism: { total: number };
    salvation: { total: number; M: number; F: number; VISITOR: number; MEMBER: number };
    healing: { total: number; M: number; F: number; VISITOR: number; MEMBER: number };
    deliverance: { total: number; M: number; F: number; VISITOR: number; MEMBER: number };
}

export const DashboardEvento = ({ isLightMode, data }: { isLightMode: boolean, data?: any }) => {
    const [localData, setLocalData] = useState<any>(data || null);
    const [loading, setLoading] = useState(!data);
    const [activeTab, setActiveTab] = useState<'LIVE' | 'DEPTS' | 'PESSOAS'>('LIVE');

    const todayFormatted = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const [selectedDay, setSelectedDay] = useState(todayFormatted);

    // --- TEMA DINÂMICO (Corrige o erro do isLightMode não usado) ---
    const theme = {
        bg: isLightMode ? 'bg-gray-50' : 'bg-[#0F0014]',
        text: isLightMode ? 'text-gray-900' : 'text-white',
        cardBg: isLightMode ? 'bg-white' : 'bg-[#1A0524]',
        cardBorder: isLightMode ? 'border-gray-200' : 'border-[#2D0A3D]',
        mutedText: isLightMode ? 'text-gray-500' : 'text-gray-400',
        chartGrid: isLightMode ? '#E5E7EB' : '#2D0A3D',
        chartTooltipBg: isLightMode ? '#FFFFFF' : '#1A0524',
        chartTooltipBorder: isLightMode ? '#E5E7EB' : '#4c1d95',
        chartText: isLightMode ? '#374151' : '#FFFFFF',
        buttonInactive: isLightMode ? 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100' : 'bg-[#15041D] text-gray-400 border-white/10 hover:bg-white/5'
    };

    // --- COMPONENTES VISUAIS INTERNOS (Usam o tema) ---
    const Card = ({ children, className = "" }: any) => (
        <div className={`relative flex flex-col items-center justify-center p-6 rounded-[1.5rem] border shadow-sm transition-all duration-300 ${theme.cardBg} ${theme.cardBorder} ${theme.text} ${className}`}>
            {children}
        </div>
    );

    const CardTitle = ({ icon, title, color = "blue" }: any) => {
        // Ajuste de background do ícone baseado no tema
        const bgIcon = isLightMode ? 'bg-gray-100' : 'bg-white/5';

        const colorClass = {
            blue: 'text-blue-500', green: 'text-green-500', orange: 'text-orange-500',
            purple: 'text-purple-500', indigo: 'text-indigo-500', emerald: 'text-emerald-500'
        }[color as string] || 'text-gray-500';

        return (
            <div className="flex items-center gap-2 mb-4 w-full justify-center opacity-90">
                <div className={`p-1.5 rounded-lg ${bgIcon} ${colorClass}`}>{icon}</div>
                <h3 className={`text-xs font-bold uppercase tracking-wider text-center ${theme.mutedText}`}>{title}</h3>
            </div>
        );
    };

    useEffect(() => {
        if (data) { setLocalData(data); setLoading(false); }
        else {
            const fetchData = async () => {
                try {
                    const res = await fetch(`${API_URL}/dashboard`);
                    const json = await res.json();
                    setLocalData(json);
                    if (json.availableDays && json.availableDays.length > 0) {
                        if (!json.availableDays.includes(todayFormatted)) {
                            setSelectedDay(json.availableDays[0]);
                        }
                    }
                } catch (e) { console.error(e); } finally { setLoading(false); }
            };
            fetchData();
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [data]);

    const daysToShow = localData?.availableDays || [todayFormatted];

    const stats = useMemo<StatsState>(() => {
        const s: StatsState = {
            totalEntrance: 0, visitors: 0, members: 0,
            gender: { M: 0, F: 0 }, age: { CRIANCA: 0, JOVEM: 0, ADULTO: 0 },
            marketing: {}, church: {}, checkpointsList: [],
            evangelism: { total: 0 },
            salvation: { total: 0, M: 0, F: 0, VISITOR: 0, MEMBER: 0 },
            healing: { total: 0, M: 0, F: 0, VISITOR: 0, MEMBER: 0 },
            deliverance: { total: 0, M: 0, F: 0, VISITOR: 0, MEMBER: 0 }
        };

        if (!localData?.checkpointsData || !localData.checkpointsData[selectedDay]) return s;

        const cpMap: Record<string, CheckpointData> = {};

        const aggregate = (dataSet: any) => {
            Object.entries(dataSet).forEach(([name, d]: [string, any]) => {
                if (d.total !== undefined) {
                    const nameLower = name.toLowerCase();
                    const isEntrance = nameLower.includes('entrada') || nameLower.includes('recepção');
                    const isKombi = nameLower.includes('kombi') || nameLower.includes('evangelismo') || nameLower.includes('externo');

                    // SOMA APENAS RECEPÇÃO NO TOTAL GERAL (PEDIDO DO USUÁRIO)
                    if (isEntrance && name !== 'Total') {
                        s.totalEntrance += d.total || 0;
                    }

                    if (isKombi) s.evangelism.total += (d.total || 0);

                    if (name !== 'Total') {
                        s.visitors += d.type?.VISITOR || 0;
                        s.members += d.type?.MEMBER || 0;
                        if (d.gender) { s.gender.M += d.gender.M || 0; s.gender.F += d.gender.F || 0; }
                        if (d.age) { s.age.CRIANCA += d.age.CRIANCA || 0; s.age.JOVEM += d.age.JOVEM || 0; s.age.ADULTO += d.age.ADULTO || 0; }

                        const ch = d.church;
                        if (ch) Object.entries(ch).forEach(([k, v]) => s.church[k || 'Sem Igreja'] = (s.church[k || 'Sem Igreja'] || 0) + (v as number));

                        // Lógica de Desfechos Espirituais
                        if (d.salvation) {
                            s.salvation.total += d.salvation.total || 0;
                            s.salvation.M += d.salvation.M || 0;
                            s.salvation.F += d.salvation.F || 0;
                        }
                        if (d.healing) {
                            s.healing.total += d.healing.total || 0;
                            s.healing.M += d.healing.M || 0;
                            s.healing.F += d.healing.F || 0;
                        }
                        if (d.deliverance) {
                            s.deliverance.total += d.deliverance.total || 0;
                            s.deliverance.M += d.deliverance.M || 0;
                            s.deliverance.F += d.deliverance.F || 0;
                        }
                    }

                    if (name !== 'Total') {
                        if (!cpMap[name]) cpMap[name] = {
                            total: 0, visitor: 0, member: 0,
                            gender: { M: 0, F: 0 },
                            name: name,
                            salvation: { total: 0, M: 0, F: 0 },
                            healing: { total: 0, M: 0, F: 0 },
                            deliverance: { total: 0, M: 0, F: 0 }
                        };
                        cpMap[name].total += d.total || 0;
                        cpMap[name].visitor += d.type?.VISITOR || 0;
                        cpMap[name].member += d.type?.MEMBER || 0;
                        if (d.gender && cpMap[name].gender) {
                            cpMap[name].gender.M += d.gender.M || 0;
                            cpMap[name].gender.F += d.gender.F || 0;
                        }

                        // Agregar dados espirituais por departamento
                        if (d.salvation && cpMap[name].salvation) {
                            cpMap[name].salvation!.total += d.salvation.total || 0;
                            cpMap[name].salvation!.M += d.salvation.M || 0;
                            cpMap[name].salvation!.F += d.salvation.F || 0;
                        }
                        if (d.healing && cpMap[name].healing) {
                            cpMap[name].healing!.total += d.healing.total || 0;
                            cpMap[name].healing!.M += d.healing.M || 0;
                            cpMap[name].healing!.F += d.healing.F || 0;
                        }
                        if (d.deliverance && cpMap[name].deliverance) {
                            cpMap[name].deliverance!.total += d.deliverance.total || 0;
                            cpMap[name].deliverance!.M += d.deliverance.M || 0;
                            cpMap[name].deliverance!.F += d.deliverance.F || 0;
                        }
                    }
                } else { aggregate(d); }
            });
        };

        if (localData.checkpointsData[selectedDay]) aggregate(localData.checkpointsData[selectedDay]);

        // Adicionando LOJA manualmente à lista de checkpoints para exibição
        if (localData?.salesStats?.byCategory?.LOJA) {
            cpMap['Loja'] = {
                total: localData.salesStats.byCategory.LOJA,
                visitor: localData.salesStats.demographics?.VISITOR || 0, // Estimativa baseada no total de vendas
                member: localData.salesStats.demographics?.MEMBER || 0,
                name: 'Loja'
            };
        }

        // --- GARANTIR QUE CASA DOS MÁRTIRES APAREÇA (Zerado se não houver dados) ---
        const hasMartires = Object.keys(cpMap).some(k => k.toLowerCase().includes('martires') || k.toLowerCase().includes('mártires'));

        if (!hasMartires) {
            cpMap['Casa dos Mártires'] = {
                total: 0,
                visitor: 0,
                member: 0,
                gender: { M: 0, F: 0 },
                name: 'Casa dos Mártires'
            };
        }

        s.checkpointsList = Object.values(cpMap).sort((a, b) => b.total - a.total);
        if (s.totalEntrance === 0 && (s.visitors + s.members) > 0) s.totalEntrance = s.visitors + s.members;

        return s;
    }, [localData, selectedDay]);



    const genderData = [{ name: 'Homens', value: stats.gender.M }, { name: 'Mulheres', value: stats.gender.F }];
    const ageData = [{ name: 'Crianças', value: stats.age.CRIANCA, fill: COLORS.kids }, { name: 'Jovens', value: stats.age.JOVEM, fill: '#F59E0B' }, { name: 'Adultos', value: stats.age.ADULTO, fill: COLORS.adult }];

    if (loading || !localData) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}><RefreshCw className="animate-spin text-purple-600" size={32} /></div>;

    return (
        <div className={`w-full min-h-screen ${theme.bg} ${theme.text} overflow-x-hidden transition-colors duration-300`}>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

            <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 animate-fade-in">

                {/* --- HEADER --- */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/ekklesia/admin" className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border ${theme.cardBorder} ${theme.cardBg} hover:opacity-80 transition-all group shrink-0`}>
                            <ArrowLeft size={20} className={`${theme.text} group-hover:-translate-x-1 transition-transform`} />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight truncate">
                                Dashboard <span className="text-[#A855F7]">Eventos</span>
                            </h1>
                            <span className={`text-sm md:text-base font-bold ${theme.mutedText}`}>Total Geral da Conferência: <span className="text-purple-500">{localData?.totalEventEntrance || 0} Pessoas</span></span>
                        </div>

                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 w-full">
                        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
                            <div className={`${isLightMode ? 'bg-gray-200' : 'bg-[#15041D]'} p-1.5 rounded-2xl border ${theme.cardBorder} flex gap-1 min-w-max`}>
                                {[
                                    { id: 'LIVE', label: 'Operacional', icon: Activity, color: 'text-[#F87171]' },
                                    { id: 'PESSOAS', label: 'Perfil', icon: Users, color: 'text-blue-400' },
                                    { id: 'DEPTS', label: 'Ministérios', icon: Briefcase, color: 'text-emerald-400' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? `${isLightMode ? 'bg-white' : 'bg-[#2D0A3D]'} ${tab.color} shadow-sm border ${theme.cardBorder}` : `${theme.mutedText} hover:opacity-100`}`}
                                    >
                                        <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'opacity-70'} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`w-[1px] h-10 ${isLightMode ? 'bg-gray-300' : 'bg-white/10'} hidden lg:block`}></div>

                        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
                            <div className="flex gap-2 min-w-max">
                                {daysToShow.map((day: string) => {
                                    const dayNumber = day.split('/')[0];
                                    const isSelected = selectedDay === day;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all border shrink-0 ${isSelected ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105' : theme.buttonInactive}`}
                                        >
                                            {dayNumber}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTEÚDO --- */}
                {activeTab === 'LIVE' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                            <div className={`col-span-1 p-6 md:p-8 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden h-56 md:h-64 border ${theme.cardBorder}`} style={{ background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)' }}>
                                <Crown size={180} className="absolute -top-10 -right-10 text-white opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest mb-2 opacity-90 flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-white"><CalendarDays size={12} /> Total do Evento</span>
                                <span className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-sm text-white">{localData?.totalEventEntrance || stats.totalEntrance}</span>
                                <div className="mt-4 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Check-ins Acumulados</div>
                            </div>


                            <Card className="h-56 md:h-64 justify-around py-8">
                                <div className="w-full px-6"><div className="flex justify-between mb-2"><span className={`text-xs font-bold ${theme.mutedText}`}>VISITANTES</span><span className="font-black text-orange-500">{stats.visitors}</span></div><div className={`h-2 ${isLightMode ? 'bg-gray-200' : 'bg-white/5'} rounded-full overflow-hidden`}><div className="h-full bg-orange-500 rounded-full" style={{ width: `${(stats.visitors / (stats.totalEntrance || 1)) * 100}%` }}></div></div></div>
                                <div className="w-full px-6"><div className="flex justify-between mb-2"><span className={`text-xs font-bold ${theme.mutedText}`}>MEMBROS</span><span className="font-black text-purple-500">{stats.members}</span></div><div className={`h-2 ${isLightMode ? 'bg-gray-200' : 'bg-white/5'} rounded-full overflow-hidden`}><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stats.members / (stats.totalEntrance || 1)) * 100}%` }}></div></div></div>
                            </Card>
                            {/* REMOVIDO CARD KIDS */}
                            <Card className="h-56 md:h-64"><CardTitle icon={<Target size={18} />} title="Evangelismo" color="yellow" /><span className="text-5xl md:text-7xl font-black text-yellow-500">{stats.evangelism.total}</span><span className="text-xs font-bold text-yellow-500/70 uppercase tracking-widest">Alcançados</span></Card>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <Card className="xl:col-span-4 h-[400px] md:h-[500px] !justify-start !items-stretch !p-0 overflow-hidden">
                                <div className={`p-6 ${isLightMode ? 'bg-gray-50' : 'bg-[#250833]'} border-b ${theme.cardBorder} flex items-center gap-2`}><Zap className="text-yellow-500" size={18} /><span className={`font-bold text-sm ${theme.text}`}>RAIO-X DETALHADO</span></div>
                                <div className="overflow-y-auto p-4 space-y-3 h-full rounded-b-[1.5rem] no-scrollbar">
                                    {stats.checkpointsList.map((cp: CheckpointData) => (
                                        <div key={cp.name} className={`flex justify-between items-center p-4 rounded-xl border ${isLightMode ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/5 border-white/5 hover:bg-white/10'} transition-colors`}>
                                            <div><span className={`block text-xs font-bold ${theme.mutedText} uppercase tracking-wider`}>{cp.name}</span><span className={`text-[10px] ${theme.mutedText} mt-1 block`}>{cp.visitor || 0} Visitantes</span></div>
                                            <span className="text-2xl font-black">{cp.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'DEPTS' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Renderização Dinâmica de Ministérios/Departamentos */}
                            {stats.checkpointsList.map((dept) => {
                                const nameLower = dept.name?.toLowerCase() || '';
                                let icon = Briefcase;
                                let color = "text-gray-500";
                                let borderColor = "border-l-gray-500";

                                // Mapeamento FOCADO e ATUALIZADO
                                if (nameLower.includes('evangelismo') || nameLower.includes('kombi')) {
                                    icon = Target; color = "text-yellow-500"; borderColor = "!border-l-yellow-500";
                                } else if (nameLower.includes('profétic') || nameLower.includes('profetic')) {
                                    icon = Zap; color = "text-purple-500"; borderColor = "!border-l-purple-500";
                                } else if (nameLower.includes('mártires') || nameLower.includes('martires')) {
                                    icon = Crown; color = "text-red-600"; borderColor = "!border-l-red-600";
                                } else if (nameLower.includes('recepção') || nameLower.includes('entrada')) {
                                    icon = Home; color = "text-blue-500"; borderColor = "!border-l-blue-500";
                                } else if (nameLower.includes('loja')) {
                                    icon = Briefcase; color = "text-emerald-500"; borderColor = "!border-l-emerald-500";
                                }

                                const Icon = icon;

                                return (
                                    <Card key={dept.name} className={`h-64 border-l-4 ${borderColor}`}>
                                        <CardTitle icon={<Icon size={20} />} title={dept.name?.replace(/sala profética|sala profetica/gi, 'Tenda Profética') || 'Local Indefinido'} color={color.replace('text-', '').replace('-500', '').replace('-600', '')} />
                                        <div className="flex items-end gap-2">
                                            <span className={`text-6xl font-black ${color}`}>{dept.total}</span>
                                            {nameLower.includes('loja') ? <span className="text-xs font-bold text-gray-500 mb-2">Vendas/Items</span> : <span className="text-xs font-bold text-gray-500 mb-2">Pessoas</span>}
                                        </div>

                                        <div className="flex gap-2 mt-4 w-full px-4 text-center justify-center">
                                            <div className="flex flex-col">
                                                <span className={`text-xl font-bold ${color}`}>{dept.visitor}</span>
                                                <span className={`text-[10px] uppercase font-bold opacity-50 ${theme.mutedText}`}>Visitantes</span>
                                            </div>
                                            <div className="w-[1px] bg-gray-300 dark:bg-white/10 mx-2"></div>
                                            <div className="flex flex-col">
                                                <span className={`text-xl font-bold ${color}`}>{dept.member}</span>
                                                <span className={`text-[10px] uppercase font-bold opacity-50 ${theme.mutedText}`}>Membros</span>
                                            </div>
                                        </div>

                                        {/* EXIBIÇÃO DE GÊNERO (Novidade - Corrigido para Números Absolutos) */}
                                        {(dept.gender && (dept.gender.M > 0 || dept.gender.F > 0 || dept.total === 0)) && (
                                            <div className="flex gap-2 mt-2 w-full px-4 text-center justify-center opacity-80">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold ${color}`}>{dept.gender.M}</span>
                                                    <span className={`text-[9px] uppercase font-bold opacity-50 ${theme.mutedText}`}>Homens</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold ${color}`}>{dept.gender.F}</span>
                                                    <span className={`text-[9px] uppercase font-bold opacity-50 ${theme.mutedText}`}>Mulheres</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* EXIBIÇÃO DE DADOS ESPIRITUAIS - CRUZAMENTO */}
                                        {(nameLower.includes('evangelismo') || nameLower.includes('kombi') || nameLower.includes('profétic') || nameLower.includes('profetic')) && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 w-full px-2">
                                                <div className="grid grid-cols-3 gap-1 text-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-emerald-500 font-black text-lg">{dept.salvation?.total || 0}</span>
                                                        <span className="text-[8px] uppercase font-bold opacity-60">Salvação</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-red-500 font-black text-lg">{dept.healing?.total || 0}</span>
                                                        <span className="text-[8px] uppercase font-bold opacity-60">Cura</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-orange-500 font-black text-lg">{dept.deliverance?.total || 0}</span>
                                                        <span className="text-[8px] uppercase font-bold opacity-60">Oração / Libertação</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'PESSOAS' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="h-[400px]">
                                <CardTitle icon={<Users size={18} />} title="Gênero" color="blue" />
                                <div className="h-60 w-full relative">
                                    <ResponsiveContainer><PieChart><Pie data={genderData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none"><Cell fill={COLORS.male} /><Cell fill={COLORS.female} /></Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: theme.chartTooltipBg, color: theme.chartText }} /></PieChart></ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-4xl font-black">{stats.gender.M + stats.gender.F}</span><span className={`text-xs font-bold opacity-50 ${theme.mutedText}`}>TOTAL</span></div>
                                </div>
                            </Card>
                            <Card className="h-[400px]">
                                <CardTitle icon={<UserCheck size={18} />} title="Faixa Etária" color="indigo" />
                                <ResponsiveContainer width="100%" height="100%"><BarChart data={ageData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={80} tick={{ fill: theme.chartText, fontSize: 11, fontWeight: '700' }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: theme.chartTooltipBg, color: theme.chartText }} /><Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0] as any}>{ageData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer>
                            </Card>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};