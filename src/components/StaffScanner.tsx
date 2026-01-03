import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    CheckCircle, AlertTriangle, Heart,
    Search, QrCode, UserPlus, Save, MapPin, Clock, History
} from 'lucide-react';

export const StaffScanner = () => {
    const [mode, setMode] = useState<'SCAN' | 'SEARCH' | 'REGISTER'>('SCAN');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [pauseScan, setPauseScan] = useState(false);

    // Histórico Local (Para o Staff ver quem acabou de passar)
    const [recentScans, setRecentScans] = useState<any[]>([]);

    // Busca e Cadastro
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regType, setRegType] = useState('VISITOR');
    const [loadingReg, setLoadingReg] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Cores do Evento Ekklesia
    const THEME = {
        primary: '#c95e89',    // Rosa
        secondary: '#59353e',  // Vinho/Marrom
        success: '#10b981',    // Verde
        warning: '#f59e0b',    // Amarelo
        error: '#ef4444',      // Vermelho
    };

    useEffect(() => {
        fetch(`${API_URL}/checkpoints`)
            .then(res => res.json())
            .then(setCheckpoints)
            .catch(err => console.error("Erro API:", err));
    }, []);

    const addToHistory = (personName: string, status: string, time: Date) => {
        setRecentScans(prev => [
            { name: personName, status, time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            ...prev
        ].slice(0, 5)); // Mantém apenas os últimos 5
    };

    const handleTrack = async (id: string) => {
        if (!selectedSpot) return alert("⚠️ Selecione um local no topo antes!");
        setPauseScan(true);

        try {
            const res = await fetch(`${API_URL}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personId: id, checkpointId: selectedSpot })
            });
            const data = await res.json();
            setFeedback(data);

            if (data.success && data.person) {
                addToHistory(data.person.name, data.status, new Date());
            }

        } catch (err) {
            setFeedback({ success: false, message: "Erro de conexão" });
        }

        setTimeout(() => { setFeedback(null); setPauseScan(false); }, 2500);
    };

    const handleSearch = async () => {
        if (searchTerm.length < 3) return;
        try {
            const res = await fetch(`${API_URL}/people?search=${searchTerm}`);
            const data = await res.json();
            setSearchResults(data);
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
            if (!res.ok) throw new Error("Erro");
            const newUser = await res.json();
            await handleTrack(newUser.id);
            setRegName(''); setRegEmail(''); setRegType('VISITOR');
            alert("Cadastrado com sucesso!");
        } catch (error) { alert("Erro ao cadastrar."); }
        finally { setLoadingReg(false); }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-gray-100 min-h-[calc(100vh-100px)] flex flex-col shadow-2xl rounded-xl overflow-hidden font-sans">

            {/* --- CABEÇALHO DO STAFF --- */}
            <div className="p-4 text-white shadow-lg z-10" style={{ background: `linear-gradient(to right, ${THEME.secondary}, ${THEME.primary})` }}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapPin size={20} /> Controle de Acesso
                </h2>
                <div className="mt-2">
                    <select
                        className="w-full p-3 rounded-lg text-gray-800 font-bold border-none outline-none shadow-sm focus:ring-2 focus:ring-pink-300"
                        value={selectedSpot}
                        onChange={e => setSelectedSpot(e.target.value)}
                    >
                        <option value="">📍 SELECIONE O LOCAL...</option>
                        {checkpoints.map((cp: any) => (
                            <option key={cp.id} value={cp.id}>{cp.name} {cp.isPrayerSpot ? '(Espiritual)' : ''}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- FEEDBACK VISUAL (OVERLAY) --- */}
            {feedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className={`p-8 rounded-2xl text-center shadow-2xl w-full max-w-sm border-4 transform transition-all scale-100
            ${feedback.status === 'SUCCESS' ? 'bg-white border-green-500' :
                            feedback.status === 'REENTRY' ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'}`}>

                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white shadow-lg
              ${feedback.status === 'SUCCESS' ? 'bg-green-500' :
                                feedback.status === 'REENTRY' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {feedback.status === 'SUCCESS' ? <CheckCircle size={40} /> :
                                feedback.status === 'REENTRY' ? <AlertTriangle size={40} /> : <Heart size={40} />}
                        </div>

                        <h3 className="text-2xl font-black text-gray-800 leading-tight mb-2">
                            {feedback.person?.name || "Desconhecido"}
                        </h3>

                        <p className="text-lg font-medium text-gray-600 mb-4">{feedback.message}</p>

                        {feedback.person?.type && (
                            <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider
                ${feedback.person.type === 'VISITOR' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {feedback.person.type === 'VISITOR' ? 'Visitante' : 'Membro'}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* --- MENU DE ABAS --- */}
            <div className="flex bg-white border-b border-gray-200">
                <button onClick={() => setMode('SCAN')}
                    className={`flex-1 p-4 flex flex-col items-center gap-1 transition-all ${mode === 'SCAN' ? 'text-[#c95e89] border-b-4 border-[#c95e89] bg-pink-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <QrCode size={24} /> <span className="text-xs font-bold">SCANNER</span>
                </button>
                <button onClick={() => setMode('SEARCH')}
                    className={`flex-1 p-4 flex flex-col items-center gap-1 transition-all ${mode === 'SEARCH' ? 'text-[#c95e89] border-b-4 border-[#c95e89] bg-pink-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <Search size={24} /> <span className="text-xs font-bold">BUSCAR</span>
                </button>
                <button onClick={() => setMode('REGISTER')}
                    className={`flex-1 p-4 flex flex-col items-center gap-1 transition-all ${mode === 'REGISTER' ? 'text-[#c95e89] border-b-4 border-[#c95e89] bg-pink-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <UserPlus size={24} /> <span className="text-xs font-bold">NOVO</span>
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">

                {/* --- MODO SCANNER --- */}
                {mode === 'SCAN' && (
                    <div className="flex flex-col h-full">
                        {selectedSpot ? (
                            !pauseScan && (
                                <div className="rounded-2xl overflow-hidden border-4 border-gray-800 shadow-xl relative bg-black aspect-square max-h-[400px] mx-auto w-full">
                                    <Scanner
                                        onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)}
                                        scanDelay={2000}
                                        allowMultiple={true}
                                    />
                                    <div className="absolute top-4 right-4 animate-pulse">
                                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-center text-xs">
                                        Câmera Ativa
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-700 animate-pulse">
                                <p className="font-bold">⚠️ Atenção Staff</p>
                                <p>Selecione seu local no topo para liberar a câmera.</p>
                            </div>
                        )}

                        {/* Lista de Recentes */}
                        <div className="mt-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <History size={14} /> Últimos Acessos (Local)
                            </h3>
                            <div className="space-y-2">
                                {recentScans.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">Nenhum registro recente.</p>}
                                {recentScans.map((scan, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center animate-fade-in">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${scan.status === 'SUCCESS' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <span className="font-bold text-gray-700 text-sm truncate max-w-[150px]">{scan.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                            <Clock size={10} /> {scan.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODO BUSCA --- */}
                {mode === 'SEARCH' && selectedSpot && (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input
                                className="flex-1 p-4 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-pink-300 outline-none"
                                placeholder="Digite o nome..."
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button onClick={handleSearch} className="bg-[#c95e89] text-white px-6 rounded-xl shadow-md hover:bg-[#b04d75]">
                                <Search size={24} />
                            </button>
                        </div>

                        <div className="space-y-2 mt-2">
                            {searchResults.map(p => (
                                <button key={p.id} onClick={() => handleTrack(p.id)}
                                    className="w-full p-4 bg-white border border-gray-100 rounded-xl text-left shadow-sm hover:bg-pink-50 flex justify-between items-center group transition-colors">
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-[#c95e89]">{p.name}</div>
                                        <div className="text-xs text-gray-400">{p.email || 'Sem e-mail'}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${p.type === 'MEMBER' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-500'}`}>
                                            {p.type === 'MEMBER' ? 'Membro' : 'Visitante'}
                                        </span>
                                        <div className="bg-gray-100 p-2 rounded-full text-gray-400 group-hover:bg-[#c95e89] group-hover:text-white transition-colors">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {searchResults.length === 0 && searchTerm && (
                                <p className="text-center text-gray-400 py-8">Ninguém encontrado com esse nome.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* --- MODO NOVO CADASTRO --- */}
                {mode === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 animate-fade-in">
                        <h3 className="font-bold text-gray-700 border-b pb-3 text-lg">Cadastro Rápido</h3>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Nome Completo</label>
                            <input
                                required
                                className="w-full p-4 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#c95e89] outline-none transition-all font-bold text-gray-800"
                                placeholder="Ex: Carlos Oliveira"
                                value={regName}
                                onChange={e => setRegName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">E-mail (Opcional)</label>
                            <input
                                type="email"
                                className="w-full p-4 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#c95e89] outline-none transition-all"
                                placeholder="email@exemplo.com"
                                value={regEmail}
                                onChange={e => setRegEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Tipo de Pessoa</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`p-4 rounded-xl border-2 cursor-pointer text-center font-bold transition-all
                  ${regType === 'VISITOR' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <input type="radio" className="hidden" checked={regType === 'VISITOR'} onChange={() => setRegType('VISITOR')} />
                                    VISITANTE
                                </label>
                                <label className={`p-4 rounded-xl border-2 cursor-pointer text-center font-bold transition-all
                  ${regType === 'MEMBER' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <input type="radio" className="hidden" checked={regType === 'MEMBER'} onChange={() => setRegType('MEMBER')} />
                                    MEMBRO
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loadingReg || !selectedSpot}
                            className="mt-4 bg-gradient-to-r from-[#59353e] to-[#c95e89] text-white p-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingReg ? 'Salvando...' : <><Save size={20} /> Salvar e Dar Entrada</>}
                        </button>

                        {!selectedSpot && (
                            <p className="text-xs text-red-500 text-center font-bold bg-red-50 p-2 rounded">⚠️ Selecione um local no topo primeiro.</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};