// sorteio_nomes/script.js (ESPECÍFICO PARA NOMES)

document.addEventListener('DOMContentLoaded', () => {
    const nomesInput = document.getElementById('nomesInput');
    const sortearNomeBtn = document.getElementById('sortearNomeBtn');
    const nomeSorteadoDisplay = document.getElementById('nomeSorteado');

    if (sortearNomeBtn && nomesInput && nomeSorteadoDisplay) {
        sortearNomeBtn.addEventListener('click', () => {
            const nomesTexto = nomesInput.value;
            const nomesArray = nomesTexto.split('\n').map(nome => nome.trim()).filter(nome => nome !== '');

            if (nomesArray.length > 0) {
                const useCountdown = document.getElementById('countdownCheckbox').checked;
                const countdownSeconds = parseInt(document.getElementById('countdownSeconds').value) || 3;

                if (useCountdown && countdownSeconds > 0) {
                    sortearNomeBtn.disabled = true;
                    let counter = countdownSeconds;

                    nomeSorteadoDisplay.textContent = counter;
                    // Adicionar classe global ou style inline se não tivermos a classe importada
                    // Como estamos usando styles separados, é melhor adicionar ao css global ou garantir que este tenha acesso
                    // Vou assumir que o styles.css global terá a animação ou que vamos adicionar em breve

                    const interval = setInterval(() => {
                        counter--;
                        if (counter > 0) {
                            nomeSorteadoDisplay.textContent = counter;
                        } else {
                            clearInterval(interval);
                            const indiceSorteado = Math.floor(Math.random() * nomesArray.length);
                            nomeSorteadoDisplay.textContent = nomesArray[indiceSorteado];
                            sortearNomeBtn.disabled = false;
                        }
                    }, 1000);
                } else {
                    const indiceSorteado = Math.floor(Math.random() * nomesArray.length);
                    nomeSorteadoDisplay.textContent = nomesArray[indiceSorteado];
                }
            } else {
                nomeSorteadoDisplay.textContent = 'Por favor, insira nomes para sortear.';
            }
        });
    }
});