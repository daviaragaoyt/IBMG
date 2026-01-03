import { useState } from 'react';

export const SorteioNumeros = () => {
    // Estados dos Inputs
    const [min, setMin] = useState<string>('1');
    const [max, setMax] = useState<string>('100');

    // Estados de Resultado e Animação
    const [_, setResultado] = useState<number | null>(null);
    const [displayValue, setDisplayValue] = useState<string | number>('?');
    const [isAnimating, setIsAnimating] = useState(false);

    // Estados de Configuração
    const [useCountdown, setUseCountdown] = useState(false);
    const [countdownTime, setCountdownTime] = useState(3);

    const sortear = () => {
        const minVal = parseInt(min);
        const maxVal = parseInt(max);

        // Validações originais do seu script.js
        if (isNaN(minVal) || isNaN(maxVal) || minVal < 1 || maxVal < 1) {
            setDisplayValue('Insira números válidos.');
            return;
        }

        if (minVal >= maxVal) {
            setDisplayValue('Mínimo deve ser menor que Máximo.');
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
                    finalizarSorteio(minVal, maxVal);
                }
            }, 1000);
        } else {
            finalizarSorteio(minVal, maxVal);
        }
    };

    const finalizarSorteio = (minVal: number, maxVal: number) => {
        const numeroSorteado = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        setResultado(numeroSorteado);
        setDisplayValue(numeroSorteado);
        setIsAnimating(false);
    };

    return (
        <div className="flex justify-center items-center py-10 animate-fade-in px-4">
            <div className="glass-panel p-8 w-full max-w-[600px] text-center flex flex-col items-center">

                <p className="text-3xl font-bold mb-8 page-title uppercase pb-4 inline-block w-full text-center">Sortear <span className="destaque">1</span> número</p>

                <div className="inputs-numeros">
                    <p className="label-entre">entre</p>
                    <input
                        type="number"
                        className="input-numero"
                        value={min}
                        min="1"
                        onChange={(e) => setMin(e.target.value)}
                    />

                    <p className="label-e">e</p>

                    <input
                        type="number"
                        className="input-numero"
                        value={max}
                        min="1"
                        onChange={(e) => setMax(e.target.value)}
                    />
                </div>

                <button
                    onClick={sortear}
                    disabled={isAnimating}
                    className="btn-custom w-full max-w-[300px]"
                >
                    {isAnimating ? 'SORTEANDO...' : 'SORTEAR AGORA!'}
                </button>

                {/* Configuração Countdown */}
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

                <p className="resultado-label">Número Sorteado:</p>
                <strong className="numero-sorteado-display">
                    {displayValue}
                </strong>

            </div>
        </div>
    );
};