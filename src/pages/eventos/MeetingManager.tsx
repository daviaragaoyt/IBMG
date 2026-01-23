import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api'; // Usa a API centralizada

interface MeetingManagerProps {
    isLightMode: boolean;
}

export const MeetingManager = ({ isLightMode }: MeetingManagerProps) => {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Formulário
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'AGENDADA', // ou REALIZADA
        notes: '',
        createdBy: 'Admin'
    });

    const theme = isLightMode ? { bg: '#F3F4F6', text: '#1A1A1A', card: '#FFFFFF' } : { bg: '#0F0014', text: '#FFFFFF', card: '#1A0524' };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = () => {
        api.getMeetings()
            .then(setMeetings)
            .catch(console.error);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.date || !formData.time) return alert("Preencha título, data e hora.");
        setLoading(true);

        const dateTime = new Date(`${formData.date}T${formData.time}:00`);

        try {
            await api.createMeeting({
                ...formData,
                date: dateTime.toISOString()
            });
            setModalOpen(false);
            setFormData({ title: '', date: '', time: '', type: 'AGENDADA', notes: '', createdBy: 'Admin' });
            fetchMeetings();
        } catch (e) {
            alert("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apagar este registro?")) return;
        try {
            await api.deleteMeeting(id);
            fetchMeetings();
        } catch (e) {
            alert("Erro ao deletar.");
        }
    };

    // Formata data para exibição
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen p-6 pt-24 font-sans transition-colors duration-500" style={{ background: theme.bg, color: theme.text }}>

            <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
                <div>
                    <Link to="/ekklesia" className="text-sm font-bold opacity-50 hover:opacity-100 flex items-center gap-2 mb-2"><ArrowLeft size={16} /> Voltar</Link>
                    <h1 className="text-3xl font-black tracking-tight">Gestão de Reuniões</h1>
                    <p className="opacity-60 text-sm">Organize a agenda e registre as atas.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg flex items-center gap-2 font-bold transition-all hover:scale-105">
                    <Plus size={20} /> <span className="hidden sm:inline">Nova Reunião</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {meetings.length === 0 && (
                    <div className="text-center opacity-40 py-20 font-bold border-2 border-dashed rounded-3xl" style={{ borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D' }}>
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        Nenhuma reunião registrada.
                    </div>
                )}

                {meetings.map((m) => (
                    <div key={m.id} className="p-6 rounded-2xl shadow-md border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-all hover:border-blue-500/30"
                        style={{ background: theme.card, borderColor: isLightMode ? '#E5E7EB' : '#2D0A3D' }}>

                        <div className="flex gap-4 items-start w-full">
                            <div className={`p-3 rounded-xl shrink-0 ${m.type === 'AGENDADA' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                {m.type === 'AGENDADA' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${m.type === 'AGENDADA' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {m.type}
                                    </span>
                                    <span className="text-xs opacity-50 font-bold flex items-center gap-1">
                                        <Calendar size={10} /> {formatDate(m.date)}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold leading-tight truncate">{m.title}</h3>
                                {m.notes && (
                                    <div className="mt-3 text-sm opacity-70 bg-gray-100 dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-white/5 whitespace-pre-wrap">
                                        {m.notes}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => handleDelete(m.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-end md:self-center shrink-0">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL NOVA REUNIÃO */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                        <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-white">Nova Reunião</h2>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                            {/* Tipo */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                <button onClick={() => setFormData({ ...formData, type: 'AGENDADA' })} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${formData.type === 'AGENDADA' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-400'}`}>AGENDAR FUTURA</button>
                                <button onClick={() => setFormData({ ...formData, type: 'REALIZADA' })} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${formData.type === 'REALIZADA' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-400'}`}>REGISTRAR ATA</button>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block">Título</label>
                                <input className="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 font-bold outline-none focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                                    placeholder={formData.type === 'AGENDADA' ? "Ex: Alinhamento Kids" : "Ex: Reunião de Terça"}
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block">Data</label>
                                    <input type="date" className="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 font-bold outline-none text-gray-900 dark:text-white transition-colors"
                                        value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block">Hora</label>
                                    <input type="time" className="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 font-bold outline-none text-gray-900 dark:text-white transition-colors"
                                        value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 ml-2 mb-1 block">
                                    {formData.type === 'AGENDADA' ? 'Pauta / Observações' : 'Ata / Resumo do que houve'}
                                </label>
                                <textarea rows={4} className="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 font-medium outline-none focus:border-blue-500 text-gray-900 dark:text-white text-sm resize-none transition-colors"
                                    placeholder={formData.type === 'AGENDADA' ? "O que será discutido..." : "Principais decisões tomadas..."}
                                    value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => setModalOpen(false)} className="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                                {loading ? 'Salvando...' : 'SALVAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};