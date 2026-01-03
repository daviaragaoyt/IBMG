import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle, AlertTriangle, Heart, Search, QrCode, UserPlus, Save } from 'lucide-react';

export const StaffScanner = () => {
    const [mode, setMode] = useState<'SCAN' | 'SEARCH' | 'REGISTER'>('SCAN');
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [selectedSpot, setSelectedSpot] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [pauseScan, setPauseScan] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regType, setRegType] = useState('VISITOR');
    const [loadingReg, setLoadingReg] = useState(false);

    // Define a URL da API (Localhost por padrão se não tiver .env)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetch(`${API_URL}/checkpoints`).then(res => res.json()).then(setCheckpoints).catch(console.error);
    }, []);

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
        } catch (err) { setFeedback({ success: false, message: "Erro de conexão" }); }
        setTimeout(() => { setFeedback(null); setPauseScan(false); }, 3000);
    };

    const handleSearch = async () => {
        if (searchTerm.length < 3) return;
        try {
            const res = await fetch(`${API_URL}/people?search=${searchTerm}`);
            setSearchResults(await res.json());
        } catch (e) { console.error(e); }
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
        } catch (error) { alert("Erro ao cadastrar."); }
        finally { setLoadingReg(false); }
    };

    return (
        <div className="max-w-md mx-auto p-4 flex flex-col gap-4 bg-gray-50 text-gray-900 min-h-screen">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-center text-blue-900 mb-3">Staff Control</h2>
                <select className="p-3 rounded border w-full font-bold bg-blue-50"
                    value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)}>
                    <option value="">📍 Selecione onde você está...</option>
                    {checkpoints.map((cp: any) => (
                        <option key={cp.id} value={cp.id}>{cp.name} {cp.isPrayerSpot ? '(Espiritual)' : ''}</option>
                    ))}
                </select>
            </div>

            {feedback && (
                <div className={`p-6 rounded-xl text-center shadow-2xl animate-bounce 
          ${feedback.status === 'SUCCESS' ? 'bg-green-100 text-green-900 border-2 border-green-500' :
                        feedback.status === 'REENTRY' ? 'bg-yellow-100 text-yellow-900 border-2 border-yellow-500' : 'bg-red-100 text-red-900'}`}>
                    <div className="flex justify-center mb-2">
                        {feedback.status === 'SUCCESS' ? <CheckCircle size={48} /> :
                            feedback.status === 'REENTRY' ? <AlertTriangle size={48} /> : <Heart size={48} />}
                    </div>
                    <h3 className="text-2xl font-bold">{feedback.person?.name}</h3>
                    <p className="text-lg mt-1 font-medium">{feedback.message}</p>
                </div>
            )}

            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
                <button onClick={() => setMode('SCAN')} className={`flex-1 p-3 flex flex-col items-center ${mode === 'SCAN' ? 'text-blue-700 border-b-4 border-blue-600' : 'text-gray-500'}`}><QrCode size={20} /><span className="text-xs">Ler QR</span></button>
                <button onClick={() => setMode('SEARCH')} className={`flex-1 p-3 flex flex-col items-center ${mode === 'SEARCH' ? 'text-blue-700 border-b-4 border-blue-600' : 'text-gray-500'}`}><Search size={20} /><span className="text-xs">Buscar</span></button>
                <button onClick={() => setMode('REGISTER')} className={`flex-1 p-3 flex flex-col items-center ${mode === 'REGISTER' ? 'text-blue-700 border-b-4 border-blue-600' : 'text-gray-500'}`}><UserPlus size={20} /><span className="text-xs">Novo</span></button>
            </div>

            {mode === 'SCAN' && selectedSpot && !pauseScan && (
                <div className="rounded-xl overflow-hidden border-4 border-gray-900 shadow-lg relative bg-black">
                    <Scanner onScan={(d) => d[0]?.rawValue && handleTrack(d[0].rawValue)} scanDelay={2000} />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-1 text-sm">Aponte para o QR Code</div>
                </div>
            )}

            {mode === 'SEARCH' && selectedSpot && (
                <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex gap-2">
                        <input className="flex-1 p-3 border rounded-lg bg-gray-50" placeholder="Nome..." onChange={e => setSearchTerm(e.target.value)} />
                        <button onClick={handleSearch} className="bg-blue-600 text-white p-3 rounded-lg"><Search size={20} /></button>
                    </div>
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {searchResults.map(p => (
                            <button key={p.id} onClick={() => handleTrack(p.id)} className="p-3 border rounded-lg text-left hover:bg-blue-50 flex justify-between items-center">
                                <div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500">{p.email}</div></div>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${p.type === 'MEMBER' ? 'bg-gray-100' : 'bg-orange-100'}`}>{p.type === 'MEMBER' ? 'MEM' : 'VIS'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'REGISTER' && (
                <form onSubmit={handleRegister} className="bg-white p-5 rounded-xl shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2">Cadastrar na Hora</h3>
                    <input required className="w-full p-3 border rounded-lg" placeholder="Nome Completo" value={regName} onChange={e => setRegName(e.target.value)} />
                    <div className="flex gap-4">
                        <label className={`flex-1 p-3 rounded-lg border text-center font-bold cursor-pointer ${regType === 'VISITOR' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-gray-50'}`}>
                            <input type="radio" className="hidden" checked={regType === 'VISITOR'} onChange={() => setRegType('VISITOR')} /> VISITANTE
                        </label>
                        <label className={`flex-1 p-3 rounded-lg border text-center font-bold cursor-pointer ${regType === 'MEMBER' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50'}`}>
                            <input type="radio" className="hidden" checked={regType === 'MEMBER'} onChange={() => setRegType('MEMBER')} /> MEMBRO
                        </label>
                    </div>
                    <button type="submit" disabled={loadingReg || !selectedSpot} className="bg-blue-600 text-white p-4 rounded-lg font-bold flex justify-center gap-2 shadow-md hover:bg-blue-700 disabled:bg-gray-300">
                        {loadingReg ? 'Salvando...' : <><Save size={20} /> Salvar e Dar Entrada</>}
                    </button>
                </form>
            )}
        </div>
    );
};