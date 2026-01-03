import { useState } from 'react';

export const Bingo = () => {
    const [historico, setHistorico] = useState<number[]>([]);
    const [ultimo, setUltimo] = useState<number | null>(null);

    // Estados para Countdown
    const [useCountdown, setUseCountdown] = useState(false);
    const [countdownTime, setCountdownTime] = useState(3);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayNumber, setDisplayNumber] = useState<number | string>('?');

    const MAX_NUMERO = 75;

    const sortear = () => {
        if (historico.length >= MAX_NUMERO) {
            alert("Todos os números já foram sorteados!");
            return;
        }

        if (isAnimating) return; // Evita duplo clique

        setIsAnimating(true);

        // Lógica para escolher o número (sem repetir)
        let novoNumero: number;
        do {
            novoNumero = Math.floor(Math.random() * MAX_NUMERO) + 1;
        } while (historico.includes(novoNumero));

        if (useCountdown) {
            // INICIAR CONTAGEM
            let counter = countdownTime;
            setDisplayNumber(counter);

            const interval = setInterval(() => {
                counter--;
                if (counter > 0) {
                    setDisplayNumber(counter);
                } else {
                    clearInterval(interval);
                    finalizarSorteio(novoNumero);
                }
            }, 1000);
        } else {
            // SEM CONTAGEM (Imediato)
            finalizarSorteio(novoNumero);
        }
    };

    const finalizarSorteio = (numero: number) => {
        setUltimo(numero);
        setDisplayNumber(numero);
        setHistorico(prev => [...prev, numero]); // Adiciona ao fim da lista
        setIsAnimating(false);
    };

    const reiniciar = () => {
        if (confirm('Tem certeza que deseja reiniciar o jogo? O histórico será apagado.')) {
            setHistorico([]);
            setUltimo(null);
            setDisplayNumber('?');
            setIsAnimating(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 bingo-page animate-fade-in">
            <div className="glass-panel p-8 w-full max-w-[600px] sorteio-container">
                <h1 className="text-3xl font-bold mb-8 page-title uppercase pb-4 inline-block w-full text-center">Bingo IBGM</h1>

                <div className="numero-atual-container">
                    <p className="resultado-label">Número Sorteado:</p>
                    <strong className="numero-grande">
                        {isAnimating && typeof displayNumber === 'number' ? displayNumber : (ultimo || '?')}
                    </strong>
                </div>

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
                    disabled={isAnimating || historico.length >= MAX_NUMERO}
                    className="btn-custom btn-sortear-bingo"
                >
                    {isAnimating ? 'SORTEANDO...' : 'SORTEAR NÚMERO'}
                </button>

                <button onClick={reiniciar} className="btn-reiniciar">
                    Reiniciar Jogo
                </button>

                <div className="historico-container">
                    <span className="historico-label">Histórico de Números</span>
                    <div className="historico-grid">
                        {historico.map((num) => (
                            <div key={num} className="bola-historico">
                                {num}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};