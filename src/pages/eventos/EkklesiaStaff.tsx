import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle, AlertTriangle, XCircle, Search, QrCode, UserPlus, MapPin, History, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventoProps { isLightMode: boolean; }

export const EkklesiaStaff = ({ isLightMode }: EventoProps) => {
    const [mode, setMode] = useState<'SCAN' | 'SEARCH' | 'REGISTER'>('SCAN');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [pauseScan, setPauseScan] = useState(false);
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regType, setRegType] = useState('VISITOR');
    const [loadingReg, setLoadingReg] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Tema Vibrante
    const theme = {
        gradient: 'linear-gradient(135deg, #A800E0, #FF3D00)',
        bg: isLightMode ? '#F3F4F6' : '#0F0014',
        cardBg: isLightMode ? '#FFFFFF' : '#1A0524',
        textPrimary: isLightMode ? '#1A1A1A' : '#FFFFFF',
        textSecondary: isLightMode ? '#666666' : '#AAAAAA',
        inputBg: isLightMode ? '#F9FAFB' : '#2D0A3D',
        borderColor: isLightMode ? '#E5E7EB' : '#4B1E63',
        tabActiveBg: isLightMode ? '#FFFFFF' : '#2D0A3D',
        tabInactiveBg: isLightMode ? 'rgba(255,255,255,0.5)' : 'rgba(26, 5, 36, 0.5)',
    };

    useEffect(() => {
        fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(setCheckpoints).catch(console.error);
    }, []);

    const addToHistory = (personName: string, status: string) => {
        setRecentScans(prev => [{ name: personName, status, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 5));
    };

    const handleTrack = async (id: string) => {
        if (!selectedSpot) return alert("⚠️ Selecione o local no topo antes de bipar!");
        setPauseScan(true);
        try {
            const res = await fetch(`${API_URL}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personId: id, checkpointId: selectedSpot })
            });
            const data = await res.json();
            setFeedback(data);
            if (data.success && data.person) addToHistory(data.person.name, data.status);
        } catch (err) { setFeedback({ success: false, message: "Erro de conexão" }); }
        setTimeout(() => { setFeedback(null); setPauseScan(false); }, 2500);
    };

    const handleSearch = async () => {
        if (searchTerm.length < 3) return;
        try {
            const res = await fetch(`${API_URL}/people?search=${searchTerm}`);
            setSearchResults(await res.json());
        } catch (e) { alert("Erro ao buscar."); }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpot) return alert("Selecione o local antes.");
        setLoadingReg(true);
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: regName, email: regEmail || null, type: regType })
            });
            if (!res.ok) throw new Error();
            const newUser = await res.json();
            await handleTrack(newUser.id);
            setRegName(''); setRegEmail(''); setRegType('VISITOR');
            alert("✅ Cadastrado!");
        } catch (error) { alert("Erro ao cadastrar."); }
        finally { setLoadingReg(false); }
    };

    return (
        <div className="min-h-screen w-full font-sans flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.textPrimary }}>
            <div className="p-4 shadow-md text-white flex flex-col gap-3 rounded-b-3xl z-20" style={{ background: theme.gradient }}>
                <div className="flex justify-between items-center">
                    <Link to="/ekklesia" className="text-white/80 hover:text-white"><ArrowLeft size={24} /></Link>
                    <h1 className="text-lg font-bold tracking-wider">EKKLESIA STAFF</h1>
                    <div className="w-6"></div>
                </div>
                <div className="bg-white/20 p-2 rounded-xl flex items-center gap-2 backdrop-blur-sm border border-white/30">
                    <MapPin size={20} className="text-white" />
                    <select className="bg-transparent w-full text-white font-bold outline-none border-none" value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)} style={{ colorScheme: isLightMode ? 'light' : 'dark' }}>
                        <option value="" className="text-gray-800">📍 Selecione seu Posto...</option>
                        {checkpoints.map((cp: any) => (<option key={cp.id} value={cp.id} className="text-gray-800">{cp.name}</option>))}
                    </select>
                </div>
            </div>

            {feedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative">
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white shadow-lg ${feedback.status === 'SUCCESS' ? 'bg-green-500' : feedback.status === 'REENTRY' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {feedback.status === 'SUCCESS' ? <CheckCircle size={40} /> : feedback.status === 'REENTRY' ? <AlertTriangle size={40} /> : <XCircle size={40} />}
                        </div>
                        <h2 className="text-2xl font-black mb-1 text-gray-900">{feedback.person?.name || "Erro"}</h2>
                        <p className="text-lg font-medium text-gray-500 mb-4">{feedback.message}</p>
                    </div>
                </div>
            )}

            <div className="flex px-4 pt-4 gap-2 relative z-10">
                {['SCAN', 'SEARCH', 'REGISTER'].map((m) => (
                    <button key={m} onClick={() => setMode(m as any)} className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex flex-col items-center gap-1 ${mode === m ? 'text-[#A800E0] shadow-md border-b-4 border-[#A800E0] translate-y-[-2px]' : 'text-gray-400'}`}
                        style={{ backgroundColor: mode === m ? theme.tabActiveBg : theme.tabInactiveBg }}>
                        {m === 'SCAN' && <QrCode size={20} />} {m === 'SEARCH' && <Search size={20} />} {m === 'REGISTER' && <UserPlus size={20} />}
                        {m === 'SCAN' ? 'LER QR' : m === 'SEARCH' ? 'BUSCAR' : 'NOVO'}
                    </button>
                ))}
            </div>

            <div className="flex-1 p-4 overflow-y-auto relative z-10">
                {mode === 'SCAN' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        {!selectedSpot ? (
                            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-600 p-4 rounded mb-4"><p className="font-bold">⚠️ Selecione o local acima</p></div>
                        ) : !pauseScan ? (
                            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-black aspect-square">
                                <Scanner onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)} scanDelay={2000} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-48 h-48 border-2 border-white/50 rounded-lg relative"><div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#A800E0]"></div><div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#A800E0]"></div><div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#A800E0]"></div><div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#A800E0]"></div></div></div>
                            </div>
                        ) : (<div className="h-64 rounded-3xl flex items-center justify-center font-bold animate-pulse" style={{ backgroundColor: theme.cardBg, color: theme.textSecondary }}>Processando...</div>)}
                        <div className="mt-6">
                            <h3 className="text-xs font-bold uppercase mb-3 flex items-center gap-1" style={{ color: theme.textSecondary }}><History size={14} /> Últimos Bips</h3>
                            <div className="space-y-2">
                                {recentScans.map((scan, i) => (
                                    <div key={i} className="p-3 rounded-xl shadow-sm flex justify-between items-center border" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                                        <span className="font-bold">{scan.name}</span>
                                        <div className={`w-2 h-2 rounded-full ${scan.status === 'SUCCESS' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {mode === 'SEARCH' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex gap-2">
                            <input className="flex-1 p-4 rounded-xl border outline-none focus:border-[#A800E0]" placeholder="Nome..." onChange={e => setSearchTerm(e.target.value)} style={{ backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} />
                            <button onClick={handleSearch} className="text-white px-4 rounded-xl shadow hover:brightness-110 transition-all" style={{ background: theme.gradient }}><Search /></button>
                        </div>
                        {searchResults.map(p => (<button key={p.id} onClick={() => handleTrack(p.id)} className="w-full p-4 rounded-xl shadow-sm text-left hover:opacity-90 transition-all font-bold border" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor, color: theme.textPrimary }}>{p.name}</button>))}
                    </div>
                )}
                {mode === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="p-6 rounded-3xl shadow-sm space-y-4 animate-fade-in border" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
                        <h3 className="font-bold text-lg border-b pb-2" style={{ borderColor: theme.borderColor }}>Novo Cadastro</h3>
                        <input required className="w-full p-4 rounded-xl outline-none font-bold border focus:border-[#A800E0]" placeholder="Nome Completo" value={regName} onChange={e => setRegName(e.target.value)} style={{ backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.textPrimary }} />
                        <div className="grid grid-cols-2 gap-3">
                            {['VISITOR', 'MEMBER'].map(t => (
                                <button type="button" key={t} onClick={() => setRegType(t)} className={`p-3 rounded-xl font-bold border-2 transition-all ${regType === t ? 'border-[#A800E0] text-[#A800E0]' : ''}`} style={{ backgroundColor: regType === t ? (isLightMode ? '#fdf4ff' : '#2D0A3D') : theme.inputBg, borderColor: regType === t ? '#A800E0' : theme.borderColor, color: regType === t ? '#A800E0' : theme.textSecondary }}>{t === 'VISITOR' ? 'VISITANTE' : 'MEMBRO'}</button>
                            ))}
                        </div>
                        <button type="submit" disabled={loadingReg || !selectedSpot} className="w-full py-4 rounded-xl text-white font-bold shadow-lg mt-4 hover:brightness-110 disabled:opacity-50" style={{ background: theme.gradient }}>{loadingReg ? 'Salvando...' : 'SALVAR'}</button>
                    </form>
                )}
            </div>
        </div>
    );
};