import React, { useState } from 'react';
import { TicketUser } from '../../components/TicketUser';

export const FindTicketPage = () => {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setUser(null);
        try {
            const res = await fetch(`${API_URL}/person/by-email?email=${email}`);
            if (res.ok) setUser(await res.json());
            else setError('Inscrição não encontrada.');
        } catch { setError('Erro de conexão.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh] p-6 animate-fade-in">
            {!user ? (
                <div className="glass-panel p-8 w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 page-title uppercase pb-4 inline-block w-full text-center">
                        Minha Credencial
                    </h2>
                    <p className="text-[#cccccc] text-center mb-6">Digite seu e-mail para pegar o Passaporte.</p>
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <input
                            type="email"
                            required
                            className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#007B9C] transition-colors"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-custom w-full mt-2"
                        >
                            {loading ? 'Buscando...' : 'GERAR QR CODE'}
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-center mt-4 font-bold bg-red-900/20 p-2 rounded border border-red-500/30">{error}</p>}
                </div>
            ) : (
                <div className="w-full max-w-md mx-auto">
                    <button
                        onClick={() => setUser(null)}
                        className="mb-4 text-sm text-[#cccccc] hover:text-white underline flex items-center transition-colors"
                    >
                        &larr; Voltar
                    </button>

                    <div className="glass-panel p-4">
                        <TicketUser user={user} />
                        <p className="text-center mt-4 text-[#007B9C] bg-[#007B9C]/10 p-3 rounded-lg text-sm border border-[#007B9C]/30 font-bold">
                            📸 Tire um print desta tela!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};