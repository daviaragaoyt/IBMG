import { useState } from 'react';
import { ScreenLayout, MeetingCounter, } from './StaffShared';
import { MapPin, Plus, Users, Zap, Flame, Heart, Cross, HandMetal } from 'lucide-react';

export const ReceptionScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    // REMOVIDO MODO SCANNER (Solicitação: "Retine o scanner")
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');

    return (
        <ScreenLayout user={user} title="Recepção" icon={<MapPin />} accentColor="#3B82F6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <MeetingCounter theme={theme} />
            <div className="p-6 pt-2 flex flex-col h-full gap-4">



                <div className="flex gap-3">
                    <button onClick={() => setPersonType('VISITOR')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-4 active:scale-95 ${personType === 'VISITOR' ? 'bg-orange-600 border-orange-800 text-white shadow-lg' : 'border-gray-600/30 bg-white/5 text-gray-400 opacity-60'}`}><Plus size={18} /> VISITANTE</button>
                    <button onClick={() => setPersonType('MEMBER')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-4 active:scale-95 ${personType === 'MEMBER' ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'border-gray-600/30 bg-white/5 text-gray-400 opacity-60'}`}><Users size={18} /> MEMBRO</button>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                    <button onClick={() => handleCount({ gender: 'M', ageGroup: 'ADULTO', type: personType }, '+1 Homem')} className="bg-blue-600 rounded-[2rem] text-white shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center border-b-8 border-blue-800 hover:brightness-110"><span className="text-5xl mb-2 filter drop-shadow-md">👨</span><span className="font-black text-sm tracking-widest">HOMEM</span></button>
                    <button onClick={() => handleCount({ gender: 'F', ageGroup: 'ADULTO', type: personType }, '+1 Mulher')} className="bg-pink-600 rounded-[2rem] text-white shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center border-b-8 border-pink-800 hover:brightness-110"><span className="text-5xl mb-2 filter drop-shadow-md">👩</span><span className="font-black text-sm tracking-widest">MULHER</span></button>
                    <button onClick={() => handleCount({ gender: 'M', ageGroup: 'JOVEM', type: personType }, '+1 Jovem')} className="bg-yellow-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-yellow-800 hover:brightness-110"><span className="text-3xl mb-1">🧑‍🎤</span><span className="font-black text-xs">JOVEM</span></button>
                    <button onClick={() => handleCount({ gender: 'M', ageGroup: 'CRIANCA', type: personType }, '+1 Criança')} className="bg-green-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-green-800 hover:brightness-110"><span className="text-3xl mb-1">👶</span><span className="font-black text-xs">CRIANÇA</span></button>
                </div>
            </div>
        </ScreenLayout>
    );
};

export const MartyrsScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    // CLONE DA RECEPÇÃO PARA CASA DOS MÁRTIRES
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');

    return (
        <ScreenLayout user={user} title="Casa dos Mártires" icon={<Flame />} accentColor="#DC2626" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>

            <div className="p-6 pt-2 flex flex-col h-full gap-4">



                <div className="flex gap-3">
                    <button onClick={() => setPersonType('VISITOR')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-4 active:scale-95 ${personType === 'VISITOR' ? 'bg-orange-600 border-orange-800 text-white shadow-lg' : 'border-gray-600/30 bg-white/5 text-gray-400 opacity-60'}`}><Plus size={18} /> VISITANTE</button>
                    <button onClick={() => setPersonType('MEMBER')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-b-4 active:scale-95 ${personType === 'MEMBER' ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'border-gray-600/30 bg-white/5 text-gray-400 opacity-60'}`}><Users size={18} /> MEMBRO</button>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                    <button onClick={() => handleCount({ gender: 'M', ageGroup: 'ADULTO', type: personType }, '+1 Homem')} className="bg-blue-600 rounded-[2rem] text-white shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center border-b-8 border-blue-800 hover:brightness-110"><span className="text-5xl mb-2 filter drop-shadow-md">👨</span><span className="font-black text-sm tracking-widest">HOMEM</span></button>
                    <button onClick={() => handleCount({ gender: 'F', ageGroup: 'ADULTO', type: personType }, '+1 Mulher')} className="bg-pink-600 rounded-[2rem] text-white shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center border-b-8 border-pink-800 hover:brightness-110"><span className="text-5xl mb-2 filter drop-shadow-md">👩</span><span className="font-black text-sm tracking-widest">MULHER</span></button>

                </div>
            </div>
        </ScreenLayout>
    );
};

export const EvangelismScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const commonProps = { gender: 'M', type: 'VISITOR' };
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
                        <button onClick={() => toggle('isDeliverance')} className={`py-4 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isDeliverance ? 'bg-orange-500 border-orange-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Oração</span></button>
                    </div>
                </div>
            </div>
        </ScreenLayout>
    );
};

export const PrayerScreen = ({ user, checkpoints, selectedSpot, setSelectedSpot, handleCount, onLogout, theme }: any) => {
    const [personType, setPersonType] = useState<'VISITOR' | 'MEMBER'>('VISITOR');
    const [outcomes, setOutcomes] = useState({ isSalvation: false, isHealing: false, isDeliverance: false });
    const toggle = (key: keyof typeof outcomes) => setOutcomes(prev => ({ ...prev, [key]: !prev[key] }));

    const submit = (payload: any, label: string) => {
        handleCount({ ...payload, ...outcomes }, label);
        setOutcomes({ isSalvation: false, isHealing: false, isDeliverance: false });
    };

    return (
        <ScreenLayout user={user} title="Ministério Profético" icon={<HandMetal />} accentColor="#8B5CF6" onLogout={onLogout} checkpoints={checkpoints} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} theme={theme}>
            <div className="p-6 flex flex-col h-full justify-center pb-20 gap-6">
                {/* SELETOR TIPO DE PESSOA */}
                <div className="flex gap-3 mb-2">
                    <button onClick={() => setPersonType('VISITOR')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'VISITOR' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'border-gray-600/30 bg-transparent opacity-60'}`}><Plus size={18} /> VISITANTE</button>
                    <button onClick={() => setPersonType('MEMBER')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${personType === 'MEMBER' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-600/30 bg-transparent opacity-60'}`}><Users size={18} /> MEMBRO</button>
                </div>

                <div className="p-5 rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-center justify-center gap-2 mb-4"><Zap size={16} className="text-purple-500" /><span className="text-xs font-black uppercase text-purple-500">O que aconteceu?</span></div>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => toggle('isSalvation')} className={`py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isSalvation ? 'bg-emerald-500 border-emerald-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Cross size={18} /><span className="text-[9px] font-black uppercase mt-1">Salvação</span></button>
                        <button onClick={() => toggle('isHealing')} className={`py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isHealing ? 'bg-red-500 border-red-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Heart size={18} /><span className="text-[9px] font-black uppercase mt-1">Cura</span></button>
                        <button onClick={() => toggle('isDeliverance')} className={`py-3 rounded-xl text-white shadow active:scale-95 flex flex-col items-center border-b-4 transition-all ${outcomes.isDeliverance ? 'bg-orange-500 border-orange-700 scale-105' : 'bg-gray-700 border-gray-900 opacity-50'}`}><Flame size={18} /><span className="text-[9px] font-black uppercase mt-1">Oração</span></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => submit({ type: personType, gender: 'M', ageGroup: 'ADULTO' }, '+1 Homem')} className="bg-blue-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-blue-800"><span className="text-4xl">👨</span><span className="font-black text-xs tracking-widest mt-1">HOMEM</span></button>
                    <button onClick={() => submit({ type: personType, gender: 'F', ageGroup: 'ADULTO' }, '+1 Mulher')} className="bg-pink-600 h-24 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-pink-800"><span className="text-4xl">👩</span><span className="font-black text-xs tracking-widest mt-1">MULHER</span></button>
                </div>
            </div>
        </ScreenLayout>
    );
};