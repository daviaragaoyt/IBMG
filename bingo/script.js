// bingo/script.js

document.addEventListener('DOMContentLoaded', () => {
    const sortearBtn = document.getElementById('sortearBingoBtn');
    const reiniciarBtn = document.getElementById('reiniciarBingoBtn');
    const numeroDisplay = document.getElementById('numeroSorteado');
    const historicoGrid = document.getElementById('historicoGrid');

    let numerosSorteados = [];
    const MAX_NUMERO = 75;

    // Carregar estado se existir (opcional, mas bom pra UX)
    // Por enquanto, simples, reset ao recarregar

    function atualizarHistorico() {
        historicoGrid.innerHTML = '';
        // Mostra em ordem inversa (mais recente primeiro) ou ordem de sorteio?
        // Geralmente bingo mostra todos que saíram. Vamos mostrar na ordem que saíram.
        numerosSorteados.forEach(num => {
            const bola = document.createElement('div');
            bola.classList.add('bola-historico');
            bola.textContent = num;
            historicoGrid.appendChild(bola);
        });
    }

    function sortearNumero() {
        if (numerosSorteados.length >= MAX_NUMERO) {
            alert('Todos os números já foram sorteados!');
            sortearBtn.disabled = true;
            return;
        }

        let numero;
        do {
            numero = Math.floor(Math.random() * MAX_NUMERO) + 1;
        } while (numerosSorteados.includes(numero));

        numerosSorteados.push(numero);
        numeroDisplay.textContent = numero;

        // Adicionar ao histórico visualmente
        const bola = document.createElement('div');
        bola.classList.add('bola-historico');
        bola.textContent = numero;
        // Adiciona no começo para ver o último mais fácil, ou no fim? 
        // Vamos adicionar no começo da grid (prepend) para o úlitmo ficar evidente, 
        // ou criar uma área de "Últimos 5" e o grid completo.
        // O design atual tem um grid completo. Vou dar append para preencher.
        historicoGrid.appendChild(bola);

        // Scroll para baixo se necessário ou manter foco
    }

    function reiniciarJogo() {
        if (confirm('Tem certeza que deseja reiniciar o jogo? O histórico será apagado.')) {
            numerosSorteados = [];
            numeroDisplay.textContent = '-';
            historicoGrid.innerHTML = '';
            sortearBtn.disabled = false;
        }
    }

    if (sortearBtn) {
        sortearBtn.addEventListener('click', sortearNumero);
    }

    if (reiniciarBtn) {
        reiniciarBtn.addEventListener('click', reiniciarJogo);
    }
});
