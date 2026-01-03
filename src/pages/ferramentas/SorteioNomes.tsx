import { useState } from 'react';

export const SorteioNomes = () => {
    const [input, setInput] = useState('');
    const [resultado, setResultado] = useState<string | null>(null);

    // Estados para Countdown
    const [useCountdown, setUseCountdown] = useState(false);
    const [countdownTime, setCountdownTime] = useState(3);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayValue, setDisplayValue] = useState<string | number>('');

    const sortear = () => {
        // Transforma o texto em lista, removendo linhas vazias
        const nomesArray = input.split('\n').map(nome => nome.trim()).filter(nome => nome !== '');

        if (nomesArray.length === 0) {
            setResultado('Por favor, insira nomes para sortear.');
            setDisplayValue('Por favor, insira nomes para sortear.');
            return;
        }

        if (isAnimating) return;

        if (useCountdown) {
            setIsAnimating(true);
            let counter = countdownTime;
            setDisplayValue(counter);

            const interval = setInterval(() => {
                counter--;
                if (counter > 0) {
                    setDisplayValue(counter);
                } else {
                    clearInterval(interval);
                    finalizarSorteio(nomesArray);
                }
            }, 1000);
        } else {
            finalizarSorteio(nomesArray);
        }
    };

    const finalizarSorteio = (lista: string[]) => {
        const indiceSorteado = Math.floor(Math.random() * lista.length);
        const vencedor = lista[indiceSorteado];
        setResultado(vencedor);
        setDisplayValue(vencedor);
        setIsAnimating(false);
    };

    return (
        <div className="flex justify-center items-center py-10 animate-fade-in">
            <div className="glass-panel p-8 w-full max-w-[700px] text-center">
                <h1 className="text-3xl font-bold mb-8 page-title uppercase pb-4 inline-block w-full text-center">
                    Sortear Nomes
                </h1>

                <textarea
                    className="textarea-nomes"
                    rows={10}
                    placeholder={`Ex:\nJoão\nMaria\nPedro\nAna\nCarlos`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <div className="config-countdown-container">
                    <label className="countdown-label">
                        <input
                            type="checkbox"
                            checked={useCountdown}
                            onChange={(e) => setUseCountdown(e.target.checked)}
                        />
                        Contagem Regressiva
                    </label>
                    <label className="countdown-label">
                        Tempo (s):
                        <input
                            type="number"
                            value={countdownTime}
                            min={1}
                            max={60}
                            onChange={(e) => setCountdownTime(Number(e.target.value))}
                            className="input-countdown"
                        />
                    </label>
                </div>

                <button
                    onClick={sortear}
                    disabled={isAnimating}
                    className="btn-custom w-full"
                >
                    {isAnimating ? 'Sorteando...' : 'Sortear Nome'}
                </button>

                {/* Área do Resultado */}
                <div className="mt-8">
                    <p className="text-lg text-[#cccccc] mb-2">Nome Sorteado:</p>
                    <strong className="nome-sorteado">
                        {isAnimating ? displayValue : (resultado || '')}
                    </strong>
                </div>
            </div>
        </div>
    );
};