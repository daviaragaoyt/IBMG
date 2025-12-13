// sorteio_numeros/script.js (ESPECÍFICO PARA NÚMEROS)

document.addEventListener('DOMContentLoaded', () => {
    const minNumeroInput = document.getElementById('minNumeroInput');
    const maxNumeroInput = document.getElementById('maxNumeroInput');
    const sortearNumeroBtn = document.getElementById('sortearNumeroBtn');
    const numeroSorteadoDisplay = document.getElementById('numeroSorteado');

    if (sortearNumeroBtn && minNumeroInput && maxNumeroInput && numeroSorteadoDisplay) {
        sortearNumeroBtn.addEventListener('click', () => {
            const minNumero = parseInt(minNumeroInput.value);
            const maxNumero = parseInt(maxNumeroInput.value);

            if (isNaN(minNumero) || isNaN(maxNumero) || minNumero < 1 || maxNumero < 1) {
                numeroSorteadoDisplay.textContent = 'Insira números válidos.';
                return;
            }

            if (minNumero >= maxNumero) {
                numeroSorteadoDisplay.textContent = 'O número mínimo deve ser menor que o máximo.';
                return;
            }

            const useCountdown = document.getElementById('countdownCheckbox').checked;
            const countdownSeconds = parseInt(document.getElementById('countdownSeconds').value) || 3;

            if (useCountdown && countdownSeconds > 0) {
                sortearNumeroBtn.disabled = true;
                let counter = countdownSeconds;

                numeroSorteadoDisplay.textContent = counter;
                numeroSorteadoDisplay.classList.add('countdown-active');

                const interval = setInterval(() => {
                    counter--;
                    if (counter > 0) {
                        numeroSorteadoDisplay.textContent = counter;
                    } else {
                        clearInterval(interval);
                        numeroSorteadoDisplay.classList.remove('countdown-active');
                        const numeroSorteado = Math.floor(Math.random() * (maxNumero - minNumero + 1)) + minNumero;
                        numeroSorteadoDisplay.textContent = numeroSorteado;
                        sortearNumeroBtn.disabled = false;
                    }
                }, 1000);
            } else {
                const numeroSorteado = Math.floor(Math.random() * (maxNumero - minNumero + 1)) + minNumero;
                numeroSorteadoDisplay.textContent = numeroSorteado;
            }
        });
    }
});