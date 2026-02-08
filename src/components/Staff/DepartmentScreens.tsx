import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { api } from '../../services/api';
import { ScreenLayout, MeetingCounter, formatPhone } from './StaffShared';
import { MapPin, Plus, Users, Baby, Zap, Flame, Heart, Cross, HandMetal, HeartHandshake, RefreshCw } from 'lucide-react';

export const ReceptionScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const [mode, setMode] = useState<'BUTTONS' | 'SCAN'>('BUTTONS');
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');
    return (
        <ScreenLayout user={user} title="Recepção" icon={<MapPin />} accentColor="#3B82F6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <MeetingCounter theme={theme} />
            <div className="p-6 pt-2 flex flex-col h-full">
                <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10 shrink-0">
                    <button onClick={() => setMode('BUTTONS')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'BUTTONS' ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}>CONTADOR</button>
                    <button onClick={() => setMode('SCAN')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${mode === 'SCAN' ? 'bg-blue-600 text-white shadow' : 'text-gray-400'}`}>SCANNER</button>
                </div>
                {mode === 'BUTTONS' ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                            <button onClick={() => setPersonType('VISITOR')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'VISITOR' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'border-gray-600/30 bg-transparent opacity-60'}`}><Plus size={18} /> VISITANTE</button>
                            <button onClick={() => setPersonType('MEMBER')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'MEMBER' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-600/30 bg-transparent opacity-60'}`}><Users size={18} /> MEMBRO</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'ADULTO', type: personType }, '+1 Homem')} className="bg-blue-600 h-28 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-blue-800"><span className="text-4xl mb-1">👨</span><span className="font-black text-xs">HOMEM</span></button>
                            <button onClick={() => handleCount({ gender: 'F', ageGroup: 'ADULTO', type: personType }, '+1 Mulher')} className="bg-pink-600 h-28 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-pink-800"><span className="text-4xl mb-1">👩</span><span className="font-black text-xs">MULHER</span></button>
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'JOVEM', type: personType }, '+1 Jovem')} className="bg-yellow-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-yellow-800"><span className="text-3xl mb-1">🧑‍🎤</span><span className="font-black text-xs">JOVEM</span></button>
                            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA', type: personType }, '+1 Criança')} className="bg-green-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-green-800"><span className="text-3xl mb-1">👶</span><span className="font-black text-xs">CRIANÇA</span></button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full pb-10">
                        <div className="w-full max-w-[280px] aspect-square rounded-[2rem] overflow-hidden bg-black border-4 border-blue-500 relative shadow-2xl shadow-blue-500/30 mx-auto">
                            <Scanner onScan={(d) => d[0]?.rawValue && console.log(d[0].rawValue)} />
                        </div>
                    </div>
                )}
            </div>
        </ScreenLayout>
    );
};

export const KidsScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => (
    <ScreenLayout user={user} title="Ministério Kids" icon={<Baby />} accentColor="#10B981" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
        <div className="p-6 flex flex-col gap-4 justify-center h-full pb-20">
            <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA', type: 'VISITOR' }, '+1 Menino')} className="bg-blue-500 flex-1 rounded-[2rem] text-white shadow-xl border-b-8 border-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center max-h-48"><span className="text-6xl mb-2">👦</span><span className="font-black text-2xl tracking-widest">MENINO</span></button>
            <button onClick={() => handleCount({ gender: 'F', ageGroup: 'CRIANCA', type: 'VISITOR' }, '+1 Menina')} className="bg-pink-500 flex-1 rounded-[2rem] text-white shadow-xl border-b-8 border-pink-700 active:scale-95 transition-all flex flex-col items-center justify-center max-h-48"><span className="text-6xl mb-2">👧</span><span className="font-black text-2xl tracking-widest">MENINA</span></button>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <button onClick={() => handleCount({ ageGroup: 'ADULTO', type: 'MEMBER' }, '+1 Voluntário')} className="bg-purple-600 py-4 rounded-xl text-white font-bold shadow border-b-4 border-purple-800 active:scale-95">Tio/Tia (Voluntário)</button>
                <button onClick={() => handleCount({ ageGroup: 'CRIANCA', type: 'VISITOR', marketingSource: 'VISITANTE_KIDS' }, '+1 Visitante')} className="bg-orange-500 py-4 rounded-xl text-white font-bold shadow border-b-4 border-orange-700 active:scale-95">Visitante Novo</button>
            </div>
        </div>
    </ScreenLayout>
);

export const EvangelismScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const commonProps = { gender: 'M', type: 'VISITOR', marketingSource: 'Ação Externa' };
    const [outcomes, setOutcomes] = useState({ isSalvation: false, isHealing: false, isDeliverance: false });

    const toggle = (key: keyof typeof outcomes) => setOutcomes(prev => ({ ...prev, [key]: !prev[key] }));

    const submit = (payload: any, label: string) => {
        handleCount({ ...payload, ...outcomes }, label);
        setOutcomes({ isSalvation: false, isHealing: false, isDeliverance: false }); // Reset after count
    };

    return (
        <ScreenLayout user={user} title="Evangelismo" icon={<Zap />} accentColor="#F97316" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => submit({ ...commonProps, ageGroup: 'ADULTO', gender: 'M' }, '+1 Homem')} className="bg-blue-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-blue-800"><span className="text-4xl">👨</span><span className="font-black text-xs tracking-widest mt-1">HOMEM</span></button>
                    <button onClick={() => submit({ ...commonProps, ageGroup: 'ADULTO', gender: 'F' }, '+1 Mulher')} className="bg-pink-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-pink-800"><span className="text-4xl">👩</span><span className="font-black text-xs tracking-widest mt-1">MULHER</span></button>
                </div>
                <div className="p-5 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5">
                    <div className="flex items-center justify-center gap-2 mb-4"><Flame size={16} className="text-orange-500" /><span className="text-xs font-black uppercase text-orange-500">Painel Sobrenatural (Selecione antes)</span></div>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => toggle('isSalvation')} className={`py-4 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isSalvation ? 'bg-emerald-500 border-emerald-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Cross size={18} /><span className="text-[9px] font-black uppercase mt-1">Salvação</span></button>
                        <button onClick={() => toggle('isHealing')} className={`py-4 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isHealing ? 'bg-red-500 border-red-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Heart size={18} /><span className="text-[9px] font-black uppercase mt-1">Cura</span></button>
                        <button onClick={() => toggle('isDeliverance')} className={`py-4 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isDeliverance ? 'bg-orange-500 border-orange-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Libertação</span></button>
                    </div>
                </div>
            </div>
        </ScreenLayout>
    );
};

export const ConsolidationScreen = ({ user, onLogout, addToast, theme }: any) => {
    const [formData, setFormData] = useState({ name: '', phone: '', decision: 'Aceitou Jesus' });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await api.saveConsolidation({ ...formData, observer: user.name }); addToast("Ficha Salva!", 'success'); setFormData({ name: '', phone: '', decision: 'Aceitou Jesus' }); }
        catch (e) { addToast("Erro", 'error'); } finally { setLoading(false); }
    };
    return (
        <ScreenLayout user={user} title="Consolidação" icon={<HeartHandshake />} accentColor="#059669" onLogout={onLogout} checkpoints={[]} selectedSpot="" setSelectedSpot={() => { }} theme={theme}>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-[2rem] shadow-xl border border-white/10" style={{ background: theme.cardBg }}>
                    <div><label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">Nome Completo</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 rounded-xl font-bold border-2 outline-none focus:border-emerald-500 transition-all" style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} /></div>
                    <div><label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">WhatsApp</label><input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })} className="w-full p-4 rounded-xl font-bold border-2 outline-none focus:border-emerald-500 transition-all" style={{ background: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} maxLength={15} /></div>
                    <div><label className="text-xs font-bold uppercase opacity-60 ml-2 mb-1 block">Decisão</label><div className="grid grid-cols-2 gap-3">{['Aceitou Jesus', 'Reconciliação'].map(opt => (<button type="button" key={opt} onClick={() => setFormData({ ...formData, decision: opt })} className={`p-4 rounded-xl text-xs font-black border-2 transition-all ${formData.decision === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'opacity-60 border-gray-600'}`}>{opt}</button>))}</div></div>
                    <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black shadow-lg active:scale-95 transition-all border-b-4 border-emerald-800">{loading ? <RefreshCw className="animate-spin mx-auto" /> : 'SALVAR FICHA'}</button>
                </form>
            </div>
        </ScreenLayout>
    );
};

export const PrayerScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const [outcomes, setOutcomes] = useState({ isSalvation: false, isHealing: false, isDeliverance: false });
    const toggle = (key: keyof typeof outcomes) => setOutcomes(prev => ({ ...prev, [key]: !prev[key] }));

    const submit = (payload: any, label: string) => {
        handleCount({ ...payload, ...outcomes }, label);
        setOutcomes({ isSalvation: false, isHealing: false, isDeliverance: false });
    };

    return (
        <ScreenLayout user={user} title="Ministério Profético" icon={<HandMetal />} accentColor="#8B5CF6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 flex flex-col h-full justify-center pb-20 gap-8">
                <div className="p-5 rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-center justify-center gap-2 mb-4"><Zap size={16} className="text-purple-500" /><span className="text-xs font-black uppercase text-purple-500">O que aconteceu?</span></div>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => toggle('isSalvation')} className={`py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isSalvation ? 'bg-emerald-500 border-emerald-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Cross size={18} /><span className="text-[9px] font-black uppercase mt-1">Salvação</span></button>
                        <button onClick={() => toggle('isHealing')} className={`py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isHealing ? 'bg-red-500 border-red-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Heart size={18} /><span className="text-[9px] font-black uppercase mt-1">Cura</span></button>
                        <button onClick={() => toggle('isDeliverance')} className={`py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isDeliverance ? 'bg-orange-500 border-orange-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Libertação</span></button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => submit({ type: 'VISITOR' }, '+1 Visitante')} className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold text-sm border border-white/10 hover:bg-gray-700 transition-all border-b-4 border-gray-950">PASSOU VISITANTE</button>
                    <button onClick={() => submit({ type: 'MEMBER' }, '+1 Membro')} className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold text-sm border border-white/10 hover:bg-gray-700 transition-all border-b-4 border-gray-950">PASSOU MEMBRO</button>
                </div>
            </div>
        </ScreenLayout>
    );
};